---
name: architecture-patterns
description: Décisions structurées pour l'architecture et le refactoring de composants React. Code splitting, extraction de sous-composants, séparation des responsabilités. Appliqué au refactoring de Profil.tsx et au lazy-loading des pages.
category: architecture
risk: safe
source: sickn33/antigravity-awesome-skills + synthèse CANDITO
date_added: 2026-04-16
---

# ARCHITECTURE PATTERNS — Décisions structurées

## Quand utiliser

- Un fichier dépasse 300 lignes avec plusieurs responsabilités distinctes
- Tu dois ajouter une feature dans un composant déjà complexe
- Le bundle initial charge du code qui n'est pas nécessaire au premier écran
- Un composant est difficile à tester ou à déboguer en isolation

## Principe directeur

> **Commencer simple, compliquer seulement quand la nécessité est prouvée.**
> Refactorer basé sur la douleur réelle, pas sur l'anticipation théorique.

## Règle des 3 responsabilités

Un fichier/composant a un problème si :
- Il gère **3 responsabilités ou plus** (affichage + logique métier + appels données)
- Il dépasse **300 lignes**
- Il est **copié-collé** ailleurs avec des variations légères

Action : extraire en composants + hooks séparés.

## Code Splitting — React.lazy + Suspense

### Quand l'appliquer
- Pages entières non visibles au premier rendu
- Composants lourds (graphes, éditeurs) chargés conditionnellement
- Bibliothèques tierces utilisées sur une seule page

### Pattern CANDITO

```tsx
// App.tsx — Lazy loading des pages
import { lazy, Suspense } from 'react'

const Dashboard   = lazy(() => import('@/pages/Dashboard'))
const Warmup      = lazy(() => import('@/pages/Warmup'))
const Programme   = lazy(() => import('@/pages/Programme'))
const Nutrition   = lazy(() => import('@/pages/Nutrition'))
const Profil      = lazy(() => import('@/pages/Profil'))

// Fallback skeleton pendant le chargement
const PageFallback = () => (
  <div className="flex flex-col gap-4 p-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-shimmer h-20 rounded-2xl" />
    ))}
  </div>
)

// Dans le rendu :
<Suspense fallback={<PageFallback />}>
  {renderContent()}
</Suspense>
```

### Impact attendu sur CANDITO
- Profil.tsx (935 lignes + animejs) ne charge que quand l'onglet est visité
- Réduction bundle initial estimée : ~25-35%

## Extraction de sous-composants

### Règle d'extraction
Extraire un sous-composant quand :
1. Le bloc dépasse ~80 lignes dans le parent
2. Il a des props claires et délimitées
3. Il pourrait être réutilisé ou testé en isolation

### Structure cible pour Profil.tsx

```
app/src/
├── pages/
│   └── Profil.tsx              ← orchestration uniquement (~150 lignes)
└── components/
    └── profil/
        ├── AthleteHeroSection.tsx    ← header stats + RM
        ├── PRSection.tsx             ← records personnels + formulaire
        ├── RMField.tsx               ← champ RM individuel réutilisable
        ├── CycleHistorySection.tsx   ← cycles archivés
        └── BackupSection.tsx         ← export/import JSON
```

### Règle de prop drilling
Si un composant passe plus de 4 props à un enfant → envisager de passer le contexte directement (`useCandito()`) dans le sous-composant plutôt que de driller.

## Nommage et limites de modules

```
pages/          → Orchestration uniquement. Pas de logique métier.
components/     → UI avec props. Pas d'appels directs au state global.
hooks/          → Logique réutilisable (useTimer, useWorkoutSchedule...).
lib/            → Fonctions pures sans React (calcWeight, epley, formatDate).
data/           → Données statiques et types. Zéro side effects.
context/        → State global partagé. Un contexte = une responsabilité.
```

## React.memo — Quand et comment

### Appliquer uniquement si :
- Le composant se re-rend souvent sans que ses props changent
- Le composant est coûteux à rendre (liste longue, graphe SVG)

### Pattern

```tsx
// Avant : re-render à chaque mise à jour du state parent
export function NextSessionHero({ workoutState, getWeight }: Props) { ... }

// Après : ne re-render que si workoutState ou getWeight changent
export const NextSessionHero = React.memo(
  function NextSessionHero({ workoutState, getWeight }: Props) { ... }
)
```

### Composants CANDITO à mémoïser en priorité
1. `NextSessionHero` — affiché sur le Dashboard, recalcul coûteux
2. `SessionCard` dans Programme — liste de cards, toggle fréquent
3. `AthleteStats` — graphe SVG + animejs

## Architecture Decision Record (ADR) — Format léger

Avant toute décision architecturale majeure, noter :

```
Décision : [Quoi]
Contexte : [Pourquoi maintenant]
Options envisagées : [A, B, C]
Choix retenu : [Lequel et pourquoi]
Conséquences : [Ce qu'on gagne, ce qu'on sacrifie]
```

## Anti-patterns

| ❌ Éviter | ✅ Faire à la place |
|----------|-------------------|
| Pages > 500 lignes | Extraire sous-composants dans `components/feature/` |
| `import` tout au démarrage | `React.lazy` pour les pages et libs tierces |
| Props drilling > 3 niveaux | `useCandito()` directement dans le sous-composant |
| Logique métier dans le JSX | Hook personnalisé ou fonction pure dans `lib/` |
| Copier-coller un bloc de code | Extraire en composant ou fonction réutilisable |

## Règles non-négociables

1. **Une page = orchestration**, pas de logique métier inline
2. **Lazy-load obligatoire** pour les pages et les libs > 50KB
3. **300 lignes max** par fichier — au-delà, extraire sans négocier
4. **Pas d'abstraction prématurée** — n'extraire que ce qui existe en double ou en triple
