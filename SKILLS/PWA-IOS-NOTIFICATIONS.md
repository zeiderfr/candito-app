---
name: pwa-ios-notifications
description: "Compétence ultime PWA + iOS Safari + Notifications + Offline pour React/Vite. Fusionne : safe areas iPhone, manifest.json, Service Worker lifecycle, Notification API client-side, offline-first localStorage, install UX iOS/Android. Source de vérité pour tout comportement natif de l'app."
category: pwa
risk: safe
source: "Fusion : iPhone PWA Adaptation + PWA Notifications + sickn33/antigravity-awesome-skills (building-native-ui, hig-patterns, progressive-web-app)"
date_added: "2026-04-14"
tags: [pwa, ios, safari, service-worker, notifications, offline, safe-area, manifest]
---

# PWA MOBILE — iOS Safari, Notifications & Offline

Compétence tout-en-un pour transformer une app React/Vite en PWA installable et native-like sur iOS et Android. Couvre : meta tags, safe areas, manifest, Service Worker, Notification API, offline-first, et install UX.

**Principe directeur : iOS is the hard case.** Si ça marche sur Safari/iOS en mode standalone, ça marche partout.

---

## 🎯 Quand utiliser ce skill

**Utiliser quand :**
- Configurer les meta tags iOS PWA (`apple-mobile-web-app-*`)
- Gérer le manifest.json (icônes, orientation, display, theme_color)
- Implémenter ou débugger le Service Worker (install, activate, fetch)
- Demander la permission de notification et afficher une notif côté client
- Gérer les safe areas iPhone (env(safe-area-inset-*), viewport-fit=cover)
- Implémenter la bannière d'installation iOS/Android
- Gérer l'offline (cache strategy, fallback page)

**Ne pas utiliser quand :**
- Les notifications sont envoyées depuis un serveur (VAPID, CRON) → BACKEND-CLOUDFLARE
- Le problème est lié aux performances de chargement → PERFORMANCE-PWA
- Le problème est purement visuel → UI-DESIGN-SYSTEM

---

## PARTIE 1 — Meta Tags & Manifest (Fondations)

### index.html — Tags obligatoires

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <!-- Viewport avec viewport-fit=cover pour activer env(safe-area-inset-*) -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

  <!-- PWA standalone iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <!-- black-translucent = status bar transparente, overlay sur le contenu -->
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="CANDITO">

  <!-- Icône écran d'accueil iOS -->
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- Manifest PWA -->
  <link rel="manifest" href="/manifest.json">
