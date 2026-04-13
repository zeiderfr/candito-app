---
name: session-logging-data
description: "Compétence ultime pour le logging de séances, visualisation SVG de progression, export/import JSON, et bannière d'installation PWA. Fusionne claude-d3js-skill (charts, scales, SVG), frontend-ui-dark-ts (glassmorphism, dark tokens, animations), fp-react (TypeScript data modeling, state patterns), et browser-extension-builder (File API, beforeinstallprompt, navigator APIs). Couvre : data modeling TypeScript, SVG line chart pur, FileReader/Blob export, PWA install detection iOS/Android, slide-up panels React."
category: data
risk: safe
source: "Synthèse de sickn33/antigravity-awesome-skills (claude-d3js-skill, frontend-ui-dark-ts, fp-react, browser-extension-builder) + expertise PWA/File API/SVG"
date_added: "2026-04-13"
---

# Session Logging & Data — Compétence Ultime

Compétence tout-en-un pour : **logger des séances d'entraînement**, **visualiser la progression en SVG pur**, **exporter/importer les données**, et **guider l'installation PWA sur iOS/Android**.

## Quand utiliser

- Ajouter du logging per-set (poids, reps, RPE) dans un mode Focus/Workout
- Tracer une courbe d'évolution de 1RM ou tout KPI sportif/fitness
- Implémenter un export JSON + import FileReader sans dépendance externe
- Afficher une bannière d'installation PWA adaptée à iOS et Android

---

## 1. Modélisation TypeScript — Données de Séance

### Principes (fp-react)
- Utiliser des **types discriminants** pour rendre les états impossibles irreprésentables
- `null` uniquement pour les champs vraiment optionnels (pas de undefined)
- Versionner les structures de données pour la migration

### Types recommandés

```typescript
// Un log de série individuelle
interface SetLog {
  weight: number | null   // null = non renseigné (exercice au poids de corps)
  reps: number            // reps réelles effectuées
  rpe: number | null      // RPE 6–10, null si non renseigné
}

// Log d'un exercice = N séries
interface ExerciseLog {
  exerciseName: string
  sets: SetLog[]
}

// Log complet d'une séance
interface SessionLog {
  sessionId: string       // FK vers Session.id du programme
  date: string            // ISO YYYY-MM-DD
  exercises: ExerciseLog[]
}
```

### Règles de migration localStorage

```typescript
// Dans le useState init — toujours migrer les champs manquants
const data = JSON.parse(saved)
data.progress.sessionLogs = data.progress.sessionLogs ?? []
// Ne jamais faire setState(raw) sans guard des clés critiques
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

## 2. UI — Slide-up Panel Post-Série (React)

### Pattern slide-up (dark glassmorphism)

```tsx
// Positionnement
"fixed bottom-0 left-0 right-0 z-60 px-6 pb-10 pt-6"
"bg-surface/95 backdrop-blur-xl rounded-t-[24px]"
"animate-in slide-in-from-bottom-4 duration-300"

// Toujours placer APRÈS le contenu principal dans le DOM (z-index naturel)
```

### Quickpick RPE

```tsx
const RPE_VALUES = [6, 7, 7.5, 8, 8.5, 9, 10]

{RPE_VALUES.map(v => (
  <button
    key={v}
    onClick={() => setRpe(v)}
    className={cn(
      "size-9 rounded-full text-[11px] font-bold transition-colors duration-200 cursor-pointer",
      rpe === v ? "bg-accent text-background" : "bg-white/5 text-muted hover:text-white"
    )}
  >
    {v}
  </button>
))}
```

### Input poids pré-rempli

```tsx
// Pré-remplir avec le poids cible calculé, laisser vide si 0
<input
  type="number"
  inputMode="decimal"
  value={weight}
  onChange={e => setWeight(e.target.value)}
  placeholder="—"
  className={cn(
    "bg-white/5 border border-border rounded-input py-3",
    "text-center text-2xl font-display text-white tabular-nums w-full",
    "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
  )}
