# Phase 2 — Migration Candito React

## Contexte
Phase 1 livrée : Dashboard (onglet Accueil) 100% fonctionnel. Les 4 autres onglets affichent un placeholder "Module en cours de migration…". Phase 2 = implémenter les 4 modules restants : **Warm-up**, **Programme**, **Nutrition**, **Progrès**.

Compétences appliquées :
- **Development.md** → Phase 2 Frontend Development
- **ULTIME UI-UX.md** → Direction artistique dark/editorial cohérente avec Phase 1

---

## Ordre d'implémentation (par dépendance)

```
1. lib/weightCalc.ts              ← utilitaire partagé, aucune dép
2. data/program.ts                ← ajouter s3/s4/s5/s6 + WEEK_SCHEDULE_MAP
3. hooks/useCanditoState.ts       ← ajouter setCurrentWeek()
4. hooks/useWorkoutSchedule.ts    ← utiliser WEEK_SCHEDULE_MAP + calcWeight
5. pages/Warmup.tsx               ← stateless, pur affichage
6. pages/Nutrition.tsx            ← stateless, pur affichage
7. pages/Progres.tsx              ← useCanditoState (rm, updateRM)
8. pages/Programme.tsx            ← useCanditoState (state, toggleSession, setCurrentWeek)
9. App.tsx                        ← brancher les 4 pages
```

---

## Étape 1 — `app/src/lib/weightCalc.ts` (nouveau fichier)

```typescript
/** Arrondi à la plaque 2.5 kg la plus proche */
export function calcWeight(rm: number, pct: number): number {
  if (!rm) return 0
  return Math.round((rm * pct) / 2.5) * 2.5
}
```

---

## Étape 2 — `app/src/data/program.ts` (modif)

**Ajouter** les semaines s3, s4, s5, s6_test, s6_dec dans `PROGRAM_DATA`.

**Remplacer** `SCHEDULE_MAP` par `WEEK_SCHEDULE_MAP` :

```typescript
export const WEEK_SCHEDULE_MAP: Record<string, Record<number, string | null>> = {
  s1s2:    { 1:'s12_lun', 2:'s12_mar', 3:null, 4:'s12_jeu', 5:'s12_ven', 6:'s12_sam', 0:null },
  s3:      { 1:'s3_lun',  2:'s3_mar',  3:null, 4:null,       5:'s3_ven',  6:null,      0:null },
  s4:      { 1:'s4_lun',  2:'s4_mar',  3:null, 4:null,       5:'s4_ven',  6:null,      0:null },
  s5:      { 1:'s5_lun',  2:'s5_mar',  3:null, 4:null,       5:null,      6:null,      0:null },
  s6_test: { 1:'s6_test_lun', 3:'s6_test_mer', 0:null, 2:null, 4:null, 5:null, 6:null },
  s6_dec:  { 1:'s6_dec_lun',  3:'s6_dec_mer',  0:null, 2:null, 4:null, 5:null, 6:null },
}
```

**Supprimer** l'ancien `SCHEDULE_MAP`.

**Ajouter** pour la nav du Programme :

```typescript
export const WEEK_ORDER = ['s1s2', 's3', 's4', 's5', 's6_test', 's6_dec'] as const
export type WeekId = typeof WEEK_ORDER[number]
```

**Data des nouvelles semaines** :

```
s3 (3 sessions) — 85-88%
  s3_lun → Squat LB 3×4-6 @85-88% | DL 2×4-6 @85-88% | HLR 2×10-15
  s3_mar → Bench 3×4-6 @85-88% | Rowing 2×6-8 | Face Pulls 3×15
  s3_ven → Larsen Press 3×4-6 @82-85% | Tractions 2×6-8 | Face Pulls 2×15

s4 (3 sessions) — 90-93%
  s4_lun → Squat 3×2-3 @90-93% | DL 2×2-3 @90-93%
  s4_mar → Bench 3×2-3 @90-93% | Rowing 2×5-6
  s4_ven → Bench 3×2-3 @90-92% | Face Pulls 2×15

s5 (2 sessions) — Tests AMRAP à 95%
  s5_lun → TEST Squat 1×max @95% | TEST DL 1×max @95%
  s5_mar → TEST Bench 1×max @95% | Rowing 3×8 | Face Pulls 2×15

s6_test (2 sessions) — Maxima
  s6_test_lun → Squat Opener @90-92% | 2ème @96-98% | PR @100-102%
              → DL Opener @90-92% | 2ème @96-98% | PR @100-102%
  s6_test_mer → Bench Opener @90-92% | 2ème @96-98% | PR @100-102%

s6_dec (2 sessions) — Décharge
  s6_dec_lun → Squat 2×3 @80% | DL 1×3 @80%
  s6_dec_mer → Bench 2×3 @80%
```

---

