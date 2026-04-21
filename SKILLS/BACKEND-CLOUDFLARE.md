---
name: backend-cloudflare
description: "Compétence Cloudflare Edge pour le projet : Pages Functions (API serverless), Scheduled Workers (cron VAPID push), KV Namespace (subscriptions), wrangler.toml, TypeScript Workers. Couvre l'architecture complète des notifications push server-side et le pipeline de déploiement Cloudflare Pages."
category: backend
risk: safe
source: "sickn33/antigravity-awesome-skills (cloudflare-workers-expert, appdeploy) + infrastructure réelle du projet CANDITO"
date_added: "2026-04-14"
tags: [cloudflare, workers, pages, kv, vapid, push-notifications, cron, serverless, wrangler, typescript]
---

# CLOUDFLARE EDGE — Workers, Pages Functions & VAPID Push

Compétence edge pour le backend serverless du projet. Couvre : Pages Functions, Scheduled Workers (cron), KV Namespace, VAPID web push, TypeScript Workers patterns, et pipeline de déploiement.

**Architecture réelle du projet :**
```
Cloudflare Pages           → Hébergement statique (app/dist/)
├── functions/api/         → Pages Functions (API serverless)
│   └── push-subscribe.ts  → POST /api/push-subscribe (subscribe/sync)
└── workers/               → Standalone Workers
    └── training-reminder  → Cron 0 8 * * * → VAPID push quotidien
KV Namespace CANDITO_SUBS  → Stockage subscriptions (TTL 90j)
```

---

## PARTIE 1 — TypeScript Types Workers

### Types fondamentaux (Cloudflare Workers)

```typescript
// Environnement injecté par Cloudflare (bindings wrangler.toml)
export interface Env {
  CANDITO_SUBS: KVNamespace;      // KV binding
  VAPID_PUBLIC_KEY: string;       // Variable d'env [vars]
  VAPID_PRIVATE_KEY: string;      // Secret (wrangler secret put)
}

// Handler principal d'un Worker
export default {
  // Requête HTTP normale
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('OK')
  },

  // Déclencheur scheduled (cron)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(doWork(env))  // Non-bloquant : répondre avant la fin du travail
  }
}
```

### Types Pages Functions

```typescript
// Cloudflare Pages Functions (dans /functions/)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const env = context.env          // Bindings KV, secrets
  const req = context.request      // Web standard Request
  const data = await req.json()    // Body parsing
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// OPTIONS → CORS preflight
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

---

## PARTIE 2 — KV Namespace Patterns

### Lire, écrire, supprimer

```typescript
// Écrire avec TTL (expire automatiquement après N secondes)
await env.CANDITO_SUBS.put(key, JSON.stringify(record), {
  expirationTtl: 60 * 60 * 24 * 90  // 90 jours
})

// Lire (retourne null si inexistant)
const data = await env.CANDITO_SUBS.get('sub:endpoint-url')
if (!data) return  // Clé inexistante ou expirée

const record = JSON.parse(data) as SubscriptionRecord

// Supprimer (ex: subscription expirée ou révoquée)
await env.CANDITO_SUBS.delete('sub:endpoint-url')

// Lister avec préfixe (pagination par défaut 1000)
const list = await env.CANDITO_SUBS.list({ prefix: 'sub:' })
for (const key of list.keys) {
  const value = await env.CANDITO_SUBS.get(key.name)
  // ...
}
```

### Pattern clé de subscription

```typescript
// Toujours préfixer les clés par type pour faciliter la pagination
const key = `sub:${subscription.endpoint}`  // Unique par endpoint

// Structure du record stocké
interface SubscriptionRecord {
  subscription: PushSubscription
  weekId: string      // Semaine CANDITO active (ex: 's3')
  name: string        // Optionnel
  lastSync: string    // ISO date
}
```

### Guard KV non lié

```typescript
// Vérifier que le binding KV est configuré (sinon erreur silencieuse)
if (!context.env.CANDITO_SUBS) {
  return new Response(JSON.stringify({
    error: "KV namespace 'CANDITO_SUBS' non lié.",
    help: "Dashboard → Pages → Settings → Functions → KV namespace bindings."
  }), { status: 500, headers: { 'Content-Type': 'application/json' } })
}
```

---

## PARTIE 3 — VAPID Push (Scheduled Worker)

### Architecture complète VAPID

```
Client (React)                 Cloudflare Edge           Navigateur
     │                              │                         │
     ├─ PushManager.subscribe() ───►│                         │
     │  (applicationServerKey)      │                         │
     │                              │                         │
     ├─ POST /api/push-subscribe ──►│ Pages Function          │
     │  { subscription, weekId }    │ → KV.put(key, record)   │
     │                              │                         │
     │                              │ ← 200 { success: true } │
     │                              │                         │
     │                              │ [cron 0 8 * * *]        │
     │                              │ Worker                  │
     │                              │ → KV.list('sub:')       │
     │                              │ → webpush.send()────────►│
     │                              │                         │ notification
