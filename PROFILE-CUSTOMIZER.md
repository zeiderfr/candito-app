# PROFILE-CUSTOMIZER — Plan d'implémentation

Fonctionnalité : bouton profil (rond, top-right fixe) ouvrant un bottom sheet
avec deux sections — Profil athlète et Éditeur de programme complet.

**Périmètre :** modifier un exercice, une session entière, une semaine entière.
**Pas de nouvelle tab.** Pas de backend. Tout en localStorage.

---

## Architecture en 1 ligne

```
PROGRAM_DATA (statique) + programOverrides (localStorage)
         ↓ resolveSession()
    Programme effectif affiché
```

---

## ÉTAPE 1 — Types (`app/src/types.ts`)

Ajouter après `CanditoState` :

```typescript
// ── Program Overrides ─────────────────────────────────────────────────

/** Surcharge d'un exercice individuel (tous les champs optionnels) */
export interface ExerciseOverride {
  name?: string
  sets?: string
  reps?: string
  percentage?: { lo: number; hi: number }
  note?: string
  lift?: 'squat' | 'bench' | 'deadlift'
}

/** Surcharge d'une session (focus, exercices, skip) */
export interface SessionOverride {
  focus?: string                               // Renommer le focus
  exercises?: Record<number, ExerciseOverride> // Index exercice → override
  skipped?: boolean                            // Marquer comme repos
}

/** Surcharge d'une semaine : map sessionId → SessionOverride */
export type WeekOverrides = Record<string, SessionOverride>

/** Racine des overrides stockée dans CanditoState */
export type ProgramOverrides = Partial<Record<string, WeekOverrides>>
```

Dans `CanditoState`, ajouter un champ :

```typescript
export interface CanditoState {
  // ...champs existants...
  programOverrides: ProgramOverrides  // {} par défaut
}
```

---

## ÉTAPE 2 — Resolver (`app/src/lib/programResolver.ts`)

**Nouveau fichier.**

```typescript
import { PROGRAM_DATA } from '@/data/program'
import type { Session, Exercise, ProgramOverrides } from '@/types'

/**
 * resolveSession — fusionne PROGRAM_DATA statique avec les overrides utilisateur.
 * Retourne toujours une Session immuable (spread), jamais une mutation.
 */
export function resolveSession(
  weekId: string,
  sessionId: string,
  overrides: ProgramOverrides
): Session | null {
  const week = PROGRAM_DATA[weekId]
  if (!week) return null

  const session = week.sessions.find(s => s.id === sessionId)
  if (!session) return null

  const sessionOverride = overrides[weekId]?.[sessionId]
  if (!sessionOverride) return session

  return {
    ...session,
    focus: sessionOverride.focus ?? session.focus,
    exercises: session.exercises.map((ex: Exercise, i: number) => {
      const exOv = sessionOverride.exercises?.[i]
      return exOv ? { ...ex, ...exOv } : ex
    }),
  }
}

/** Retourne vrai si la semaine a au moins un override non-vide */
export function hasWeekOverrides(weekId: string, overrides: ProgramOverrides): boolean {
  const week = overrides[weekId]
  if (!week) return false
  return Object.values(week).some(
    s => s.focus || s.skipped || (s.exercises && Object.keys(s.exercises).length > 0)
  )
}

/** Retourne vrai si cette session précise a un override */
export function hasSessionOverride(
  weekId: string,
  sessionId: string,
  overrides: ProgramOverrides
): boolean {
  return !!overrides[weekId]?.[sessionId]
}
```

---

## ÉTAPE 3 — CanditoContext (`app/src/context/CanditoContext.tsx`)

### 3a — DEFAULT_STATE : initialiser `programOverrides`

```typescript
const DEFAULT_STATE: CanditoState = {
  // ...
  programOverrides: {},
}
```

### 3b — Migrate : ajouter au bloc v4→v5

```typescript
migrated.programOverrides = migrated.programOverrides ?? {}
```

### 3c — Ajouter à `CanditoContextType`