## Étape 3 — `app/src/hooks/useCanditoState.ts` (modif)

Ajouter l'action `setCurrentWeek` :

```typescript
const setCurrentWeek = useCallback((weekId: string) => {
  setState(prev => ({ ...prev, currentWeekId: weekId }))
}, [])
```

Ajouter au `return` : `setCurrentWeek`.

---

## Étape 4 — `app/src/hooks/useWorkoutSchedule.ts` (modif)

Remplacer le lookup `SCHEDULE_MAP` par `WEEK_SCHEDULE_MAP` :

```typescript
import { PROGRAM_DATA, WEEK_SCHEDULE_MAP } from '../data/program'
import { calcWeight } from '@/lib/weightCalc'

// Dans useMemo :
const weekSchedule = WEEK_SCHEDULE_MAP[state.currentWeekId] ?? {}
const sessionId = weekSchedule[new Date().getDay()] ?? null
```

Remplacer l'inline `Math.round((rm * percentage) / 2.5) * 2.5` par `calcWeight(rm, percentage)`.

---

## Étape 5 — `app/src/pages/Warmup.tsx` (nouveau)

**Structure** : header éditorial → 2 cartes glass (Bas du Corps / Haut du Corps)

Données hardcodées dans le fichier :

```
Bas du Corps (Squat) :
  Foam Rolling quad/fessiers/ischio | 1 | 60-90s/zone
  Cat-Camel | 2 | 10
  Hip Thrust activation | 3 | 10 BW
  Cossack Squat | 2 | 8/côté
  Dead Bugs | 2 | 8/côté
  Gamme Squat @40% | 1 | 8    ← isGamme: true → border-l-2 border-accent/40 pl-3 + poids affiché
  Gamme Squat @60% | 1 | 5
  Gamme Squat @75% | 1 | 3
  Gamme Squat @85% | 1 | 1

Haut du Corps (Bench) :
  Foam Rolling pecto/dorsaux | 1 | 60s/zone
  Face Pulls activation | 3 | 15 charge légère
  Élévations latérales | 2 | 12 haltères légers
  Gamme Bench @40% | 1 | 10   ← isGamme: true
  Gamme Bench @60% | 1 | 5
  Gamme Bench @75% | 1 | 3
```

Chaque rangée `isGamme` affiche le poids calculé via `calcWeight(rm[lift], pct)` — nécessite `useCanditoState` pour lire les 1RM.

---

## Étape 6 — `app/src/pages/Nutrition.tsx` (nouveau)

**Structure** : header éditorial → 3 cartes glass statiques

**Carte 1 — Macros (base 66 kg)**

| Nutriment | Jour entraînement | Jour repos | Protocole |
|---|---|---|---|
| Protéines | 132–145 g | 132–145 g | 2–2.2 g/kg — constant |
| Lipides | 60–70 g | 65–75 g | ~1 g/kg — hormonal |
| Glucides | 300–350 g | 200–250 g | Variable selon charge |
| Calories | ~2500–2700 | ~2200–2400 | Surplus S1-4, maintien S5-6 |

**Carte 2 — Timing des repas**

| Moment | Aliments | Objectif |
|---|---|---|
| Pré (1-2h avant) | Glucides complexes + Protéines | Energie & substrat |
| Intra (optionnel) | Glucides rapides | Maintien glycémique |
| Post (< 1h) | Whey + Glucides rapides | Récupération |

**Carte 3 — Hydratation & Suppléments**

Note : 3-4 L jours d'entraînement, 2.5-3 L repos.

| Supplément | Dose | Timing |
|---|---|---|
| Créatine monohydrate | 5 g/jour | N'importe quel moment |
| Caféine (optionnel) | 3-5 mg/kg | 30 min avant |
| Vitamine D | 2000-4000 UI | Avec repas gras |
| Magnésium | 300-400 mg | Le soir |

---

## Étape 7 — `app/src/pages/Progres.tsx` (nouveau)

**Structure** : header éditorial → SubTabBar (Charges | RPE) → panneau actif

**Local state** : `activeTab: 'charges' | 'rpe'` (défaut `'charges'`)

### Panneau Charges

3 inputs numériques (Squat / Bench / DL) pré-remplis depuis `state.athlete.rm`. Contrôlés via state local, `updateRM()` appelé au blur.

Style input : `bg-white/5 border border-border rounded-lg py-3 text-center text-xl font-display text-white w-full tabular-nums`

Tableau de charges (18 lignes) :

