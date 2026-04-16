---
name: application-performance
description: Optimisation des performances React PWA. Profiling, lazy loading, memoization, bundle analysis, Core Web Vitals, IndexedDB optimisations. Cible LCP < 2.5s et bundle initial < 200KB gzip.
category: performance
risk: safe
source: sickn33/antigravity-awesome-skills + synthèse CANDITO
date_added: 2026-04-16
---

# APPLICATION PERFORMANCE — Optimisation React PWA

## Métriques cibles CANDITO

| Métrique | Cible | Actuel |
|---------|-------|--------|
| Bundle initial (gzip) | < 200KB | ~147KB ✅ |
| LCP mobile 4G | < 2.5s | Non mesuré |
| FID / INP | < 200ms | Non mesuré |
| Splash screen duration | < 600ms | 600ms (ok) |
| Offline fallback | Fonctionnel | ❌ White screen |

## Règle d'or

> **Profiler avant d'optimiser.** Ne jamais optimiser "par précaution". Identifier le vrai goulot d'étranglement, mesurer avant et après.

## Phase 1 — Profiling (avant toute optimisation)

### Bundle analysis
```bash
# Installer l'analyseur
npm install --save-dev rollup-plugin-visualizer

# Dans vite.config.ts :
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [react(), visualizer({ open: true, gzipSize: true })]

# Lancer le build avec visualisation
npm run build
```

### React DevTools
- **Profiler** : enregistrer un render, identifier les composants qui re-rendent inutilement
- **Highlight updates** : voir visuellement quels composants re-rendent au toggle d'une session

### Lighthouse CLI
```bash
npm install -g lighthouse
lighthouse https://ton-app.netlify.app --view
```

## Phase 2 — Optimisations frontend

### Code splitting (impact maximal)

```tsx
// Avant : tout chargé au démarrage
import { Profil } from '@/pages/Profil'           // 935 lignes + animejs
import { Programme } from '@/pages/Programme'     // 358 lignes

// Après : chargé à la demande
const Profil    = lazy(() => import('@/pages/Profil'))
const Programme = lazy(() => import('@/pages/Programme'))
```

**Économies attendues :**
- `animejs` (~60KB) ne charge que quand Profil est visité
- `Profil.tsx` (935 lignes) ne parse pas au démarrage

### React.memo — Éviter les re-renders inutiles

```tsx
// Pattern : mémoïser les composants "leaf" coûteux
export const SessionCard = React.memo(function SessionCard({ session, ... }: Props) {
  return (...)
}, (prev, next) => prev.session.id === next.session.id && prev.isCompleted === next.isCompleted)
```

**Règle :** Ne mémoïser que si le profiler confirme un re-render inutile fréquent.

### useMemo pour calculs coûteux

```tsx
// Calcul 1RM estimé depuis tous les logs — O(n) avec n = nombre de sets
const estimatedRM = useMemo(() =>
  suggestNewRM(state.progress.sessionLogs, state.progress.prs),
  [state.progress.sessionLogs, state.progress.prs]
)
```

### useCallback pour fonctions stables

```tsx
// Dans Programme.tsx — évite de re-créer la fonction à chaque render
const handleToggle = useCallback(
  (sessionId: string) => toggleSession(sessionId),
  [toggleSession]
)
```

## Phase 3 — PWA & Cache

### Service Worker — stratégies par ressource

```js
// service-worker.js — Pattern cache stratégique
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // JS/CSS/images → Cache First (assets hashés changent peu)
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML → Network First (toujours la dernière version)
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request))
    return
  }

  // version.json → Network Only (détection de mise à jour)
  if (url.pathname.includes('version.json')) {
    event.respondWith(fetch(request))
    return
  }
})
```

### Cache versioning automatique (éviter les stale caches)

```js
// Injecter le hash du build dans le nom du cache
// vite.config.ts → define: { __APP_VERSION__: JSON.stringify(Date.now()) }
const CACHE_NAME = `candito-cache-${__APP_VERSION__}`

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names
        .filter(name => name !== CACHE_NAME)
        .map(name => caches.delete(name))
      )
    )
  )
})
```

## Phase 4 — IndexedDB Optimisations

### Pattern actuel (problème)
```ts
// CanditoContext.tsx — écrit TOUT le state à chaque update
await set('candito-state', newState)  // serialise 50KB+ à chaque toggle de session
```

### Pattern optimisé (à terme)
```ts
// Écrire seulement les clés modifiées
await set('candito-progress', newState.progress)   // ~5KB
await set('candito-athlete', newState.athlete)     // ~200B
// Ne pas écrire athlete si seul progress a changé
```

## Métriques à mesurer régulièrement

```bash
# Taille du bundle gzip (à comparer avant/après chaque feature)
npm run build && ls -lh dist/assets/*.js | awk '{print $5, $9}'

# Core Web Vitals en local
npx web-vitals-cli https://localhost:4173
```

## Anti-patterns de performance

| ❌ Éviter | ✅ Faire à la place |
|----------|-------------------|
| Tout importer au niveau root | `React.lazy` pour pages et libs > 50KB |
| Re-créer des fonctions dans le render | `useCallback` sur les handlers passés en props |
| Calculer dans le render JSX | `useMemo` pour les calculs dérivés coûteux |
| `JSON.stringify(state)` entier sur chaque write | Écrire seulement les clés modifiées |
| Optimiser sans mesurer | Profiler d'abord, optimiser ensuite |
| `animation: all` en CSS | Animer uniquement `transform` et `opacity` |

## Règles non-négociables

1. **Mesurer avant d'optimiser** — Lighthouse + React DevTools Profiler
2. **Bundle initial < 200KB gzip** — surveiller à chaque ajout de dépendance
3. **Lazy-load obligatoire** pour les pages et les libs > 50KB
4. **Offline = fonctionnel** — le Service Worker doit retourner quelque chose, jamais white screen
5. **Animer uniquement transform + opacity** — jamais width/height/top/left
