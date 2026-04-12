# Phase 2 — Améliorations Design (v2 enrichie)

## Contexte
Ce fichier complète `PLAN_PHASE2.md` (déjà implémenté). Il liste les 10 améliorations UX/design à intégrer sur les pages existantes de Phase 2.

Compétences appliquées :
- **ULTIME UI-UX.md** → transitions, interactions, navigation croisée, accessibilité, hiérarchie visuelle

---

## Convention transversale — Transitions de page

**Problème** : le Dashboard utilise `duration-500` (trop lent pour une navigation répétée).

**Fix sur toutes les pages** : chaque page root utilise cette classe d'entrée :

```tsx
<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
```

Mettre à jour le Dashboard pour `duration-300` également.

---

## 1. Navigation croisée depuis le Dashboard

### Nouveau fichier : `app/src/context/NavigationContext.tsx`

```tsx
import { createContext, useContext } from 'react'
import { type TabId } from '@/components/layout/BottomNav'

export const NavigationContext = createContext<(tab: TabId) => void>(() => {})
export const useNavigation = () => useContext(NavigationContext)
```

### `App.tsx` — Wrapper provider

```tsx
import { NavigationContext } from '@/context/NavigationContext'

return (
  <NavigationContext.Provider value={setActiveTab}>
    <AppLayout ...>
      ...
    </AppLayout>
  </NavigationContext.Provider>
)
```

### `NextSessionHero.tsx` — Brancher les CTA

```tsx
import { useNavigation } from '@/context/NavigationContext'

const navigate = useNavigation()

// Bouton principal :
<button onClick={() => navigate('programme')}>
  DÉMARRER LA SÉANCE
</button>

// État repos — Conseils Nutrition :
<button onClick={() => navigate('nutrition')}>
  CONSEILS NUTRITION
</button>

// État repos — Mobilité Active :
<button onClick={() => navigate('warmup')}>
  MOBILITÉ ACTIVE
</button>
```

---

## 2. CoachCard — Message dynamique par semaine

### `app/src/data/program.ts` — Ajouter COACH_MESSAGES

```typescript
export const COACH_MESSAGES: Record<string, { tone: string; message: string }> = {
  s1s2: {
    tone: 'Fondations',
    message: "Construisons les fondations. Volume élevé, RPE contrôlé — la fatigue est normale, c'est le signal que tu progresses."
  },
  s3: {
    tone: 'Transition',
    message: "Les charges montent. Reste technique sous la barre. Le physique s'adapte, le mental aussi."
  },
  s4: {
    tone: 'Acclimatation',
    message: "Acclimatation aux charges lourdes. Chaque rep compte. La confiance se construit maintenant."
  },
  s5: {
    tone: 'Peaking',
    message: "Semaine de test AMRAP. Pousse au maximum sur chaque mouvement — note chaque répétition."
  },
  s6_test: {
    tone: 'Jour J',
    message: "C'est le jour J. 6 semaines de travail pour ce moment. Confiance absolue dans le processus."
  },
  s6_dec: {
    tone: 'Récupération',
    message: "Semaine de décharge. Le travail est fait. Récupère pleinement — le prochain cycle commence bientôt."
  },
}
```

### `CoachCard.tsx` — Utiliser COACH_MESSAGES

```tsx
import { COACH_MESSAGES } from '@/data/program'
import { useCanditoState } from '@/hooks/useCanditoState'

// Dans le composant :
const { state } = useCanditoState()
const coaching = COACH_MESSAGES[state.currentWeekId] ?? COACH_MESSAGES['s1s2']

// Remplacer la version tag `v3.1.0-LiveTest` par :
<span className="text-[9px] text-dim/60 uppercase tracking-widest font-bold italic">
  {coaching.tone}
</span>

// Remplacer le texte hardcodé par :
<p className="text-muted text-sm leading-relaxed max-w-[90%]">
  {coaching.message}
</p>
```

