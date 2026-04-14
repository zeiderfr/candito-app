---
name: product-engineer
description: "Compétence ultime d'architecture produit pour PWA fitness React/TypeScript. Fusionne philosophie produit (product-inventor), stack CANDITO (frontend-dev-guidelines), architecture décisionnelle, workflow de développement, et process de conception. Source de vérité pour toute implémentation du projet."
category: architecture
risk: safe
source: "Fusion : CANDITO-POWER-SKILL + Development + Brainstorming + sickn33/antigravity-awesome-skills (frontend-dev-guidelines, fp-react, hig-patterns)"
date_added: "2026-04-14"
tags: [react, typescript, pwa, architecture, product-thinking, workflow, state-management]
---

# PRODUCT ENGINEER — Architecture & Philosophie Produit

Compétence maîtresse pour toute implémentation dans le projet. Combine philosophie produit, stack de référence, patterns React/TypeScript, architecture décisionnelle, et workflow de développement.

---

## PARTIE 1 — Les 5 Lois Inégociables

> "Je n'implémente pas des features. J'invente des expériences pour un athlète en salle."

**LOI 1 — SIMPLICITÉ RADICALE**
Supprime tout ce qui ne sert pas l'utilisateur en salle. L'athlète a les mains sales, le téléphone en mode portrait, 90 secondes de repos. Chaque tap compte. Si une feature demande une explication, elle est ratée.

**LOI 2 — LE DÉTAIL EST LE PRODUIT**
Espacement, typographie, feedback tap, état de loading, transitions. La différence entre une app qu'on utilise et une qu'on adore se joue dans 1000 micro-décisions.