```

### Worker schedulé — Pattern complet

```typescript
// workers/training-reminder.ts
import webpush from 'web-push'

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const vapidDetails = {
      subject: 'mailto:admin@programme-candito.pages.dev',
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    }

    const list = await env.CANDITO_SUBS.list({ prefix: 'sub:' })
    const dayOfWeek = new Date().getDay()  // 0 = Dimanche

    // Traiter en parallèle pour limiter le temps d'exécution
    await Promise.allSettled(
      list.keys.map(async (key) => {
        const data = await env.CANDITO_SUBS.get(key.name)
        if (!data) return

        const { subscription, weekId } = JSON.parse(data) as SubscriptionRecord
        const sessionId = WEEK_SCHEDULE_MAP[weekId]?.[dayOfWeek]
        if (!sessionId) return  // Pas d'entraînement aujourd'hui

        const payload = JSON.stringify({
          title: 'CANDITO — Rappel Séance',
          body: `Aujourd'hui : ${FOCUS_MAP[sessionId]}. Bonne chance !`,
          url: '/programme'
        })

        try {
          await webpush.sendNotification(subscription, payload, vapidDetails)
        } catch (err: any) {
          // Codes 410 (Gone) et 404 = subscription expirée/révoquée
          if (err.statusCode === 410 || err.statusCode === 404) {
            await env.CANDITO_SUBS.delete(key.name)  // Nettoyer la KV
          }
          // Autres erreurs : log silencieux, ne pas bloquer les autres abonnés
        }
      })
    )
  }
}
```

### Payload push — Format attendu par le Service Worker

```typescript
// Le Service Worker intercepte l'événement 'push' et affiche la notification
const payload = JSON.stringify({
  title: 'CANDITO — Rappel Séance',
  body: `Aujourd'hui : ${focus}. Bonne chance !`,
  url: '/programme',       // URL à ouvrir au clic
  icon: '/apple-touch-icon.png',
  badge: '/favicon.png',
  tag: 'training-reminder'
})
```

### Service Worker — Gérer l'événement push

```javascript
// service-worker.js — handler push
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/apple-touch-icon.png',
      badge: data.badge || '/favicon.png',
      tag: data.tag || 'candito',
      data: { url: data.url || '/' }
    })
  )
})

// Handler clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(event.notification.data?.url || '/')
    })
  )
})
```

---

## PARTIE 4 — React : PushNotificationManager

### Flow d'abonnement côté client

```typescript
// 1. Vérifier le support
const isSupported = 'serviceWorker' in navigator && 'PushManager' in window

// 2. Convertir la VAPID public key (base64url → Uint8Array)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array(Array.from(rawData).map(c => c.charCodeAt(0)))
}

// 3. S'abonner via PushManager
const reg = await navigator.serviceWorker.ready
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,  // Obligatoire
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
})

// 4. Enregistrer au backend
await fetch('/api/push-subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ subscription: sub, weekId: state.currentWeekId })
})
```

### Sync automatique de la semaine (sans re-demander la permission)

```typescript
// À chaque changement de semaine, mettre à jour le record KV
const syncSubscription = async (weekId: string): Promise<void> => {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return  // Pas encore abonné → rien à faire

  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, weekId })
  })
}

// Dans useEffect — se déclenche quand currentWeekId change
useEffect(() => {
  if (isSupported) syncSubscription(state.currentWeekId)
}, [state.currentWeekId])
```

### States UI du manager

```typescript
type PushStatus =
  | 'idle'        // Vérification en cours
  | 'prompt'      // Afficher la bannière (permission non encore demandée)
  | 'loading'     // Abonnement en cours
  | 'success'     // Abonné avec succès
  | 'unsupported' // PushManager non disponible

// Logique d'affichage de la bannière
const shouldShowBanner =
  status !== 'unsupported' &&
  Notification.permission !== 'denied' &&
  existingSubscription === null
```

---

## PARTIE 5 — wrangler.toml Configuration

### Structure complète du projet

```toml
# wrangler.toml (Worker schedulé)
name = "candito-training-reminder"
main = "workers/training-reminder.ts"
compatibility_date = "2026-04-14"

[[kv_namespaces]]
binding = "CANDITO_SUBS"
id = "15eeb67e39fa4b55b1e7105ebda9f11f"

[vars]
VAPID_PUBLIC_KEY = "BDudDlJbtu4YN-..."

