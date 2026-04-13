---
name: candito-power-skill
description: "Compétence ultime fusionnée pour le projet CANDITO. Combine PWA/notifications (progressive-web-app), Product Thinking/simplicité radicale (product-inventor), React/TypeScript strict (frontend-dev-guidelines), et architecture décisionnelle (architecture) — de sickn33/antigravity-awesome-skills. Référentiel de codage pour toutes les features CANDITO."
category: fusion
risk: safe
source: "Fusion sickn33/antigravity-awesome-skills : progressive-web-app + product-inventor + frontend-dev-guidelines + architecture"
date_added: "2026-04-13"
tags: [react, typescript, pwa, notifications, state-management, localStorage, product-thinking, architecture]
---

# CANDITO POWER SKILL — Compétence Ultime Fusionnée

> Fusion de 4 skills antigravity : **progressive-web-app** · **product-inventor** · **frontend-dev-guidelines** · **architecture**

---

## PARTIE 1 — Principes Inégociables (product-inventor)

> "Je n'implémente pas des features. J'invente des expériences."

### Les 5 Lois

**LOI 1 — SIMPLICITÉ RADICALE**
Supprime tout ce qui ne sert pas l'utilisateur en salle. L'athlète a les mains sales, le téléphone en mode portrait, 90 secondes de repos. Chaque tap compte. Si une feature demande une explication, elle est ratée.

**LOI 2 — LE DÉTAIL EST LE PRODUIT**
Espacement, typographie, feedback haptic, état de loading, transition. La différence entre une app qu'on utilise et une qu'on adore se joue dans 1000 micro-décisions.

**LOI 3 — ZÉRO FRICTION**
- Pas de modal bloquant au lancement
- Pas de permission demandée sans raison claire
- Pas de champ obligatoire sans valeur par défaut
- Le chemin critique (session → cocher exercice) doit être < 2 taps

**LOI 4 — DONNÉES FIRST**
Avant toute UI : les données existantes ? Comment les migrer ? Comment les archiver ? Un utilisateur qui perd ses PRs ne revient pas.

**LOI 5 — IOS IS THE HARD CASE**
Tout doit fonctionner sur Safari/iOS PWA installée. Si ça marche iOS, ça marche partout.

---

## PARTIE 2 — Stack de Référence CANDITO (frontend-dev-guidelines)

### Tech stack
```
React 19 + TypeScript strict
Vite 8 (build tool)
Tailwind CSS 4 (dark theme, glass morphism)
localStorage (persistence — pas de backend)
PWA + Service Worker (offline, notifications)
```

### Règles TypeScript

```typescript
// ✅ Toujours explicit
const updateRM = useCallback((newRM: Partial<RM>): void => {}, [])

// ✅ Interfaces explicites
interface NewCycleModalProps {
  isOpen: boolean
  onClose: () => void
  suggestedRM: RM
  cycleNumber: number
  onConfirm: (rm: RM) => void
}

// ❌ Jamais any
// ❌ Jamais assertion non null sans guard
```

### Pattern hooks CANDITO

```typescript
// Structure standard d'un hook
export function useMyHook(deps: Deps) {
  // 1. State local
  const [x, setX] = useState(...)
  
  // 2. Effects (mount seulement si possible)
  useEffect(() => {
    // logique
    return () => { /* cleanup */ }
  }, [])
  
  // 3. Callbacks (useCallback pour tout ce qui est passé en prop)
  const handleX = useCallback((): void => {}, [])
  
  // 4. Return object (jamais array sauf [value, setter])
  return { x, handleX }
}
```

### Styling Tailwind — Classes CANDITO existantes

```tsx
// Cards/containers
className="glass rounded-xl px-5 py-4 border border-border"

// Accent buttons (cyan)
className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer"

// Ghost buttons
className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"

// Icône accent badge
className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0"

// Texte principal
className="text-sm text-white font-medium"

// Texte secondaire
className="text-[11px] text-muted mt-0.5"
```

### Règles d'état CANDITO

- **Tout en localStorage** via `useCanditoState` — pas de state local pour les données persistantes
- **Migrations versionnées** — chaque changement de `CanditoState` = bump `version` + migration dans le parser
- **Immutabilité** — toujours spread, jamais mutation directe
- **useCallback** sur tous les updaters exportés depuis le hook

---

## PARTIE 3 — PWA Patterns CANDITO (progressive-web-app)

### Contraintes iOS — Non-Négociables