```typescript
export interface CanditoContextType {
  // ...existants...
  setExerciseOverride: (weekId: string, sessionId: string, exerciseIndex: number, override: Partial<ExerciseOverride>) => void
  setSessionFocus: (weekId: string, sessionId: string, focus: string) => void
  resetSessionOverride: (weekId: string, sessionId: string) => void
  resetWeekOverrides: (weekId: string) => void
}
```

### 3d — Implémenter les 4 updaters dans CanditoProvider

```typescript
const setExerciseOverride = useCallback((
  weekId: string, sessionId: string, exerciseIndex: number,
  override: Partial<ExerciseOverride>
): void => {
  setRealState(prev => ({
    ...prev,
    programOverrides: {
      ...prev.programOverrides,
      [weekId]: {
        ...prev.programOverrides[weekId],
        [sessionId]: {
          ...prev.programOverrides[weekId]?.[sessionId],
          exercises: {
            ...prev.programOverrides[weekId]?.[sessionId]?.exercises,
            [exerciseIndex]: {
              ...prev.programOverrides[weekId]?.[sessionId]?.exercises?.[exerciseIndex],
              ...override,
            },
          },
        },
      },
    },
  }))
}, [])

const setSessionFocus = useCallback((
  weekId: string, sessionId: string, focus: string
): void => {
  setRealState(prev => ({
    ...prev,
    programOverrides: {
      ...prev.programOverrides,
      [weekId]: {
        ...prev.programOverrides[weekId],
        [sessionId]: {
          ...prev.programOverrides[weekId]?.[sessionId],
          focus,
        },
      },
    },
  }))
}, [])

const resetSessionOverride = useCallback((weekId: string, sessionId: string): void => {
  setRealState(prev => {
    const weekOv = { ...prev.programOverrides[weekId] }
    delete weekOv[sessionId]
    return {
      ...prev,
      programOverrides: { ...prev.programOverrides, [weekId]: weekOv },
    }
  })
}, [])

const resetWeekOverrides = useCallback((weekId: string): void => {
  setRealState(prev => {
    const overrides = { ...prev.programOverrides }
    delete overrides[weekId]
    return { ...prev, programOverrides: overrides }
  })
}, [])
```

---

## ÉTAPE 4 — ProfileContext (`app/src/context/ProfileContext.tsx`)

**Nouveau fichier.** Permet d'ouvrir le sheet depuis n'importe quel composant.

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react'

interface ProfileContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ProfileContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
```

---

## ÉTAPE 5 — ProfileButton (`app/src/components/common/ProfileButton.tsx`)

```tsx
import { useCanditoState } from '@/hooks/useCanditoState'
import { useProfile } from '@/context/ProfileContext'
import { cn } from '@/lib/utils'

