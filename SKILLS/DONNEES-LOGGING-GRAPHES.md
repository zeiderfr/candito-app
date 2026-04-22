---
name: donnees-logging-graphes
description: "Compétence ultime pour le logging de séances, transformations FP, visualisation SVG de progression, KPIs sportifs, export/import JSON, et install PWA. Couvre : principes FP immutables, calcul Epley/1RM, modélisation TypeScript, SVG charts sans dépendance, KPI dashboard patterns, File API, et bannière d'installation iOS/Android."
category: data
risk: safe
source: "Fusion : Session Logging & Data + fp-data-transforms + sickn33/antigravity-awesome-skills (kpi-dashboard-design, claude-d3js-skill, fp-react)"
date_added: "2026-04-14"
tags: [data, typescript, svg, charts, kpi, logging, export, import, pwa-install, localStorage, fp, immutability, epley]
---

# DATA TRACKING — Logging, Visualisation & KPIs

Compétence tout-en-un pour : transformer et logger des séances d'entraînement, visualiser la progression en SVG pur (0 dépendance), afficher des KPIs sportifs, et gérer l'export/import de données.

---

## 🎯 Quand utiliser ce skill

**Utiliser quand :**
- Logger une séance d'entraînement (sets, reps, poids, RPE)
- Calculer le 1RM estimé via la formule Epley
- Construire des graphiques SVG de progression (sans librairie externe)
- Afficher des KPIs sportifs (volume, intensité, tendances)
- Implémenter l'export/import JSON des données utilisateur
- Appliquer des transformations FP immutables sur `SessionLog[]`

**Ne pas utiliser quand :**
- Le composant n'a pas de logique data (pur UI) → UI-DESIGN-SYSTEM
- Le backend de stockage est Cloudflare KV → BACKEND-CLOUDFLARE
- Le besoin est une animation sur les graphiques → ANIMATIONS-TRANSITIONS

---

## PARTIE 0 — Principes FP (Transformations immutables)

### Quand appliquer
- Transformer des `SessionLog[]` bruts en données visuelles (courbes, tableaux)
- Calculer des dérivés depuis des données existantes (1RM estimé depuis RPE + poids)
- Agréger des séries en résumés par exercice ou par semaine
- Migrer un schéma de données sans toucher au stockage brut

### 1. Immutabilité stricte — ne jamais muter le state

```ts
// ❌ Mutation
sessionLog.exercises.push(newExercise)

// ✅ Immutable
const updatedLog = { ...sessionLog, exercises: [...sessionLog.exercises, newExercise] }
```

### 2. Transformer ≠ Stocker

Les données IndexedDB sont les données brutes canoniques.
Les données affichées sont TOUJOURS calculées à la volée. Ne jamais stocker un dérivé.

```ts
// ❌ Stocker un dérivé
{ ..., total: squat + bench + deadlift }

// ✅ Calculer à l'affichage
const total = rm.squat + rm.bench + rm.deadlift
```

### 3. Calcul 1RM — Epley modifié avec correction RPE

```ts
const rirFromRpe = (rpe: number): number => Math.max(0, 10 - rpe)

const estimateRM = (weight: number, reps: number, rpe?: number | null): number => {
  const effectiveReps = rpe ? reps + rirFromRpe(rpe) : reps
  const raw = weight * (1 + effectiveReps / 30)
  return Math.round(raw / 2.5) * 2.5
}
```

### 4. groupBy / agrégation pour les graphes

```ts
// Regrouper les PRs par lift
const prsByLift = prs.reduce<Record<string, PR[]>>((acc, pr) => ({
  ...acc,
  [pr.lift]: [...(acc[pr.lift] ?? []), pr],
}), {})

// Volume hebdomadaire
const weeklyVolume = (logs: SessionLog[]): Record<string, number> =>
  logs.reduce<Record<string, number>>((acc, log) => {
    const week = log.date.slice(0, 7)
    const volume = log.exercises.flatMap(e => e.sets)
      .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0)
    return { ...acc, [week]: (acc[week] ?? 0) + volume }
  }, {})
```

### 5. Null-safety obligatoire

```ts
// ✅ Optional chaining partout sur les propriétés imbriquées
const weight = log?.exercises?.[0]?.sets?.[0]?.weight ?? null
```

### Anti-patterns FP

| ❌ Éviter | ✅ Faire à la place |
|----------|-------------------|
| Muter un objet state | `{ ...obj, field: newValue }` |
| Stocker un total calculable | Le calculer à l'affichage |
| `for` loops imbriqués | `flatMap` / `reduce` / `map` chaînés |
| Calculs dans le render JSX | Hook personnalisé ou fonction pure dans `lib/` |