/>
```

---

## 3. SVG Chart — Courbe d'évolution 1RM (0 dépendance)

### Principes (claude-d3js-skill adapté)
- Toujours utiliser `viewBox` + `preserveAspectRatio` pour le responsive
- Calculer les scales manuellement (linear interpolation = `(val - min) / (max - min) * range`)
- Padding interne pour éviter que les points soient coupés aux bords

### Template SVG line chart

```tsx
const CHART_W = 300
const CHART_H = 160
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 }

// Scale X (time) — linéaire entre min et max date
const xScale = (date: string): number => {
  if (dates.length < 2) return PADDING.left + (CHART_W - PADDING.left - PADDING.right) / 2
  const t = new Date(date).getTime()
  const ratio = (t - minTime) / (maxTime - minTime)
  return PADDING.left + ratio * (CHART_W - PADDING.left - PADDING.right)
}

// Scale Y (weight) — linéaire, 0 en bas
const yScale = (weight: number): number => {
  const ratio = (weight - yMin) / (yMax - yMin)
  return CHART_H - PADDING.bottom - ratio * (CHART_H - PADDING.top - PADDING.bottom)
}

// Points → polyline points string
const toPoints = (data: { date: string; weight: number }[]) =>
  data.map(d => `${xScale(d.date)},${yScale(d.weight)}`).join(' ')
```

### Rendu SVG complet

```tsx
<svg
  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
  preserveAspectRatio="xMidYMid meet"
  className="w-full"