export function ProfileButton() {
  const { state } = useCanditoState()
  const { open } = useProfile()
  const initials = state.athlete.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      onClick={open}
      aria-label="Profil et personnalisation du programme"
      className={cn(
        'size-9 rounded-full bg-accent/10 border border-accent/20',
        'flex items-center justify-center shrink-0',
        'text-accent text-[11px] font-bold uppercase',
        'hover:bg-accent/20 transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
      )}
    >
      {initials}
    </button>
  )
}
```

---

## ÉTAPE 6 — ProfileSheet (`app/src/components/common/ProfileSheet.tsx`)

Structure : sheet avec navigation interne en stack (3 vues max).

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { useCanditoState } from '@/hooks/useCanditoState'
import { PROGRAM_DATA, WEEK_ORDER, PROGRAM_METADATA } from '@/data/program'
import { resolveSession, hasSessionOverride, hasWeekOverrides } from '@/lib/programResolver'
import { cn } from '@/lib/utils'

// ── Vue discriminée ──────────────────────────────────────────────────
type ProfileView =
  | { id: 'profile' }
  | { id: 'program'; weekId: string }
  | { id: 'session'; weekId: string; sessionId: string }

// ── Sheet principal ──────────────────────────────────────────────────
export function ProfileSheet() {
  const { isOpen, close } = useProfile()
  const [stack, setStack] = useState<ProfileView[]>([{ id: 'profile' }])
  const current = stack[stack.length - 1]

  const push = (v: ProfileView) => setStack(p => [...p, v])
  const pop = () => setStack(p => (p.length > 1 ? p.slice(0, -1) : p))

  const titles: Record<ProfileView['id'], string> = {
    profile: 'Profil',
    program: 'Personnaliser',
    session: 'Exercices',
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-[24px] border-t border-border"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          {stack.length > 1 && (
            <button onClick={pop} className="text-muted hover:text-white cursor-pointer p-1 -m-1" aria-label="Retour">
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-sm font-bold text-white flex-1">{titles[current.id]}</h2>
          <button onClick={close} aria-label="Fermer" className="text-muted hover:text-white cursor-pointer p-1 -m-1">
            <X size={18} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[72dvh] px-5 py-4" data-no-swipe>
          <AnimatePresence mode="wait">
            {current.id === 'profile' && (
              <ProfileView key="profile" onGoToProgram={() => push({ id: 'program', weekId: 's1' })} />
            )}
            {current.id === 'program' && (
              <ProgramView
                key="program"
                weekId={(current as { id: 'program'; weekId: string }).weekId}
                onSelectSession={(sessionId, weekId) => push({ id: 'session', weekId, sessionId })}
              />
            )}
            {current.id === 'session' && (
              <SessionView
                key="session"
                weekId={(current as { id: 'session'; weekId: string; sessionId: string }).weekId}
                sessionId={(current as { id: 'session'; weekId: string; sessionId: string }).sessionId}
                onBack={pop}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## ÉTAPE 6b — Vues internes du sheet

### Vue Profil (nom + 1RM)

```tsx
function ProfileView({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, updateName, updateRM } = useCanditoState()
  const [nameDraft, setNameDraft] = useState(state.athlete.name)
  const [editing, setEditing] = useState(false)

  const handleNameBlur = () => {
    if (nameDraft.trim()) updateName(nameDraft.trim())
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-6"
    >
      {/* Nom */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Nom</p>
        {editing ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={e => e.key === 'Enter' && handleNameBlur()}
            className="w-full bg-white/5 border border-accent/60 rounded-input px-3 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        ) : (
          <button
            onClick={() => { setNameDraft(state.athlete.name); setEditing(true) }}
            className="text-white text-lg font-display italic hover:text-accent transition-colors cursor-pointer text-left w-full"
          >
            {state.athlete.name}
          </button>
        )}
      </div>

      {/* 1RM */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">1RM actuels</p>
        <div className="grid grid-cols-3 gap-4">
          {(['squat', 'bench', 'deadlift'] as const).map(lift => (
            <RMField key={lift} lift={lift} value={state.athlete.rm[lift]} onSave={v => updateRM({ [lift]: v })} />
          ))}
        </div>
      </div>

      {/* CTA programme */}
      <button
        onClick={onGoToProgram}
        className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer group"
      >
        <span className="text-sm text-white font-medium">Personnaliser le programme</span>
        <ChevronRight size={16} className="text-muted group-hover:text-accent transition-colors" />
      </button>
    </motion.div>
  )
}
```

### Champ RM inline

```tsx
function RMField({ lift, value, onSave }: { lift: string; value: number; onSave: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value))

  const handleBlur = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n > 0) onSave(Math.round(n / 2.5) * 2.5)
    else setDraft(String(value))
  }

  return (
    <div className="flex flex-col gap-1 items-center">
      <label className="text-[9px] font-bold uppercase tracking-widest text-muted capitalize">{lift}</label>
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        className="w-full bg-white/5 border border-border rounded-input px-2 py-2.5 text-base text-white tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
      />
      <span className="text-[9px] text-muted">kg</span>
    </div>
  )
}
```

### Vue Programme (sélecteur semaine + sessions)

```tsx
function ProgramView({
  weekId,
  onSelectSession,
}: {
  weekId: string
  onSelectSession: (sessionId: string, weekId: string) => void
}) {
  const { state, resetWeekOverrides } = useCanditoState()
  const { showToast } = useToasts()
  const [selectedWeek, setSelectedWeek] = useState(weekId)
  const weekData = PROGRAM_DATA[selectedWeek]
  const overrides = state.programOverrides

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      {/* Sélecteur semaine */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {WEEK_ORDER.map(wId => (
          <button
            key={wId}
            onClick={() => setSelectedWeek(wId)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 transition-colors cursor-pointer',
              selectedWeek === wId
                ? 'bg-accent text-background'
                : 'bg-white/5 text-muted hover:text-white',
              wId === state.currentWeekId && selectedWeek !== wId && 'border border-accent/30'
            )}
          >
            {wId.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Info semaine + reset */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted">{PROGRAM_METADATA[selectedWeek]?.subtitle}</p>
        {hasWeekOverrides(selectedWeek, overrides) && (
          <button
            onClick={() => {
              const snapshot = overrides[selectedWeek]
              resetWeekOverrides(selectedWeek)
              showToast({ message: 'Semaine réinitialisée.', onUndo: () => {/* TODO restore */}, duration: 5000 })
            }}
            className="flex items-center gap-1.5 text-[10px] text-muted hover:text-danger transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Sessions */}
      <div className="space-y-2">
        {weekData?.sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id, selectedWeek)}
            className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer group"
          >
            <div className="text-left">
              <p className="text-sm text-white font-medium">
                {overrides[selectedWeek]?.[session.id]?.focus ?? session.focus}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{session.day}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasSessionOverride(selectedWeek, session.id, overrides) && (
                <span className="size-1.5 rounded-full bg-accent shrink-0" />
              )}
              <ChevronRight size={16} className="text-muted group-hover:text-accent transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
```

### Vue Session (exercices éditables)

```tsx
function SessionView({
  weekId,
  sessionId,
  onBack,
}: {
  weekId: string
  sessionId: string
  onBack: () => void
}) {
  const { state, setExerciseOverride, setSessionFocus, resetSessionOverride } = useCanditoState()
  const { showToast } = useToasts()
  const resolved = resolveSession(weekId, sessionId, state.programOverrides)

  if (!resolved) return <p className="text-muted text-sm">Session introuvable.</p>

  const hasOverride = hasSessionOverride(weekId, sessionId, state.programOverrides)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      {/* Focus de la session */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Focus</p>
        <InlineTextField
          value={resolved.focus}
          onSave={v => setSessionFocus(weekId, sessionId, v)}
          placeholder="Nom de la séance"
        />
      </div>

      {/* Exercices */}
      <div className="space-y-3">
        {resolved.exercises.map((ex, i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3 border border-border">
            {/* Nom */}
            <InlineTextField
              value={ex.name}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { name: v })}
              placeholder="Nom de l'exercice"
            />
            {/* Sets / Reps / % */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Séries</label>
                <InlineTextField
                  value={ex.sets}
                  onSave={v => setExerciseOverride(weekId, sessionId, i, { sets: v })}
                  placeholder="3x5"
                />
              </div>
              {ex.reps && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Reps</label>
                  <InlineTextField
                    value={ex.reps}
                    onSave={v => setExerciseOverride(weekId, sessionId, i, { reps: v })}
                    placeholder="6-8"
                  />
                </div>
              )}
              {ex.percentage && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">%</label>
                  <p className="text-sm text-white tabular-nums">{ex.percentage.lo}–{ex.percentage.hi}%</p>
                </div>
              )}
            </div>
            {/* Note */}
            <InlineTextField
              value={ex.note ?? ''}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { note: v || undefined })}
              placeholder="Ajouter une note…"
            />
          </div>
        ))}
      </div>

      {/* Reset session */}
      {hasOverride && (
        <button
          onClick={() => {
            resetSessionOverride(weekId, sessionId)
            showToast({ message: `Session "${resolved.focus}" réinitialisée.`, duration: 4000 })
            onBack()
          }}
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-danger transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          Réinitialiser cette séance
        </button>
      )}
    </motion.div>
  )
}
```

### Composant InlineTextField (réutilisable)

```tsx
function InlineTextField({
  value,
  onSave,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleBlur = () => {
    onSave(draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className={cn(
          'text-sm text-left w-full cursor-pointer hover:text-accent transition-colors',
          value ? 'text-white' : 'text-muted/60'
        )}
      >
        {value || placeholder}
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => e.key === 'Enter' && handleBlur()}
      className="w-full bg-white/5 border border-accent/60 rounded-input px-3 py-2 text-base text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
    />
  )
}
```

---

## ÉTAPE 7 — AppLayout (`app/src/components/layout/AppLayout.tsx`)

Intégrer le ProfileButton et le ProfileSheet :

```tsx
import { ProfileButton } from '@/components/common/ProfileButton'
import { ProfileSheet } from '@/components/common/ProfileSheet'
import { ProfileProvider } from '@/context/ProfileContext'

// Wrapper le contenu dans ProfileProvider
export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <ProfileProvider>
      <div className="relative min-h-dvh flex flex-col bg-background font-sans">
        {/* Bouton profil — fixe top-right */}
        <div
          className="fixed z-30 right-5"
          style={{ top: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.75rem))' }}
        >
          <ProfileButton />
        </div>

        <main
          className="flex-1 w-full max-w-[680px] mx-auto px-6 pt-6 pb-32 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
        <ProfileSheet />
      </div>
    </ProfileProvider>
  )
}
```

> **Note :** ajouter `pt-14` à `<main>` si le bouton chevauche le contenu des pages.

---

## ÉTAPE 8 — Intégration dans useWorkoutSchedule

Utiliser `resolveSession()` au lieu de lire `PROGRAM_DATA` directement :

```typescript
// Dans useWorkoutSchedule.ts
import { resolveSession } from '@/lib/programResolver'