</head>
```

### public/manifest.json

```json
{
  "name": "Programme Candito",
  "short_name": "CANDITO",
  "description": "Programme de force 6 semaines — Suivi d'entraînement",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "orientation": "portrait",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/favicon.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

**Règles manifest :**
- `display: "standalone"` obligatoire pour iOS (pas `fullscreen`, pas `browser`)
- Icône ≥ 512×512 requise pour le prompt d'installation Chrome
- `theme_color` correspond à la couleur du status bar iOS

---

## PARTIE 2 — CSS Fondations iOS (index.css)

### Pattern complet iOS-ready

```css
@layer base {
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;  /* Supprime le flash gris au tap */
    touch-action: manipulation;                 /* Supprime le délai 300ms (double-tap zoom) */
  }

  body {
    min-height: 100dvh;                         /* dvh = dynamic viewport (iOS Safari aware) */
    padding-top: env(safe-area-inset-top);      /* Pousse sous notch/Dynamic Island */
    overscroll-behavior: none;                  /* Empêche le bounce de fond */
    background-color: #0a0a0a;
  }

  /* Prevent iOS auto-zoom sur input focus (font-size < 16px déclenche le zoom) */
  input, select, textarea {
    font-size: max(16px, 1em);
  }

  button, a, [role="button"] {
    cursor: pointer;
    touch-action: manipulation;
  }
}

/* Utilitaires safe area */
@layer utilities {
  .pt-safe  { padding-top: env(safe-area-inset-top); }
  .pb-safe  { padding-bottom: env(safe-area-inset-bottom); }
  .pb-safe-or-10 { padding-bottom: max(2.5rem, env(safe-area-inset-bottom)); }
}
```

### Pourquoi `100dvh` et pas `100vh`

- `vh` sur iOS Safari = hauteur avec barre d'adresse visible → overflow quand elle disparaît
- `dvh` = taille dynamique adaptée à la barre d'adresse → correct pour les apps

---

## PARTIE 3 — Safe Areas par Type d'Élément

### Principe

"Always account for safe area — both top and bottom."

| Type d'élément | Stratégie CSS | Raison |
|---|---|---|
| `body` | `padding-top: env(safe-area-inset-top)` | Pousse sous notch/Dynamic Island |
| BottomNav `fixed bottom-0` | `pb-[env(safe-area-inset-bottom)]` | Au-dessus du home indicator |
| Overlay `fixed inset-0` | Gérer sa propre safe area top | Ignore le padding body |
| Slide-up panel `fixed bottom-0` | `pb-[max(2.5rem,env(safe-area-inset-bottom))]` | Min visuel + home indicator |
| Contenu principal `main` | Breathing room visuel seulement | Body gère déjà le top |

### Fixed inset-0 — Pattern avec max()

```tsx
// ❌ Mauvais : pt-14 (56px) < Dynamic Island (59px) → contenu coupé
<div className="fixed inset-0 pt-14">

// ✅ Correct : max() garantit au moins le padding visuel OU la safe area si plus grande
<div
  className="fixed inset-0"
  style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}
>
```

### Exemple BottomNav

```tsx
<nav className="
  fixed bottom-0 left-0 right-0 z-50
  bg-background/90 backdrop-blur-xl border-t border-border
  pb-[env(safe-area-inset-bottom)]
">
  {/* tabs */}
</nav>
```

---

## PARTIE 4 — Touch Targets (Apple HIG)

Apple recommande **44×44 points minimum** pour tout élément tappable.

```tsx
// ✅ Touch target suffisant
<button className="size-11 flex items-center justify-center cursor-pointer">
  <Icon size={20} />
</button>

// ✅ Étendre la zone de tap (visuel petit, hit area grand)
<button className="p-3 -m-1 cursor-pointer">
  <X size={14} />
</button>

// ❌ Touch target trop petit — fréquemment manqué sur iPhone
<button className="size-6">
  <Icon size={14} />
</button>
```

---

## PARTIE 5 — Scroll iOS

### GPU compositing pour 60fps

```css
.scroll-container {
  transform: translateZ(0);      /* Force GPU layer */
  backface-visibility: hidden;
}
```

### Règles scroll

```css
/* ✅ Scroll natif momentum (iOS 13+) */
.scroll-area { overflow-y: auto; }

/* ❌ Déprécié depuis iOS 13 — ne pas utiliser */
/* -webkit-overflow-scrolling: touch; */

/* Contenir le bounce dans un container enfant */
.scroll-inner { overscroll-behavior-y: contain; }
```

---

## PARTIE 6 — Service Worker Lifecycle

### service-worker.js — Pattern complet

```javascript
const META_CACHE = 'app-meta'
const CACHE_VERSION = 'v3'

// ── INSTALL ──────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()  // Activation immédiate

  event.waitUntil(
    caches.open(META_CACHE).then(cache =>
      cache.match('installed').then(existing => {
        if (existing) {
          return cache.put('is-update', new Response('true'))
        } else {
          return cache.put('installed', new Response('true'))
        }
      })
    )
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() =>
      caches.open(META_CACHE).then(cache =>
        cache.match('is-update').then(isUpdate => {
          if (!isUpdate) return
          cache.delete('is-update')

          if (Notification.permission !== 'granted') return

          return self.registration.showNotification('App — Mise à jour', {
            body: 'Nouvelle version installée. Tap pour ouvrir.',
            icon: '/apple-touch-icon.png',
            badge: '/apple-touch-icon.png',
            tag: 'app-update',
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
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      return existing ? existing.focus() : clients.openWindow('/')
    })
  )
})

// ── MESSAGES ──────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
```

---

## PARTIE 7 — Notification API (Client-Side, sans VAPID)

### Contraintes plateforme

| Plateforme | `new Notification()` | `registration.showNotification()` | Permission |
|---|---|---|---|
| iOS 16.4+ (installé) | ❌ Bloqué | ✅ Fonctionne | Geste user obligatoire |
| Android Chrome | ✅ Fonctionne | ✅ Préféré | Libre |
| Desktop Chrome | ✅ Fonctionne | ✅ Préféré | Libre |

**Règle universelle : toujours utiliser `registration.showNotification()`.**

### Guard universel

```typescript
export const isPWANotifSupported = (): boolean =>
  'Notification' in window && 'serviceWorker' in navigator

export const getNotifPermission = (): NotificationPermission | null =>
  isPWANotifSupported() ? Notification.permission : null
```

### Envoyer une notification depuis React

```typescript
const showNotification = async (title: string, body: string): Promise<void> => {
  if (!isPWANotifSupported()) return
  if (Notification.permission !== 'granted') return

  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  await reg.showNotification(title, {
    body,
    icon: '/apple-touch-icon.png',
    badge: '/favicon.png',
    tag: 'training-reminder',  // déduplique (1 seule notif visible)
    renotify: false,
  })
}
```

### Composant NotificationBanner

```tsx
const DISMISSED_KEY = 'notif_dismissed'

export function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return setDismissed(true)
    setPermission(Notification.permission)
    if (localStorage.getItem(DISMISSED_KEY)) setDismissed(true)
  }, [])

  if (dismissed || permission !== 'default') return null

  const handleActivate = async () => {
    const result = await Notification.requestPermission()  // onClick — obligatoire iOS
    setPermission(result)
    setDismissed(true)
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
        <button onClick={handleActivate} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer">
          Activer
        </button>
        <button onClick={handleDismiss} className="text-muted hover:text-white transition-colors duration-200 cursor-pointer">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
```

---

## PARTIE 8 — Stratégies de Cache Service Worker

### Sélectionner la bonne stratégie selon la ressource

| Ressource | Stratégie | Comportement |
|-----------|-----------|--------------|
| JS/CSS/fonts (assets Vite) | **Cache-First** | Rapide, stale accepté (immutable hash dans le nom) |
| Pages HTML (`index.html`) | **Network-First** | Fraîcheur prioritaire, fallback offline |
| `version.json` | **Network-Only** | Jamais depuis le cache |
| Données localStorage | **Pas de SW** | Persistées directement, pas d'interception réseau |

### Cache-First — Assets statiques

```javascript
// service-worker.js
const STATIC_CACHE = `static-v${CACHE_VERSION}`
const STATIC_ASSETS = ['/', '/index.html', '/offline.html']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Assets versionnés (hash dans l'URL) → Cache-First
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(res => {
        const clone = res.clone()
        caches.open(STATIC_CACHE).then(c => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // HTML → Network-First avec fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    )
  }
})
```

### Stale-While-Revalidate — Contenu semi-statique

```javascript
// Pour les ressources qui peuvent être légèrement obsolètes
const swrFetch = async (request: Request): Promise<Response> => {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)

  const networkFetch = fetch(request).then(res => {
    cache.put(request, res.clone())  // Mise à jour en background
    return res
  })

  return cached ?? networkFetch  // Retourne le cache immédiatement si disponible
}
```

### Cache Versioning (obligatoire à chaque deploy)

```javascript
const CACHE_VERSION = 'v3'  // ← Incrémenter à chaque déploiement

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !key.includes(CACHE_VERSION))  // Purger les anciens caches
          .map(key => caches.delete(key))
      )
    ).then(() => clients.claim())
  )
})
```

### offline.html — Fallback obligatoire

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Programme Candito — Hors-ligne</title>
  <style>
    body { background: #0a0a0a; color: white; font-family: Inter, sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100dvh; margin: 0; text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p  { color: #86868B; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div>
    <h1>Hors-ligne</h1>
    <p>Reconnecte-toi pour accéder au programme.</p>
    <p style="margin-top: 1rem; font-size: 0.75rem;">Tes données sont sauvegardées localement.</p>
  </div>
</body>
</html>
```

---

## PARTIE 10 — Offline First (localStorage + SW Cache)

### Stratégie

```
1. Données utilisateur → localStorage (accès sync, toujours disponible)
2. Assets statiques → SW cache (CSS, JS, images — via Vite manifest)
3. version.json → no-cache (détection mise à jour)
4. service-worker.js → no-cache (toujours la dernière version)
```

### Cache Headers Cloudflare Pages (public/_headers)

```
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
```

### Détection de mise à jour (polling)

```typescript
const checkForUpdate = async (currentVersion: string): Promise<boolean> => {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    const { version } = await res.json()
    return version !== currentVersion
  } catch {
    return false  // Offline → pas de mise à jour
  }
}
```

---

## PARTIE 11 — Install UX iOS/Android

### Détection plateforme

```typescript
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isAndroid = () => /android/i.test(navigator.userAgent)
const isStandalone = () =>
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
  window.matchMedia('(display-mode: standalone)').matches

const shouldShowInstallBanner = () =>
  !isStandalone() &&
  (isIOS() || isAndroid()) &&
  !localStorage.getItem('install_dismissed')
```

### Android — beforeinstallprompt

```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault()  // Empêche le prompt natif immédiat
    setDeferredPrompt(e as BeforeInstallPromptEvent)
  }
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}, [])