---

## 3. WeekSelector — Indicateurs de progression par semaine

Dans `Programme.tsx`, chaque pilule affiche des dots (sessions complétées / total).

```typescript
const getWeekDots = (weekId: string) => {
  const resolvedId = weekId === 's6' ? s6Variant : weekId
  const week = PROGRAM_DATA[resolvedId]
  if (!week) return { total: 0, done: 0 }
  const total = week.sessions.length
  const done = week.sessions.filter(s =>
    state.progress.completedSessions.includes(s.id)
  ).length
  return { total, done }
}
```

Pilule enrichie :

```tsx
<button
  onClick={() => handleWeekSelect(pill.id)}
  className={cn(
    "flex flex-col items-center gap-1.5 px-5 py-3 rounded-pill shrink-0 transition-colors duration-200 cursor-pointer",
    isActive ? "bg-accent text-background font-bold" : "bg-white/5 text-muted hover:text-white hover:bg-white/10"
  )}
>
  <span className="text-[11px] font-bold uppercase tracking-wider">{pill.label}</span>
  <div className="flex gap-1">
    {Array.from({ length: dots.total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "size-1 rounded-full",
          i < dots.done
            ? (isActive ? "bg-background/60" : "bg-accent")
            : (isActive ? "bg-background/25" : "bg-white/20")
        )}
      />
    ))}
  </div>
</button>
```

---

## 4. Semaine 6 — Traitement visuel "Peak Event"

Dans `Programme.tsx` :

### S6VariantToggle

```tsx
{selectedWeekId.startsWith('s6') && (
  <div className="flex gap-2">
    {(['s6_test', 's6_dec'] as const).map(variant => (
      <button
        key={variant}
        onClick={() => { setS6Variant(variant); setSelectedWeekId(variant) }}
        className={cn(
          "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 cursor-pointer",
          s6Variant === variant
            ? "bg-accent/20 text-accent border border-accent/40"
            : "bg-white/5 text-muted border border-border hover:text-white"
        )}
      >
        {variant === 's6_test' ? '⚡ Test Maxis' : 'Décharge'}
      </button>
    ))}
  </div>
)}
```

### SessionCard S6 — Bordure accent + exercices PR en accent

```tsx
const isPeakSession = session.id.startsWith('s6_test')

<div className={cn(
  "glass p-6 rounded-card flex flex-col gap-5",
  isPeakSession && "border-l-4 border-accent"
)}>
```

Exercices contenant "PR" ou "Maxis" :
```tsx
const isPR = ex.name.toLowerCase().includes('pr') || ex.name.toLowerCase().includes('maxis')

<span className={cn("text-sm", isPR ? "text-accent font-bold" : "text-white/80")}>
  {ex.name}
</span>
```

---

## 5. SessionTimeline dans Progrès

Grille de pastilles, une par session, groupées par semaine. À placer en haut de la page Progrès, avant le SubTabBar.

```tsx
const SESSION_GROUPS = [
  { label: 'S1–2', weekId: 's1s2' },
  { label: 'S3',   weekId: 's3' },
  { label: 'S4',   weekId: 's4' },
  { label: 'S5',   weekId: 's5' },
  {
    label: 'S6',
    weekId: state.currentWeekId.startsWith('s6') ? state.currentWeekId : 's6_test'
  },
]

const totalSessions = SESSION_GROUPS.reduce((acc, g) => {
  return acc + (PROGRAM_DATA[g.weekId]?.sessions.length ?? 0)
}, 0)
```

Rendu :