>
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
        {v}
      </text>
    </g>
  ))}

  {/* Courbes par lift */}
  {LIFTS.map(({ key, color, data }) => (
    <g key={key}>
      {data.length > 1 && (
        <polyline
          points={toPoints(data)}
          fill="none" stroke={color} strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round"
        />
      )}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(d.date)} cy={yScale(d.weight)} r={3}
          fill={color}
        />
      ))}
    </g>
  ))}

  {/* Labels X (dates) */}
  {[minDate, maxDate].map((d, i) => (
    <text
      key={i}
      x={i === 0 ? PADDING.left : CHART_W - PADDING.right}
      y={CHART_H - 6}
      textAnchor={i === 0 ? 'start' : 'end'}
      fontSize={8} fill="rgba(255,255,255,0.3)"
    >
      {new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
    </text>
  ))}
</svg>
```

### Couleurs des lifts (cohérent avec design system)

```typescript
const LIFTS = [
  { key: 'squat',     color: 'var(--color-accent)',   label: 'Squat' },
  { key: 'bench',     color: 'rgba(255,255,255,0.6)', label: 'Bench' },
  { key: 'deadlift',  color: 'rgba(255,255,255,0.3)', label: 'Deadlift' },
]
```

### Guard — cas edge

```typescript
// 0 PR → empty state card
if (prs.length === 0) return <EmptyState message="Enregistre un PR pour voir ton évolution" />

// 1 seul PR par lift → point sans polyline (toPoints ne produit pas de polyline si length < 2)
// Guards automatiques avec le check data.length > 1 avant <polyline>
```

---

## 4. Export / Import JSON — Browser File API

### Export (download sans serveur)

```typescript
const handleExport = (state: CanditoState) => {
  const json = JSON.stringify(state, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `candito-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)  // Requis sur Safari
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)       // Toujours libérer l'URL object
}
```

### Import (FileReader)

```typescript
const handleImport = (
  file: File,
  onSuccess: (data: CanditoState) => void,
  onError: (msg: string) => void
) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as CanditoState
      // Guard minimal sur les clés critiques
      if (!data.athlete?.rm || !data.progress?.completedSessions) {
        throw new Error('Structure invalide')
      }
      // Appliquer la migration (sessionLogs manquant dans anciens exports)
      data.progress.sessionLogs = data.progress.sessionLogs ?? []
      onSuccess(data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Fichier invalide')
    }
  }
  reader.onerror = () => onError('Impossible de lire le fichier')
  reader.readAsText(file)
}
```

### Input file invisible (pattern UX standard)

```tsx
const fileInputRef = useRef<HTMLInputElement>(null)

<input
  ref={fileInputRef}
  type="file"
  accept=".json"
  className="hidden"
  onChange={e => e.target.files?.[0] && handleImport(e.target.files[0], ...)}
/>
<button onClick={() => fileInputRef.current?.click()}>
  Importer une sauvegarde
</button>
```

### Web Share API (iOS — partage natif)

```typescript
const handleShare = async (state: CanditoState) => {
  if (!navigator.share) { handleExport(state); return }  // Fallback download
  const json = JSON.stringify(state, null, 2)
  const file = new File([json], `candito-${Date.now()}.json`, { type: 'application/json' })
  try {
    await navigator.share({ files: [file], title: 'Sauvegarde Candito' })
  } catch {
    handleExport(state)  // Fallback si annulé
  }
}
```

---

## 5. PWA Install Banner

### Détection plateforme

```typescript
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isAndroid = () => /android/i.test(navigator.userAgent)
const isStandalone = () =>
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
  window.matchMedia('(display-mode: standalone)').matches
```

### Android — beforeinstallprompt

```typescript
// Type custom (pas encore dans les types DOM standard)
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

### iOS — instructions textuelles (pas d'API)

```tsx
// Sur iOS Safari, seules les instructions manuelles sont possibles
// Détecter le symbole de partage correct selon la version
const ShareIcon = () => (
  <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-[10px]">⎙</span>
)

<p className="text-[11px] text-muted leading-relaxed">
  Tape <ShareIcon /> puis <strong className="text-white">"Sur l'écran d'accueil"</strong> pour installer l'app et activer les notifications.
</p>
```

### Guards (ne pas afficher si)

```typescript
// Ne pas afficher si :
const shouldShow = 
  !isStandalone() &&                           // Pas déjà installé
  (isIOS() || isAndroid() || !!deferredPrompt) && // Plateforme supportée
  !localStorage.getItem('install_dismissed')   // Pas déjà dismissed
```

### Template UI (copie NotificationBanner)

```tsx
<div className="glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
  <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
    <Smartphone size={16} />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm text-white font-medium">Installe l'app</p>
    <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
      {isIOS()
        ? "Tape [Partage] → Sur l'écran d'accueil"
        : "Pour un accès hors-ligne et les notifications"}
    </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {!isIOS() && deferredPrompt && (
      <button onClick={handleInstall} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer">
        Installer
      </button>
    )}
    <button onClick={handleDismiss} className="text-muted hover:text-white transition-colors duration-200 cursor-pointer">
      <X size={14} />
    </button>
  </div>
</div>
```

---

## 6. Anti-patterns (JAMAIS)

| Anti-pattern | Pourquoi |
|---|---|
| `parseInt(sets)` sans guard | "3×" ou "3-4" retourne NaN → utiliser `/\d+/.exec(sets)?.[0]` |
| `setState(JSON.parse(raw))` sans guard | Corrompt le state si le fichier est invalide |
| `URL.createObjectURL` sans `revokeObjectURL` | Fuite mémoire |
| `document.createElement('a').click()` sans `appendChild` | Échoue silencieusement sur Safari |
| `new Notification()` sur iOS | Utiliser `registration.showNotification()` |
| `navigator.standalone` sans cast TypeScript | Erreur TS — cast `(navigator as any).standalone` |
| SVG sans `viewBox` | Non responsive — toujours utiliser `viewBox + preserveAspectRatio` |
| Afficher chart avec 0 point | Crash sur les scales — toujours guard `prs.length === 0` |
| `beforeinstallprompt` sans `e.preventDefault()` | Le prompt natif s'affiche immédiatement, pas au bon moment |