const handleInstall = async () => {
  if (!deferredPrompt) return
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') setDismissed(true)
  setDeferredPrompt(null)
}
```

### iOS — instructions textuelles (pas d'API native)

```tsx
<p className="text-[11px] text-muted leading-relaxed">
  Tape <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-[10px]">⎙</span>{' '}
  puis <strong className="text-white">"Sur l'écran d'accueil"</strong> pour installer l'app.
</p>
```

---

## PARTIE 12 — Checklist PWA Complète

### HTML
- [ ] `viewport-fit=cover` dans le meta viewport
- [ ] `apple-mobile-web-app-capable` présent
- [ ] `apple-mobile-web-app-status-bar-style: black-translucent`
- [ ] `apple-touch-icon` présent
- [ ] `<link rel="manifest">` présent

### CSS (index.css)
- [ ] `-webkit-tap-highlight-color: transparent` sur `*`
- [ ] `touch-action: manipulation` sur `*`
- [ ] `overscroll-behavior: none` sur body
- [ ] `padding-top: env(safe-area-inset-top)` sur body
- [ ] `font-size: max(16px, 1em)` sur `input, select, textarea`
- [ ] `min-height: 100dvh` (pas `100vh`)

### Composants
- [ ] BottomNav : `pb-[env(safe-area-inset-bottom)]`
- [ ] Overlays `fixed inset-0` : `paddingTop: 'max(Xrem, env(safe-area-inset-top))'`
- [ ] Slide-up panels : `pb-[max(2.5rem,env(safe-area-inset-bottom))]`
- [ ] Boutons : surface ≥ 44×44px

### Service Worker
- [ ] `skipWaiting()` dans install
- [ ] `clients.claim()` dans activate
- [ ] `notificationclick` handler avec focus ou openWindow
- [ ] `message` handler pour SKIP_WAITING

### Notifications
- [ ] Guard `'Notification' in window && 'serviceWorker' in navigator`
- [ ] `requestPermission()` dans un onClick (jamais dans useEffect)
- [ ] `registration.showNotification()` (jamais `new Notification()`)
- [ ] Tag défini pour dédupliquer les notifs

### Cache (Cloudflare _headers)
- [ ] `service-worker.js` → no-cache
- [ ] `version.json` → no-cache
- [ ] Assets JS/CSS → immutable max-age=31536000

---

## PARTIE 13 — Anti-patterns

| Anti-pattern | Pourquoi |
|---|---|
| `min-height: 100vh` | Déborde sur iOS Safari — utiliser `100dvh` |
| `padding-bottom: env(...)` sur body | Scroll area inutilement plus haute — gérer dans les fixed |
| `pt-14` fixe dans `fixed inset-0` | Ne s'adapte pas au Dynamic Island — utiliser `max()` |
| `new Notification()` | Bloqué sur iOS — utiliser `registration.showNotification()` |
| `requestPermission()` dans useEffect | Bloqué iOS + mauvaise UX — utiliser onClick |
| Notification sans `tag` | Accumulation dans le centre de notifs |
| SW sans `clients.claim()` | Nouveau SW ne contrôle pas les pages ouvertes |
| Polling sans `cache: 'no-store'` | Browser cache la réponse → faux négatifs |
| `touch-action: none` sur container scrollable | Bloque le scroll natif |
| `-webkit-overflow-scrolling: touch` | Déprécié depuis iOS 13 — inutile |