// Remplacer :
// const session = currentWeek.sessions.find(s => s.id === sessionId)
// Par :
const session = resolveSession(state.currentWeekId, sessionId, state.programOverrides)
```

---

## ÉTAPE 9 — Intégration dans Programme.tsx

Les sessions affichées dans la page Programme doivent aussi passer par le resolver :

```typescript
// Dans Programme.tsx, lors du map des sessions :
import { resolveSession } from '@/lib/programResolver'

// Au lieu de passer session directement depuis weekData.sessions,
// résoudre chaque session :
weekData?.sessions.map(rawSession => {
  const session = resolveSession(selectedWeekId, rawSession.id, state.programOverrides) ?? rawSession
  return (
    <SessionCard
      key={session.id}
      session={session}
      // ...
    />
  )
})
```

---

## Ordre d'exécution recommandé

```
1. types.ts          → ExerciseOverride, SessionOverride, WeekOverrides, ProgramOverrides
2. types.ts          → ajouter programOverrides: ProgramOverrides à CanditoState
3. CanditoContext     → DEFAULT_STATE + migrate + 4 updaters + CanditoContextType
4. programResolver   → nouveau fichier lib
5. ProfileContext     → nouveau fichier context
6. ProfileButton     → nouveau composant
7. ProfileSheet      → nouveau composant (avec 3 vues + InlineTextField + RMField)
8. AppLayout         → intégrer ProfileProvider + ProfileButton + ProfileSheet
9. useWorkoutSchedule → resolveSession()
10. Programme.tsx     → resolveSession()
11. npm run build     → 0 erreur
```

---

## Vérifications post-implémentation

- [ ] `npm run build` → 0 erreur TypeScript
- [ ] Inputs ≥ 16px (pas de zoom iOS sur focus)
- [ ] Override persisté après reload (localStorage)
- [ ] Reset session → undo toast
- [ ] Ancien localStorage (sans `programOverrides`) migre proprement → `{}`
- [ ] Bouton profil : safe area iOS (Dynamic Island)
- [ ] Sheet : scroll interne sans déclencher le swipe de navigation
- [ ] Badge accent visible sur les sessions modifiées