| Contrainte | ❌ Interdit | ✅ Correct |
|---|---|---|
| Afficher une notification | `new Notification()` | `reg.showNotification()` |
| Demander la permission | Au chargement | Dans un `onClick` |
| SW actif | Supposer qu'il tourne | Toujours `navigator.serviceWorker.getRegistration()` |
| Manifest requis | Optionnel | `<link rel="manifest">` obligatoire |

### Guard universel

```typescript
export const isPWANotifSupported = (): boolean =>
  'Notification' in window && 'serviceWorker' in navigator

export const getNotifPermission = (): NotificationPermission | null =>
  isPWANotifSupported() ? Notification.permission : null
```

### Pattern notification via Service Worker

```typescript
// ✅ Toujours via registration, jamais new Notification()
const showTrainingNotif = async (title: string, body: string): Promise<void> => {
  if (!isPWANotifSupported()) return
  if (Notification.permission !== 'granted') return
  
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return
  
  await reg.showNotification(title, {
    body,
    icon: '/apple-touch-icon.png',
    badge: '/favicon.png',
    tag: 'training-reminder',  // déduplique les notifs
    renotify: false,
  })
}
```

### Anti-patterns PWA

```
❌ Notification.requestPermission() dans useEffect sans geste user
❌ new Notification() (bloqué iOS)
❌ Supposer que le SW est actif au premier chargement
❌ Notifier sans tag (accumulation dans le centre de notifs)
❌ SW sans clients.claim() dans activate
```

### Service Worker — Handlers requis

```javascript
// install → skipWaiting
self.addEventListener('install', e => { self.skipWaiting() })

// activate → clients.claim()
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim())
})

// notificationclick → focus ou openWindow
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        const existing = list.find(c => c.url.includes(self.location.origin))
        return existing ? existing.focus() : clients.openWindow('/')
      })
  )
})
```

---

## PARTIE 4 — Architecture Décisionnelle CANDITO (architecture)

### Principe fondateur
> "Simplicité d'abord. Complexité seulement si prouvée nécessaire."

### Décisions architecturales prises (ADRs)

**ADR-01 — Pas de backend**
- Raison : app mono-utilisateur, PWA installée sur téléphone personnel
- Conséquence : tout en localStorage, pas de VAPID push

**ADR-02 — localStorage comme source de vérité**
- Raison : offline-first, pas de dépendance réseau
- Conséquence : migrations versionnées obligatoires, export/import manuel possible

**ADR-03 — Multi-cycles via archivage local**
- Raison : préserver l'historique sans backend, repartir de S1
- Conséquence : `CycleSnapshot[]` dans le state, `cycleHistory` append-only

**ADR-04 — Notifications sans VAPID**
- Raison : pas de serveur → Notification API client-side uniquement
- Conséquence : notification déclenchée à l'ouverture de l'app si jour d'entraînement
- Limite : ne fonctionne pas si l'app n'a pas été ouverte ce jour-là

### Checklist architecture avant de coder

- [ ] La feature marche sans réseau ?
- [ ] La migration est-elle backward-compatible ?
- [ ] Le state change entraîne-t-il une perte de données ?
- [ ] L'UX iOS est-elle testée (geste user pour permissions) ?
- [ ] TypeScript compile sans erreur ?

---

## PARTIE 5 — Checklist d'Implémentation CANDITO

### Nouvelle feature

```
1. Types d'abord    → types.ts
2. State ensuite    → useCanditoState.ts (+ migration si besoin)
3. Hook logique     → hooks/useFeature.ts
4. Composant UI     → components/ ou pages/
5. Build TypeScript → npm run build (0 erreur obligatoire)
```

### Nouveau composant

```
✅ Props interface explicite
✅ Tailwind classes du design system existant (glass, accent, muted)
✅ useCallback sur les handlers passés en prop
✅ Guard pour les APIs browser (Notification, SW)
✅ Textes en français (UI utilisateur)
✅ Mobile-first (touch targets > 44px)
```

### Nouveau hook

```
✅ Retourne un objet (pas un tableau sauf value/setter)
✅ Nettoyage des effects (return cleanup)
✅ Pas d'appels API directs (déléguer au state central)
✅ localStorage keys en constante au top du fichier
```

---

## Quand utiliser cette skill

- Toute implémentation dans le projet CANDITO
- Décisions architecturales (localStorage vs autre)
- Implémentation PWA/notifications
- Nouveau composant React/TypeScript
- Migration du state (nouveau champ dans CanditoState)