```tsx
<div className="glass p-6 rounded-card space-y-4">
  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
    Avancement du programme
  </span>
  <div className="flex gap-6 flex-wrap">
    {SESSION_GROUPS.map(({ label, weekId }) => {
      const sessions = PROGRAM_DATA[weekId]?.sessions ?? []
      return (
        <div key={label} className="flex flex-col gap-2">
          <span className="text-[9px] text-dim uppercase font-bold">{label}</span>
          <div className="flex gap-1.5">
            {sessions.map(session => {
              const done = state.progress.completedSessions.includes(session.id)
              return (
                <div
                  key={session.id}
                  title={session.focus}
                  className={cn(
                    "size-3 rounded-full transition-colors duration-300",
                    done ? "bg-accent" : "bg-white/10 border border-white/15"
                  )}
                />
              )
            })}
          </div>
        </div>
      )
    })}
  </div>
  <p className="text-[11px] text-muted text-center tabular-nums">
    {state.progress.completedSessions.length} / {totalSessions} séances complétées
  </p>
</div>
```

---

## 6. Logging des PRs dans Progrès

Ajouter `addPR` à `useCanditoState` :

```typescript
const addPR = useCallback((lift: 'squat' | 'bench' | 'deadlift', weight: number, reps: number) => {
  const newPR: PR = {
    id: `${lift}_${Date.now()}`,
    lift, weight, reps,
    date: new Date().toISOString().split('T')[0]
  }
  setState(prev => ({
    ...prev,
    progress: { ...prev.progress, prs: [...prev.progress.prs, newPR] }
  }))
}, [])
```

Section PRs dans `Progres.tsx` :

```tsx
// Dernier PR par mouvement (plus lourd)
const lastPR = (lift: 'squat' | 'bench' | 'deadlift') =>
  [...state.progress.prs]
    .filter(p => p.lift === lift)
    .sort((a, b) => b.weight - a.weight)[0]
```

Affichage :

```tsx
<div className="glass p-6 rounded-card space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
      Records Personnels
    </span>
    <button
      onClick={() => setShowAddPR(v => !v)}
      className="text-[10px] font-bold text-accent uppercase tracking-wider cursor-pointer hover:text-white transition-colors duration-200"
    >
      {showAddPR ? 'Annuler' : '+ Enregistrer'}
    </button>
  </div>

  {/* Grid 3 colonnes : Squat / Bench / DL */}
  <div className="grid grid-cols-3 gap-4">
    {(['squat', 'bench', 'deadlift'] as const).map(lift => {
      const pr = lastPR(lift)
      return (
        <div key={lift} className="flex flex-col gap-1 text-center">
          <span className="text-[9px] text-muted/60 uppercase font-bold">{lift}</span>
          <span className="text-2xl font-display text-white tabular-nums">
            {pr ? pr.weight : '—'}
          </span>
          <span className="text-[10px] text-muted/40">kg</span>
          {pr && <span className="text-[9px] text-dim">{pr.date}</span>}
        </div>
      )
    })}
  </div>

  {/* Formulaire inline ajout PR */}
  {showAddPR && (
    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
      {(['squat', 'bench', 'deadlift'] as const).map(lift => (
        <div key={lift} className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-bold text-dim text-center">{lift}</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="kg"
            className="bg-white/5 border border-border rounded-input py-3 text-center
                       text-base font-display text-white w-full tabular-nums
                       focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60
                       placeholder:text-muted/30"
            onBlur={(e) => {
              const val = Number(e.target.value)
              if (val > 0) { addPR(lift, val, 1); setShowAddPR(false) }
            }}
          />
        </div>
      ))}
    </div>
  )}
</div>
```

---

## 7. Focus states sur les inputs RM (Progrès)

Tous les `<input>` dans la page Progrès (RM + PR) doivent avoir :

```tsx
className="... focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60"
```

State local pour les inputs RM (évite rerenders globaux) :

```typescript
const [localRM, setLocalRM] = useState({
  squat: state.athlete.rm.squat,
  bench: state.athlete.rm.bench,
  deadlift: state.athlete.rm.deadlift
})

const handleRMBlur = (lift: keyof RM, value: string) => {
  const num = Number(value)
  if (num > 0) {
    setLocalRM(prev => ({ ...prev, [lift]: num }))
    updateRM({ [lift]: num })
  }
}
```

