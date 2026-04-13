---
name: pwa-notifications
description: "Compétence ultime pour implémenter des notifications système (push-like) dans une PWA React/Vite sans backend. Fusionne browser-extension-builder (manifest V3 + SW lifecycle), appdeploy (déploiement Cloudflare Pages), et application-performance-optimization (caching + SW patterns). Couvre : manifest.json, Notification API, ServiceWorker lifecycle, permission UX, React integration, contraintes iOS."
category: pwa
risk: safe
source: "Synthèse de sickn33/antigravity-awesome-skills (browser-extension-builder, appdeploy, application-performance-optimization) + expertise PWA/Notification API"
date_added: "2026-04-13"
---

# PWA Notifications — Compétence Ultime (sans backend)

Compétence tout-en-un pour ajouter des **notifications système** à une PWA React + Vite hébergée sur Cloudflare Pages. 100% client-side : pas de VAPID keys, pas de serveur push, pas de base de données d'abonnements.

## Quand utiliser

- Notifier l'utilisateur d'une mise à jour disponible (update detection)
- Envoyer une alerte système depuis le Service Worker (app en arrière-plan)
- Implémenter une permission flow non-intrusive conforme iOS 16.4+
- Ajouter un `manifest.json` pour transformer un site en PWA installable

---

## 1. Prérequis & Contraintes Plateforme

### iOS Safari / PWA installée
| Contrainte | Détail |
|---|---|
| `new Notification()` | ❌ Bloqué sur iOS — toujours utiliser `registration.showNotification()` |
| Permission prompt | Doit être déclenché par un **geste utilisateur** (`onClick`) |
| iOS 16.4+ uniquement | Les notifications ne fonctionnent que si l'app est ajoutée à l'écran d'accueil |
| Manifest requis | Sans `manifest.json` lié dans `index.html`, les notifs iOS ne fonctionnent pas |

### Android Chrome / Desktop
- `new Notification()` fonctionne mais préférer `registration.showNotification()` pour l'uniformité
- Pas besoin d'être installé (mais recommandé)
- `Notification.requestPermission()` peut être appelé librement (avec modération)

### Guard universel
```typescript
// Toujours vérifier avant d'utiliser l'API
const notificationsSupported = 'Notification' in window && 'serviceWorker' in navigator
```

---

## 2. manifest.json — Fichier obligatoire

**Fichier :** `public/manifest.json`

```json
{
  "name": "Nom Complet de l'App",
  "short_name": "AppName",
  "description": "Description courte",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/favicon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Lier dans `index.html` :**
```html
<link rel="manifest" href="/manifest.json">
```

**Règles :**
- `display: "standalone"` est requis pour iOS (pas `fullscreen`, pas `browser`)
- Toujours inclure une icône ≥ 512×512 (requis Chrome install prompt)
- `theme_color` correspond à la couleur de la barre de statut iOS

---

## 3. Service Worker — Lifecycle & Notification

### Pattern "update detection via cache flag"

Le principe : détecter si c'est une première installation ou une mise à jour en persistant un flag dans le Cache API.

```javascript
// service-worker.js

const META_CACHE = 'app-meta'

// ── INSTALL ──────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting() // Activation immédiate sans attendre fermeture des onglets

  event.waitUntil(
    caches.open(META_CACHE).then(cache =>
      cache.match('installed').then(existing => {
        if (existing) {
          // Deuxième install+ → c'est une mise à jour
          return cache.put('is-update', new Response('true'))
        } else {
          // Toute première installation
          return cache.put('installed', new Response('true'))
        }
      })
    )
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() =>       // Prend contrôle de tous les clients immédiatement
      caches.open(META_CACHE).then(cache =>
        cache.match('is-update').then(isUpdate => {
          if (!isUpdate) return       // Pas une mise à jour → rien à faire
          cache.delete('is-update')   // Nettoyer le flag

          // Notifier uniquement si permission accordée
          if (Notification.permission !== 'granted') return

          return self.registration.showNotification('App — Mise à jour', {
            body: 'Nouvelle version installée. Tap pour ouvrir.',
            icon: '/apple-touch-icon.png',
            badge: '/apple-touch-icon.png',  // Icône petite (Android)
            tag: 'app-update',               // Déduplique les notifs (1 seule visible)
            renotify: false,
          })
        })
      )
    )
  )
})

// ── NOTIFICATION CLICK ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Si l'app est déjà ouverte → mettre au premier plan
      const existing = clientList.find(c => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      // Sinon → ouvrir une nouvelle fenêtre
      return clients.openWindow('/')
    })
  )
})