---

## PARTIE 1 — Modélisation TypeScript

### Principes (impossible states)

- Utiliser des **types discriminants** — rendre les états impossibles irreprésentables
- `null` uniquement pour les champs vraiment optionnels
- Versionner les structures pour la migration safe
- Pas d'`undefined` flottant dans les données persistées

### Types de base

```typescript
// Séquence d'une série
interface SetLog {
  weight: number | null  // null = exercice au poids du corps
  reps: number           // reps réellement effectuées
  rpe: number | null     // RPE 6–10, null si non renseigné
}

// Log d'un exercice (N séries)
interface ExerciseLog {
  exerciseName: string
  sets: SetLog[]
}

// Log complet d'une séance
interface SessionLog {
  sessionId: string      // FK vers Session.id dans le programme
  date: string           // ISO YYYY-MM-DD
  exercises: ExerciseLog[]
}

// Entrée de progression (1RM historique)
interface PREntry {
  date: string           // ISO YYYY-MM-DD
  weight: number         // 1RM en kg
}

// Progression par lift
interface LiftProgress {
  squat: PREntry[]
  bench: PREntry[]
  deadlift: PREntry[]
}

// Snapshot d'un cycle (archivage multi-cycles)
interface CycleSnapshot {
  cycleNumber: number
  startDate: string
  endDate: string
  finalRM: { squat: number; bench: number; deadlift: number }
  sessionLogs: SessionLog[]
}
```

### RemoteData — états impossibles pour le chargement

```typescript
type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

// ✅ Rendu exhaustif sans boolean de loading
function ProgressView({ data }: { data: RemoteData<LiftProgress> }) {
  if (data.status === 'loading') return <Skeleton />
  if (data.status === 'error') return <ErrorState message={data.error} />
  if (data.status === 'idle') return null
  return <ProgressChart progress={data.data} />  // TypeScript garantit data.data
}
```

### Migration localStorage (obligatoire)

```typescript
const parseState = (raw: string): CanditoState => {
  const data = JSON.parse(raw)
  // Toujours migrer les champs manquants des anciennes versions
  data.progress.sessionLogs = data.progress.sessionLogs ?? []
  data.progress.cycleHistory = data.progress.cycleHistory ?? []
  data.progress.liftProgress = data.progress.liftProgress ?? { squat: [], bench: [], deadlift: [] }
  return data
}
```

### Action logSession — pattern idempotent

```typescript
const logSession = useCallback((log: SessionLog) => {
  setState(prev => ({
    ...prev,
    progress: {
      ...prev.progress,
      // Remplace si déjà loggée (idempotent — toujours la dernière version)
      sessionLogs: [
        ...prev.progress.sessionLogs.filter(l => l.sessionId !== log.sessionId),
        log
      ]
    }
  }))
}, [])
```

---

## PARTIE 2 — KPI Dashboard

### Règle d'or : 5–7 KPIs maximum par vue

Trop de métriques noient l'information. Choisir les KPIs qui actionnent une décision.

### KPIs prioritaires pour CANDITO

| KPI | Calcul | Affichage |
|-----|--------|-----------|
| **Squat 1RM actuel** | `athlete.rm.squat` | Hero metric |
| **Bench 1RM actuel** | `athlete.rm.bench` | Hero metric |
| **Deadlift 1RM actuel** | `athlete.rm.deadlift` | Hero metric |
| **Semaine actuelle** | `state.currentWeek` | Badge |
| **Séances complétées** | `completedSessions.length` | Compteur |
| **Progrès du cycle** | `completedSessions / totalSessions * 100` | Progress ring |
| **Dernier entraînement** | `sessionLogs[last].date` | Relative date |

### Pattern stat card (KPI)

```tsx
// Afficher un KPI clé avec contexte
function StatCard({ label, value, unit, delta }: {
  label: string
  value: number
  unit: string
  delta?: number  // null si pas de comparaison disponible
}) {
  return (
    <div className="glass rounded-xl px-4 py-3 border border-border">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums text-white">{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      {delta !== undefined && delta !== 0 && (
        <p className={cn(
          "text-[11px] font-semibold mt-0.5",
          delta > 0 ? "text-[#34C759]" : "text-accent"
        )}>
          {delta > 0 ? '+' : ''}{delta} kg vs cycle précédent
        </p>
      )}
    </div>
  )
}
```

### Progress ring KPI