[triggers]
crons = ["0 8 * * *"]  # 8h00 UTC chaque jour
```

```toml
# pages-wrangler.toml (Pages + Functions)
name = "programme-candito"
pages_build_output_dir = "app/dist"
compatibility_date = "2026-04-14"

[[kv_namespaces]]
binding = "CANDITO_SUBS"
id = "CANDITO_SUBS_ID_PLACEHOLDER"

[vars]
VAPID_PUBLIC_KEY = "BDudDlJbtu4YN-..."
```

### Secrets (ne jamais committer en clair)

```bash
# Stocker les secrets via Wrangler CLI (chiffré dans Cloudflare)
npx wrangler secret put VAPID_PRIVATE_KEY
# → Saisir la valeur en interactif

# Pour Pages Functions
npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name=programme-candito
```

---

## PARTIE 6 — Déploiement

### Pipeline auto-deploy

```python
# auto-deploy.py — pattern du projet
# 1. npm run build (app/dist/)
# 2. git push → Cloudflare Pages rebuild automatique
# 3. wrangler deploy → Worker schedulé mis à jour
```

### Commandes wrangler essentielles

```bash
# Développement local
npx wrangler dev workers/training-reminder.ts   # Worker en local
npx wrangler pages dev app/dist --kv=CANDITO_SUBS  # Pages + Functions + KV simulé

# Déploiement
npx wrangler deploy workers/training-reminder.ts   # Deploy Worker
npx wrangler pages deploy app/dist --project-name=programme-candito  # Deploy Pages

# Debug production
npx wrangler tail training-reminder    # Logs temps réel du Worker
npx wrangler kv:key list --binding=CANDITO_SUBS  # Lister les clés KV

# Tester le cron manuellement
npx wrangler dev --test-scheduled  # Déclenche scheduled() au lieu de fetch()
curl "http://localhost:8787/__scheduled?cron=0+8+*+*+*"  # Trigger manuel
```

### Cache Headers (_headers)

```
# public/_headers
/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate

/version.json
  Cache-Control: no-cache, no-store, must-revalidate

/manifest.json
  Cache-Control: public, max-age=86400

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## PARTIE 7 — Checklist Cloudflare Edge

### Configuration
- [ ] `CANDITO_SUBS` KV binding dans les deux wrangler.toml
- [ ] `VAPID_PUBLIC_KEY` dans `[vars]` (public → peut être en clair)
- [ ] `VAPID_PRIVATE_KEY` stocké via `wrangler secret put` (jamais commité)
- [ ] `crons = ["0 8 * * *"]` dans `[triggers]` du Worker

### Worker schedulé
- [ ] `Promise.allSettled()` pour paralléliser les envois push
- [ ] Suppression KV sur statusCode 410/404 (subscription expirée)
- [ ] `expirationTtl: 90 jours` sur chaque `KV.put()`
- [ ] Service Worker handler `push` présent dans `service-worker.js`
- [ ] Service Worker handler `notificationclick` avec `clients.openWindow()`

### Pages Function
- [ ] `onRequestOptions` pour CORS preflight
- [ ] Guard `!context.env.CANDITO_SUBS` avec message d'erreur clair
- [ ] Validation du body (`subscription.endpoint` obligatoire)
- [ ] Clé KV = `sub:${subscription.endpoint}` (unique par endpoint)

### Client React
- [ ] Guard `'serviceWorker' in navigator && 'PushManager' in window`
- [ ] `urlBase64ToUint8Array()` pour convertir la VAPID key
- [ ] `userVisibleOnly: true` dans `pushManager.subscribe()`
- [ ] `syncSubscription()` dans `useEffect` sur changement de `currentWeekId`
- [ ] Bannière uniquement si `permission !== 'denied'` et pas encore abonné

---

## PARTIE 8 — Anti-patterns

| Anti-pattern | Pourquoi |
|---|---|
| `VAPID_PRIVATE_KEY` dans `[vars]` ou commité | Compromet toute la sécurité push — utiliser `wrangler secret put` |
| `new Notification()` au lieu de VAPID | Notifications client-side uniquement, app doit être ouverte |
| `KV.list()` sans `prefix:` | Liste toutes les clés → lent + coûteux si volume élevé |
| `await Promise.all()` pour les pushes | Si un push échoue avec une exception non catchée, tout s'arrête — utiliser `allSettled()` |
| Ignorer statusCode 410/404 | Subscriptions expirées s'accumulent dans KV → nettoyage nécessaire |
| VAPID public key côté client en dur sans var d'env | Fonctionne mais difficile à faire tourner sans avoir la clé — documenter |
| Subscription non synchronisée lors d'un changement de semaine | L'utilisateur reçoit les notifs de la mauvaise semaine |
| Pages Function sans `onRequestOptions` | CORS bloqué sur iOS/Android pour les POST cross-origin |
