---
name: fp-data-transforms
description: Transformations de données immutables et fonctionnelles pour pipelines de données complexes. Applicable aux calculs RPE→1RM, historiques de session, agrégations de logs d'entraînement.
category: data
risk: safe
source: sickn33/antigravity-awesome-skills + synthèse CANDITO
date_added: 2026-04-16
---

# FP DATA TRANSFORMS — Transformations fonctionnelles de données

## Quand utiliser

- Transformer des logs bruts (SessionLog[]) en données visuelles (courbes, tableaux)
- Calculer des dérivés depuis des données existantes (1RM estimé depuis RPE + poids)
- Agréger des séries de sets en résumés par exercice ou par semaine
- Normaliser des structures imbriquées en données plates pour les afficher
- Migrer un schéma de données sans toucher au stockage brut

## Principes fondamentaux

### 1. Immutabilité stricte
Ne jamais muter un objet existant. Toujours créer un nouvel objet.

```ts
// ❌ Mutation
sessionLog.exercises.push(newExercise)

// ✅ Immutable
const updatedLog = { ...sessionLog, exercises: [...sessionLog.exercises, newExercise] }
```

### 2. Transformer ≠ Stocker
Les données stockées (IndexedDB) sont les données brutes canoniques.
Les données affichées sont TOUJOURS calculées à la volée depuis les données brutes.
Ne jamais stocker un dérivé calculable.

```ts
// ❌ Stocker un dérivé
{ ..., total: squat + bench + deadlift }  // total est un dérivé !

// ✅ Calculer à l'affichage
const total = rm.squat + rm.bench + rm.deadlift
```

### 3. Pipeline pipe() pour lisibilité
Chaîner les transformations de gauche à droite plutôt qu'imbriquer des appels.

```ts
// ❌ Imbriqué et illisible
const result = formatKg(roundTo2_5(calcEpley(weight, reps)))

// ✅ Pipeline clair
const result = pipe(
  { weight, reps },
  ({ weight, reps }) => weight * (1 + reps / 30),   // Epley brut
  (raw) => Math.round(raw / 2.5) * 2.5,              // arrondi 2.5kg
  (rounded) => `${rounded} kg`                        // formatage
)
```

### 4. groupBy / mapValues pour les agrégations

```ts
// Regrouper les PRs par lift pour les graphes
const prsByLift = prs.reduce<Record<string, PR[]>>((acc, pr) => ({
  ...acc,
  [pr.lift]: [...(acc[pr.lift] ?? []), pr],
}), {})

// Max par lift
const maxPR = Object.fromEntries(
  Object.entries(prsByLift).map(([lift, records]) => [
    lift,
    records.reduce((max, pr) => pr.weight > max.weight ? pr : max)
  ])
)
```

### 5. Optional chaining + nullish coalescing pour sécurité

```ts
// ❌ Vérifications manuelles fragiles
const weight = log && log.exercises && log.exercises[0] && log.exercises[0].sets[0]
  ? log.exercises[0].sets[0].weight
  : null

// ✅ Optional chaining
const weight = log?.exercises?.[0]?.sets?.[0]?.weight ?? null
```

## Patterns CANDITO spécifiques

### Calcul 1RM depuis RPE + poids (Epley modifié)

```ts
// RPE → RIR (reps in reserve) estimées
const rirFromRpe = (rpe: number): number => Math.max(0, 10 - rpe)

// Epley modifié avec correction RPE
const estimateRM = (weight: number, reps: number, rpe?: number | null): number => {
  const effectiveReps = rpe ? reps + rirFromRpe(rpe) : reps
  const raw = weight * (1 + effectiveReps / 30)
  return Math.round(raw / 2.5) * 2.5
}
```

### Transformer SessionLog[] en résumés visuels

```ts
type SessionSummary = {
  sessionId: string
  date: string
  exercises: { name: string; topSet: { weight: number; reps: number; rpe?: number | null } | null }[]
}

const summarizeSessions = (logs: SessionLog[]): SessionSummary[] =>
  logs.map(log => ({
    sessionId: log.sessionId,
    date: log.date,
    exercises: log.exercises.map(ex => ({
      name: ex.exerciseName,
      topSet: ex.sets.length === 0 ? null : ex.sets.reduce((best, set) =>
        (set.weight ?? 0) > (best.weight ?? 0) ? set : best
      ),
    })),
  }))
```

### Agrégation volume hebdomadaire

```ts
const weeklyVolume = (logs: SessionLog[]): Record<string, number> =>
  logs.reduce<Record<string, number>>((acc, log) => {
    const week = log.date.slice(0, 7) // YYYY-MM
    const volume = log.exercises.flatMap(e => e.sets)
      .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0)
    return { ...acc, [week]: (acc[week] ?? 0) + volume }
  }, {})
```

## Anti-patterns

| ❌ Éviter | ✅ Faire à la place |
|----------|-------------------|
| Muter un objet state | `{ ...obj, field: newValue }` |
| Stocker un total calculable | Le calculer à l'affichage |
| `for` loops imbriqués | `flatMap` / `reduce` / `map` chaînés |
| Indexer les overrides par position | Indexer par `(exerciseName, lift)` |
| Calculs dans le render JSX | Extraire dans des hooks ou des fonctions pures |

## Règles non-négociables

1. **Zéro mutation** des données du state
2. **Données brutes = source of truth** — les dérivés ne se stockent jamais
3. **Null-safety obligatoire** — tous les accès à des propriétés imbriquées via `?.`
4. **Fonctions pures** — même entrée = même sortie, zéro side effects dans les transforms