```tsx
// Anneau de progression du cycle (0 → 100%)
function CycleRing({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : (completed / total) * 100
  return (
    <div className="flex flex-col items-center gap-2">
      <ProgressRing pct={pct} />  {/* Voir PARTIE 4 */}
      <p className="text-[11px] text-muted">{completed}/{total} séances</p>
    </div>
  )
}
```

---

## PARTIE 3 — SVG Chart — Courbe 1RM (0 dépendance)

### Principes

- Toujours `viewBox` + `preserveAspectRatio` pour le responsive
- Scales manuelles : `(val - min) / (max - min) * range`
- Padding interne pour éviter que les points soient coupés
- Guard pour les cas edge (0 points, 1 seul point)

### Template SVG line chart

```tsx
const CHART_W = 300
const CHART_H = 160
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 }

interface ChartPoint { date: string; weight: number }

function LiftProgressChart({ data, color }: { data: ChartPoint[]; color: string }) {
  if (data.length === 0) return <EmptyChartState />

  const dates = data.map(d => new Date(d.date).getTime())
  const weights = data.map(d => d.weight)
  const minTime = Math.min(...dates)
  const maxTime = Math.max(...dates)
  const yMin = Math.min(...weights) * 0.95
  const yMax = Math.max(...weights) * 1.05

  const innerW = CHART_W - PADDING.left - PADDING.right
  const innerH = CHART_H - PADDING.top - PADDING.bottom

  const xScale = (date: string): number => {
    if (dates.length < 2) return PADDING.left + innerW / 2
    const t = new Date(date).getTime()
    return PADDING.left + ((t - minTime) / (maxTime - minTime)) * innerW
  }

  const yScale = (weight: number): number => {
    const ratio = (weight - yMin) / (yMax - yMin)
    return CHART_H - PADDING.bottom - ratio * innerH
  }

  const polylinePoints = data.map(d => `${xScale(d.date)},${yScale(d.weight)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="xMidYMid meet" className="w-full">
      {/* Grille horizontale */}
      {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
        <g key={i}>
          <line
            x1={PADDING.left} y1={yScale(v)}
            x2={CHART_W - PADDING.right} y2={yScale(v)}
            stroke="rgba(255,255,255,0.06)" strokeWidth={1}
          />
          <text
            x={PADDING.left - 4} y={yScale(v) + 4}
            textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.3)"
          >
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* Courbe */}
      {data.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none" stroke={color} strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round"
        />
      )}

      {/* Points */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(d.date)} cy={yScale(d.weight)} r={3} fill={color} />
      ))}

      {/* Labels X */}
      {data.length > 1 && (
        <>
          <text x={PADDING.left} y={CHART_H - 6} textAnchor="start" fontSize={8} fill="rgba(255,255,255,0.3)">
            {new Date(data[0].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </text>
          <text x={CHART_W - PADDING.right} y={CHART_H - 6} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.3)">
            {new Date(data[data.length - 1].date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </text>
        </>
      )}
    </svg>
  )
}
```

### Couleurs des lifts

```typescript
const LIFT_COLORS = {
  squat:    'var(--color-accent)',      // rouge #FF3B30
  bench:    'rgba(255,255,255,0.6)',    // blanc medium
  deadlift: 'rgba(255,255,255,0.3)',    // blanc léger
} as const
```

### Chart multi-lifts

```tsx
// Afficher les 3 lifts sur le même SVG avec légende
function AllLiftsChart({ progress }: { progress: LiftProgress }) {
  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full">
        {/* grille partagée */}
        {Object.entries(LIFT_COLORS).map(([lift, color]) => (
          <LiftLine key={lift} data={progress[lift as keyof LiftProgress]} color={color} />
        ))}
      </svg>
      {/* Légende */}
      <div className="flex gap-4">
        {Object.entries(LIFT_COLORS).map(([lift, color]) => (
          <div key={lift} className="flex items-center gap-1.5">
            <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-muted capitalize">{lift}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## PARTIE 4 — Progress Ring SVG (Anime.js)

```tsx
import anime from 'animejs'

function ProgressRing({ pct, color = '#34C759' }: { pct: number; color?: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!ringRef.current) return
    anime({
      targets: ringRef.current,
      strokeDashoffset: [circumference, circumference * (1 - pct / 100)],
      duration: 1200,
      delay: 200,
      easing: 'spring(1, 60, 10, 0)'
    })
  }, [pct])

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      <circle
        ref={ringRef}
        cx="44" cy="44" r={radius}
        fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
      />
    </svg>
  )
}
```

---

## PARTIE 5 — UI Logging (Slide-up Panel)

### Quickpick RPE

```tsx
const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 10] as const

{RPE_VALUES.map(v => (
  <button
    key={v}
    onClick={() => setRpe(v)}
    className={cn(
      "size-10 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer",
      rpe === v ? "bg-accent text-white" : "bg-white/5 text-muted hover:text-white"
    )}
  >
    {v}
  </button>
))}
```

### Input poids avec pré-remplissage

```tsx
<input
  type="number"
  inputMode="decimal"
  value={weight ?? ''}
  onChange={e => setWeight(e.target.value === '' ? null : Number(e.target.value))}
  placeholder="—"
  className={cn(
    "bg-white/5 border border-border rounded-lg",
    "text-center text-2xl font-bold tabular-nums text-white w-full py-3",
    "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60",
    "transition-colors text-base"  // text-base = 16px min → pas de zoom iOS
  )}
/>
```

---

## PARTIE 6 — Export / Import JSON

### Export (download sans serveur)

```typescript
const handleExport = (state: CanditoState): void => {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `candito-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)   // REQUIS sur Safari
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)        // Libérer la mémoire
}
```

### Web Share API (iOS — partage natif)

```typescript
const handleShare = async (state: CanditoState): Promise<void> => {
  if (!navigator.share) { handleExport(state); return }  // Fallback download
  const json = JSON.stringify(state, null, 2)
  const file = new File([json], `candito-${Date.now()}.json`, { type: 'application/json' })
  try {
    await navigator.share({ files: [file], title: 'Sauvegarde Candito' })
  } catch {
    handleExport(state)  // Fallback si annulé ou non supporté
  }
}
```

### Import (FileReader)

```typescript
const handleImport = (
  file: File,
  onSuccess: (data: CanditoState) => void,
  onError: (msg: string) => void
): void => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as CanditoState
      // Guard minimal sur les clés critiques
      if (!data.athlete?.rm || !data.progress?.completedSessions) {
        throw new Error('Structure de fichier invalide')
      }
      // Migration des champs manquants
      data.progress.sessionLogs = data.progress.sessionLogs ?? []
      onSuccess(data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Fichier invalide')
    }
  }
  reader.onerror = () => onError('Impossible de lire le fichier')
  reader.readAsText(file)
}