**LOI 3 — ZÉRO FRICTION**
- Pas de modal bloquant au lancement
- Pas de permission demandée sans raison claire et contexte
- Pas de champ obligatoire sans valeur par défaut intelligente
- Le chemin critique (ouvrir l'app → cocher un set) : < 2 taps

**LOI 4 — DONNÉES FIRST**
Avant toute UI : les données existent ? Comment les migrer ? Comment les archiver ? Un utilisateur qui perd ses PRs ne revient jamais.

**LOI 5 — iOS IS THE HARD CASE**
Tout doit fonctionner sur Safari/iOS PWA installée. Si ça marche sur iOS standalone, ça marche partout.

---

## PARTIE 2 — Stack de Référence

```
React 19 + TypeScript strict (no any, explicit return types)
Vite 8 (build tool)
Tailwind CSS 4 (dark theme, glassmorphism, mobile-first)
Framer Motion 12 (animations, page transitions)
localStorage via idb-keyval (persistence — pas de backend)
PWA + Service Worker (offline, notifications update)
Cloudflare Pages (hébergement, edge caching)
```

### Structure de fichiers (feature-based)

```
app/src/
├── types.ts              ← types globaux, interfaces CanditoState
├── App.tsx               ← routing, AnimatePresence
├── context/              ← providers React
├── hooks/
│   ├── useCanditoState.ts  ← source de vérité (localStorage)
│   └── use{Feature}.ts   ← hooks par feature
├── pages/                ← une page par tab (Accueil, Warmup, etc.)
├── components/
│   ├── common/           ← composants partagés (NotificationBanner, etc.)
│   └── {feature}/        ← composants spécifiques
├── lib/                  ← utilitaires (weightCalc, cn, etc.)
└── data/                 ← données statiques du programme
```

---

## PARTIE 3 — Patterns TypeScript

### Règles TypeScript strictes

```typescript
// ✅ Interfaces explicites avec props nommées
interface WorkoutCardProps {
  session: Session
  isActive: boolean
  onComplete: (sessionId: string) => void
}

// ✅ Return types explicites sur toutes les fonctions
const calculateWeight = (rm: number, pct: number): number => {
  return Math.round(rm * pct / 100 / 2.5) * 2.5
}

// ✅ import type pour les types seuls
import type { SetLog, ExerciseLog } from '@/types'

// ❌ Jamais
const x: any = ...
const fn = (data) => data.something  // param implicitement any
```

### États impossibles → types discriminants

```typescript
// ✅ RemoteData pattern — 4 états exhaustifs, zéro boolean de loading
type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

// Usage dans un composant
function SessionView({ data }: { data: RemoteData<Session> }) {
  if (data.status === 'loading') return <Skeleton />
  if (data.status === 'error') return <ErrorState message={data.error} />
  if (data.status === 'idle') return null
  return <SessionContent session={data.data} />  // TypeScript sait que data.data existe
}

// ✅ Option — valeur qui peut être absente (pas de undefined flottant)
type Option<T> = { _tag: 'None' } | { _tag: 'Some'; value: T }
const none: Option<never> = { _tag: 'None' }
const some = <T>(value: T): Option<T> => ({ _tag: 'Some', value })
```

### Pattern hooks CANDITO

```typescript
// Structure standard d'un hook CANDITO
export function useMyFeature(deps: FeatureDeps) {
  // 1. State local (UI transitoire uniquement)
  const [isOpen, setIsOpen] = useState(false)

  // 2. Données du state global
  const { state, updateRM } = useCanditoState()

  // 3. Effects (mount seulement si possible)
  useEffect(() => {
    // logique d'initialisation
    return () => { /* cleanup obligatoire */ }
  }, [])

  // 4. Callbacks stables (useCallback sur tout ce qui est passé en prop)
  const handleConfirm = useCallback((value: number): void => {
    updateRM({ squat: value })
  }, [updateRM])

  // 5. Return object (jamais array sauf [value, setter])
  return { isOpen, setIsOpen, handleConfirm }
}
```

### FFCI — Score de faisabilité avant implémentation

Avant de coder une nouvelle feature, évaluer :

```
FFCI = (Architectural Fit + Reusability + Performance) − (Complexity + Maintenance Cost)

≥ 10 → Implémenter
6–9  → Implémenter avec précautions
≤ 5  → Repenser l'approche
```

---

## PARTIE 4 — État & Persistence

### Règles de state CANDITO

- **Tout en localStorage** via `useCanditoState` — pas de state local pour les données persistantes
- **Migrations versionnées** — chaque changement de `CanditoState` = bump `version` + migration
- **Immutabilité** — toujours spread, jamais mutation directe
- **useCallback** sur tous les updaters exportés depuis le hook
- **Clés localStorage** définies en constantes en haut du fichier

```typescript
// ✅ Pattern migration safe
const STORAGE_KEY = 'candito_state_v3'

const parseState = (raw: string): CanditoState => {
  const data = JSON.parse(raw)
  // Migration des champs manquants (backward-compatible)
  data.progress.sessionLogs = data.progress.sessionLogs ?? []
  data.progress.cycleHistory = data.progress.cycleHistory ?? []
  return data
}

// ✅ Updater immutable
const updateRM = useCallback((newRM: Partial<RM>): void => {
  setState(prev => ({
    ...prev,
    athlete: { ...prev.athlete, rm: { ...prev.athlete.rm, ...newRM } }
  }))
}, [])
```

---

## PARTIE 5 — Architecture Décisionnelle (ADRs)

**ADR-01 — Pas de backend**
Raison : app mono-utilisateur, PWA installée sur téléphone personnel.
Conséquence : tout en localStorage, pas de VAPID push server.

**ADR-02 — localStorage comme source de vérité**
Raison : offline-first obligatoire, pas de dépendance réseau.
Conséquence : migrations versionnées obligatoires, export/import manuel.

**ADR-03 — Multi-cycles via archivage local**
Raison : préserver l'historique sans backend.
Conséquence : `CycleSnapshot[]` dans le state, `cycleHistory` append-only.

**ADR-04 — Notifications sans VAPID**
Raison : pas de serveur → Notification API client-side uniquement.
Limite : ne fonctionne que si l'app a été ouverte le jour J.

**ADR-05 — React 19 + Vite (pas Next.js)**
Raison : PWA pure — pas de SSR nécessaire, bundle léger, Cloudflare Pages statique.

### Checklist architecture avant de coder

- [ ] La feature fonctionne sans réseau ?
- [ ] La migration est backward-compatible (anciens localStorage) ?
- [ ] Le changement de state ne provoque pas de perte de données ?
- [ ] L'UX iOS est testée (geste user requis pour permissions) ?
- [ ] `npm run build` dans `/app/` = 0 erreur TypeScript ?

---

## PARTIE 6 — Workflow de Développement

### Séquence pour une nouvelle feature

```
1. TYPES D'ABORD         → types.ts (interfaces, discriminant unions)
2. STATE ENSUITE         → useCanditoState.ts (+ migration si nouveau champ)
3. HOOK MÉTIER           → hooks/useFeature.ts
4. COMPOSANT UI          → components/ ou pages/
5. BUILD TYPESCRIPT      → npm run build (0 erreur obligatoire)
6. TEST iOS Safari       → iPhone réel ou simulateur, PWA installée
```

### Checklist nouveau composant

```
✅ Props interface explicite (pas de spread {...props} sans typage)
✅ Tailwind classes du design system (glass, accent, muted, border)
✅ useCallback sur les handlers passés en prop
✅ Guard pour les APIs browser (Notification, SW, File)
✅ Textes en français (UI utilisateur francophone)
✅ Touch targets ≥ 44px (Apple HIG)
✅ Skeleton ou loader si chargement async
✅ Empty state avec CTA clair si données vides
```

### Checklist nouveau hook

```
✅ Retourne un objet (pas un array sauf [value, setter])
✅ Nettoyage des effects (return cleanup function)
✅ Pas d'appels localStorage directs (déléguer à useCanditoState)
✅ localStorage keys en constante au top du fichier
✅ Pas de useEffect pour ce qui peut être exprimé en logique de rendu
```

---

## PARTIE 7 — Process de Conception (avant d'implémenter)

Quand la feature est non-triviale ou ambiguë :

### 1. Comprendre d'abord

Avant de proposer une solution :
- Review l'état actuel du projet (fichiers, plans, décisions passées)
- Identifier ce qui existe vs ce qui est proposé
- Lister les contraintes implicites non confirmées

### 2. Questions ciblées (une à la fois)

- Quel problème concret l'athlète résout-il ?
- Critères de succès explicites
- Non-goals explicites (évite la scope creep)
- Préférer les questions à choix multiples

### 3. Gate de compréhension (obligatoire)

Avant de proposer une implémentation, résumer :
- Ce qui est construit et pourquoi
- Les hypothèses (marquées comme telles)
- Les questions non résolues

Demander confirmation avant de continuer.

### 4. Explorer 2–3 approches

- Toujours recommander une approche par défaut
- Trade-offs explicites : complexité, maintenabilité, risque
- YAGNI : ne pas sur-ingénierer

### 5. Log de décisions

Pour chaque décision clé :
- Ce qui a été décidé
- Les alternatives considérées
- Pourquoi cette option

---

## PARTIE 8 — Styling Tailwind CANDITO

### Classes récurrentes du design system

```tsx
// Containers/cards
className="glass rounded-xl px-5 py-4 border border-border"

// Titres de section
className="text-xs font-bold uppercase tracking-widest text-muted mb-3"

// Bouton accent
className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer"

// Bouton ghost
className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"

// Badge icône accent
className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0"

// Texte principal
className="text-sm text-white font-medium"

// Texte secondaire
className="text-[11px] text-muted mt-0.5"

// Données numériques (toujours tabular-nums)
className="text-2xl font-bold tabular-nums text-white"
```

### Tokens couleur CANDITO

```
Background principal : #0a0a0a
Surface cards : bg-white/4 (dark) / bg-white (light)
Accent rouge : var(--color-accent) = #FF3B30
Accent vert (deload/succès) : #34C759
Texte principal : white / #1D1D1F
Texte secondaire (muted) : #86868B
Bordures : rgba(255,255,255,0.07)
```

---

## Quand utiliser cette skill

- **Toujours** — pour toute implémentation dans le projet CANDITO
- Décisions architecturales (localStorage vs autre approche)
- Conception d'un nouveau hook ou composant
- Migration du state (nouveau champ dans CanditoState)
- Évaluation de faisabilité d'une feature (FFCI)
- Review de code pour conformité aux patterns du projet