---

## 8. Note protocole Wenning dans Warmup

Ajouter **avant les deux cartes** dans `Warmup.tsx` :

```tsx
<div className="glass px-5 py-4 rounded-xl border border-border">
  <p className="text-sm text-muted leading-relaxed">
    <span className="text-white font-semibold">Protocole Wenning — </span>
    2 exercices d'activation × 3 séries × 10 reps, tempo lent, charge légère.
    Focus : activation musculaire sans accumuler de fatigue avant la séance.
  </p>
</div>
```

---

## 9. Séparateur mobilité / gamme montante dans Warmup

Insérer entre les exercices de mobilité et les gammes :

```tsx
<div className="flex items-center gap-3 py-2">
  <div className="h-px flex-1 bg-border" />
  <span className="text-[9px] font-bold text-dim uppercase tracking-widest whitespace-nowrap">
    Gamme montante
  </span>
  <div className="h-px flex-1 bg-border" />
</div>
```

---

## 10. Rangées gamme avec poids calculé

Chaque rangée `isGamme: true` dans Warmup :

```tsx
<div className="flex justify-between items-center py-3
                border-l-2 border-accent/40 pl-3
                border-b border-border/30 last:border-b-0">
  <div className="flex flex-col gap-0.5">
    <span className="text-white text-sm">{ex.name}</span>
    <span className="text-muted text-xs tabular-nums">{ex.sets} × {ex.reps}</span>
  </div>
  <span className="text-accent font-bold tabular-nums text-sm shrink-0">
    {rm > 0 ? `${calcWeight(rm, ex.pct)} kg` : '—'}
  </span>
</div>
```

Guard : si `rm === 0` (profil non initialisé) → afficher `—` au lieu de `0 kg`.

---

## Récapitulatif des fichiers impactés

| Fichier | Action |
|---|---|
| `app/src/context/NavigationContext.tsx` | **Nouveau** — contexte navigation |
| `app/src/data/program.ts` | **Modif** — ajouter `COACH_MESSAGES` |
| `app/src/hooks/useCanditoState.ts` | **Modif** — ajouter `addPR()` |
| `app/src/App.tsx` | **Modif** — wrapper `NavigationContext.Provider` |
| `app/src/components/dashboard/CoachCard.tsx` | **Modif** — message dynamique |
| `app/src/components/dashboard/NextSessionHero.tsx` | **Modif** — CTA navigation + `duration-300` |
| `app/src/pages/Dashboard.tsx` | **Modif** — `duration-500` → `duration-300` |
| `app/src/pages/Warmup.tsx` | **Modif** — note Wenning + séparateur + poids gamme |
| `app/src/pages/Programme.tsx` | **Modif** — dots WeekSelector + S6 peak + toggle |
| `app/src/pages/Progres.tsx` | **Modif** — SessionTimeline + PRSection + focus states |

---

## Vérification

1. **Dashboard** : "DÉMARRER LA SÉANCE" → navigue vers Programme
2. **Dashboard** : "MOBILITÉ ACTIVE" → navigue vers Warmup
3. **Dashboard** : "CONSEILS NUTRITION" → navigue vers Nutrition
4. **Dashboard** : CoachCard affiche le message de la semaine active (`s1s2`, `s3`…)
5. **Programme** : dots WeekSelector reflètent les sessions complétées
6. **Programme** : S6 → toggle Test Maxis / Décharge fonctionnel + bordure accent visible
7. **Warmup** : note Wenning visible, séparateur présent, poids gamme calculés
8. **Progrès** : timeline pastilles synchronisée avec sessions complétées
9. **Progrès** : ajout d'un PR → apparaît dans Records Personnels
10. **Progrès** : inputs RM → focus ring visible (accent) + calcul au blur
11. Toutes les pages → transition `duration-300` cohérente