// Input file invisible
const fileInputRef = useRef<HTMLInputElement>(null)

<input
  ref={fileInputRef}
  type="file"
  accept=".json"
  className="hidden"
  onChange={e => e.target.files?.[0] && handleImport(e.target.files[0], onSuccess, onError)}
/>
<button onClick={() => fileInputRef.current?.click()} className="...">
  Importer une sauvegarde
</button>
```

---

## PARTIE 7 — Bannière Install PWA

```tsx
export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const standalone = isStandalone()
  const ios = isIOS()
  const android = isAndroid()

  useEffect(() => {
    if (localStorage.getItem('install_dismissed')) setDismissed(true)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || standalone || (!ios && !android && !deferredPrompt)) return null

  const handleDismiss = () => {
    localStorage.setItem('install_dismissed', 'true')
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDismissed(true)
    setDeferredPrompt(null)
  }

  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Smartphone size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">Installe l'app</p>
        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
          {ios
            ? "Tape ⎙ → Sur l'écran d'accueil"
            : "Pour un accès hors-ligne et les notifications"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!ios && deferredPrompt && (
          <button onClick={handleInstall} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer">
            Installer
          </button>
        )}
        <button onClick={handleDismiss} className="text-muted hover:text-white transition-colors duration-200 cursor-pointer">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
```

---

## PARTIE 8 — Anti-patterns

| Anti-pattern | Pourquoi |
|---|---|
| `setState(JSON.parse(raw))` sans guard | Corrompt le state si le fichier est invalide |
| `URL.createObjectURL` sans `revokeObjectURL` | Fuite mémoire |
| `document.createElement('a').click()` sans `appendChild` | Échoue silencieusement sur Safari |
| SVG sans `viewBox` | Non responsive — toujours `viewBox + preserveAspectRatio` |
| Chart avec 0 point sans guard | Crash sur les scales (`min` d'un array vide = Infinity) |
| `navigator.standalone` sans cast TypeScript | Erreur TS — cast `(navigator as { standalone?: boolean })` |
| `beforeinstallprompt` sans `e.preventDefault()` | Prompt natif s'affiche immédiatement, au mauvais moment |
| > 7 KPIs dans une même vue | Surcharge cognitive — limiter à ce qui actionne une décision |
| Données sans migration guard | Anciens localStorage incompatibles avec les nouveaux types |