// ── MESSAGE ──────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
```

---

## 4. React — Demande de Permission (NotificationBanner)

### Règles de permission UX

- **Ne jamais** demander la permission au chargement de la page (bloqué iOS, mauvaise UX)
- Toujours déclencher `Notification.requestPermission()` dans un handler `onClick`
- Persister le "dismiss" en localStorage pour ne pas harceler l'utilisateur
- Ne plus montrer la bannière si `permission === 'granted'` ou `'denied'`

```tsx
// components/common/NotificationBanner.tsx
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const DISMISSED_KEY = 'notif_dismissed'

export function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Guards : API non supportée ou déjà décidé
    if (!('Notification' in window)) return setDismissed(true)
    setPermission(Notification.permission)
    if (localStorage.getItem(DISMISSED_KEY)) setDismissed(true)
  }, [])

  // Ne pas rendre si : non supporté, déjà décidé, ou dismissed
  if (dismissed || permission !== 'default') return null

  const handleActivate = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    setDismissed(true) // Disparaître dans tous les cas (accordé ou refusé)
    // Pas besoin de localStorage ici : permission !== 'default' → ne rend plus
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border">
      <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Bell size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">Notifications de mise à jour</p>
        <p className="text-[11px] text-muted mt-0.5">
          Reçois une alerte dès qu'une nouvelle version est disponible.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleActivate}
          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Activer
        </button>
        <button
          onClick={handleDismiss}
          className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
```

---

## 5. React — Déclencher une notification depuis UpdatePrompt

Quand l'app détecte une mise à jour en **foreground** (via polling `version.json`), déclencher aussi la notification système (le SW ne repassera pas par `activate`) :

```typescript
// Dans UpdatePrompt.tsx ou useUpdateDetection.ts

const triggerNotification = async () => {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  // tag: 'app-update' déduplique avec la notif SW (une seule visible)
  await reg.showNotification('App — Mise à jour disponible', {
    body: 'Une nouvelle version du programme est prête.',
    icon: '/apple-touch-icon.png',
    tag: 'app-update',
  })
}

// Appeler après setShow(true) dans checkUpdate()
setShow(true)
triggerNotification()
```

---

## 6. Cache Headers Cloudflare Pages

**Fichier :** `public/_headers`

```
/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate

/version.json
  Cache-Control: no-cache, no-store, must-revalidate

/manifest.json
  Cache-Control: public, max-age=86400
```

- `service-worker.js` et `version.json` doivent toujours être frais → `no-cache`
- `manifest.json` peut être mis en cache 24h

---

## 7. Déploiement — Checklist

```
1. npm run build          ← 0 erreur TypeScript
2. Copier dist/ à la racine (Cloudflare Pages lit la racine)
3. git add . && git commit -m "..." && git push
4. Attendre ~30s → Cloudflare Pages rebuilde automatiquement
5. Vérifier version.json en ligne : https://ton-app.pages.dev/version.json
```

---

## 8. Séquence de test end-to-end

| Étape | Action | Résultat attendu |
|---|---|---|
| 1 | Ouvrir l'app → onglet Dashboard | Bannière "Activer les notifications" visible |
| 2 | Taper "Activer" | Dialog système de permission iOS/Android |
| 3 | Accepter la permission | Bannière disparaît, `Notification.permission === 'granted'` |
| 4 | Déployer une nouvelle version | Cloudflare Pages rebuild |
| 5 | App en foreground | Notification système + bandeau UpdatePrompt |
| 6 | App en background (PWA installée) | Notification système reçue sans ouvrir l'app |
| 7 | Taper la notification | L'app s'ouvre / passe au premier plan |

---

## 9. Debugging

```javascript
// Console browser — vérifier l'état
console.log('Permission:', Notification.permission)
console.log('SW registered:', await navigator.serviceWorker.getRegistration())

// Forcer une notification de test (DEV uniquement)
const reg = await navigator.serviceWorker.ready
reg.showNotification('Test', { body: 'Notification de test', icon: '/apple-touch-icon.png' })

// Inspecter le cache SW
const cache = await caches.open('app-meta')
const keys = await cache.keys()
console.log('Meta cache keys:', keys.map(k => k.url))
```

---

## 10. Anti-patterns (JAMAIS)

| Anti-pattern | Pourquoi |
|---|---|
| `Notification.requestPermission()` au chargement | Bloqué iOS + mauvaise UX → taux de refus élevé |
| `new Notification()` sur iOS | Silencieusement ignoré — utiliser `reg.showNotification()` |
| Backend/VAPID pour un usage mono-utilisateur | Sur-ingénierie — le client-side couvre le besoin |
| Notification sans `tag` | Accumulation de notifs identiques dans le centre de notifs |
| SW sans `clients.claim()` dans activate | Le nouveau SW ne contrôle pas les pages ouvertes immédiatement |
| Polling `version.json` sans `cache: 'no-store'` | Le browser met en cache la réponse → faux négatifs |