```typescript
const PERCENTAGES = [40,50,60,65,70,75,78,80,82,85,88,90,92,93,95,98,100,102]
const USAGE_MAP = {
  40:'Échauffement', 50:'Activation', 60:'Technique',
  65:'Accessoire', 70:'Volume', 75:'Gamme montante',
  78:'S1-2 bas', 80:'S1-2 / Décharge', 82:'S1-2 haut',
  85:'S3 bas', 88:'S3 haut', 90:'S4 / Opener S6',
  92:'S4 Bench', 93:'S4 haut', 95:'S5 AMRAP',
  98:'2ème tentative S6', 100:'PR égalisé', 102:'Nouveau PR'
}
```

Colonnes : `%` | Usage | Squat | Bench | DL. Lignes ≥ 95% : `bg-accent/5`. `tabular-nums text-right` sur les kg.

### Panneau RPE

Échelle 10 → 6 :

| RPE | RIR | Sensation |
|---|---|---|
| 10 | 0 | Effort maximal, impossible de continuer |
| 9 | 1 | 1 rép en réserve, vitesse lente |
| 8 | 2 | 2 reps, technique solide |
| 7 | 3 | 3 reps, rythme fluide |
| 6 | 4+ | Échauffement / Technique |

Règles d'autorégulation (carte) :
- RPE réel > cible de +1 → baisser de 2.5-5 kg
- RPE réel < cible de -1 → augmentation légère possible
- 3+ séances à RPE > 9 → mini-décharge (volume -40%)

Signaux d'alerte (carte + `AlertTriangle` icon) :
- Douleur articulaire aiguë
- Technique qui s'effondre sous charge
- Vertiges ou nausées persistantes
- RPE +2 vs semaine précédente à charges égales

---

## Étape 8 — `app/src/pages/Programme.tsx` (nouveau)

**State local** :
- `selectedWeekId: string` → initialisé à `state.currentWeekId`
- `s6Variant: 's6_test' | 's6_dec'` → défaut `'s6_test'`

**Hooks** : `useCanditoState()` + `calcWeight` de `@/lib/weightCalc`

### WeekSelector

Strip horizontal scrollable (`overflow-x-auto scrollbar-hide -mx-6 px-6`).

Pilules : **S1-2 | S3 | S4 | S5 | S6**. Actif : `bg-accent text-background font-bold`. Inactif : `bg-white/5 text-muted`.

Si `selectedWeekId.startsWith('s6')` → afficher sous le strip deux petits boutons "Test Maxis" / "Décharge" qui switchent `s6Variant` ET `selectedWeekId`.

### SessionCard

Carte glass par session. Header : jour (gauche) + bouton check `toggleSession` (droite).

Si `completedSessions.includes(session.id)` : `CheckCircle2` en `text-accent` + badge "DONE".

Chaque exercice :
- Nom (text-white)
- `sets × reps` (text-muted tabular-nums)
- Si `lift` && `percentage` : badge `[calcWeight(rm[lift], lo)]–[calcWeight(rm[lift], hi)] kg` en accent. Guard : si rm === 0, afficher `—`

### SetCurrentWeekButton

En bas de la page, dans le flux (non fixe).

- `selectedWeekId === state.currentWeekId` → "SEMAINE ACTIVE", désactivé, opacité 40%
- sinon → "ACTIVER CETTE SEMAINE" → `setCurrentWeek(selectedWeekId)`

---

## Étape 9 — `app/src/App.tsx` (modif)

```typescript
import { Warmup }    from '@/pages/Warmup'
import { Programme } from '@/pages/Programme'
import { Nutrition } from '@/pages/Nutrition'
import { Progres }   from '@/pages/Progres'

case 'warmup':    return <Warmup />
case 'programme': return <Programme />
case 'nutrition': return <Nutrition />
case 'progres':   return <Progres />
```

Supprimer le bloc `default` placeholder.

---

## Points d'attention

| Risque | Mitigation |
|---|---|
| `calcWeight(0, pct)` → `0 kg` | Guard `if (!rm) return null` → afficher `—` |
| `currentWeekId = 's6_test'` casse le Dashboard | `WEEK_SCHEDULE_MAP['s6_test']` couvert à l'étape 2 |
| Inputs RM dans Progres → rerenders | State local + `updateRM` au blur uniquement |
| Total sessions 17 hardcodé | Laisser pour Phase 2 (s6 test OU décharge, ~15 sessions) |

---

## Vérification end-to-end

1. `cd app && npm run build` — 0 erreur TypeScript
2. `npm run dev` — tester les 5 onglets à 375px
3. **Warmup** : poids des gammes calculés selon le 1RM stocké
4. **Programme** : sélectionner S3 → marquer session → Dashboard se met à jour
5. **Programme** : activer S4 → Dashboard "prochaine séance" reflète S4
6. **Nutrition** : scrollabilité du tableau de macros à 375px
7. **Progrès** : modifier 1RM Squat → tableau des charges recalculé en temps réel
8. **Progrès** : onglet RPE → lisibilité et contraste OK
9. `auto-deploy.py` → tester le build live sur l'iPhone
