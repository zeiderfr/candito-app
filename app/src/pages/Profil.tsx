import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, User, Settings2, Dumbbell } from 'lucide-react'
import { useCanditoState } from '@/hooks/useCanditoState'
import { useToasts } from '@/context/ToastContext'
import { PROGRAM_DATA, WEEK_ORDER, PROGRAM_METADATA } from '@/data/program'
import { resolveSession, hasSessionOverride, hasWeekOverrides } from '@/lib/programResolver'
import { cn } from '@/lib/utils'

// ── Navigation stack ─────────────────────────────────────────────────
type ProfileViewId = 'profile' | 'program' | 'session'
type ProfileView =
  | { id: 'profile' }
  | { id: 'program'; weekId: string }
  | { id: 'session'; weekId: string; sessionId: string }

const VIEW_TITLES: Record<ProfileViewId, string> = {
  profile: 'Profil',
  program: 'Personnaliser',
  session: 'Exercices',
}

// ── Page Profil ──────────────────────────────────────────────────────
export function Profil() {
  const { state } = useCanditoState()
  const [stack, setStack] = useState<ProfileView[]>([{ id: 'profile' }])
  const current = stack[stack.length - 1]

  const push = (v: ProfileView) => setStack(p => [...p, v])
  const pop = () => setStack(p => (p.length > 1 ? p.slice(0, -1) : p))

  return (
    <div className="space-y-8 pb-32">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {stack.length > 1 && (
              <button
                onClick={pop}
                className="text-muted hover:text-white cursor-pointer p-1 -m-1 transition-colors"
                aria-label="Retour"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-4xl font-display text-white italic tracking-tight">
              {VIEW_TITLES[current.id]}
            </h1>
          </div>
          <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
            {current.id === 'profile' ? 'Athlète & Paramètres' : 'Configuration'}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {current.id === 'profile' && (
            <ProfileMainView
              key="profile"
              onGoToProgram={() => push({ id: 'program', weekId: state.currentWeekId })}
            />
          )}
          {current.id === 'program' && (
            <ProgramMainView
              key="program"
              initialWeekId={(current as Extract<ProfileView, { id: 'program' }>).weekId}
              onSelectSession={(sessionId, weekId) => push({ id: 'session', weekId, sessionId })}
            />
          )}
          {current.id === 'session' && (
            <SessionMainView
              key={`${(current as Extract<ProfileView, { id: 'session' }>).weekId}-${(current as Extract<ProfileView, { id: 'session' }>).sessionId}`}
              weekId={(current as Extract<ProfileView, { id: 'session' }>).weekId}
              sessionId={(current as Extract<ProfileView, { id: 'session' }>).sessionId}
              onBack={pop}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Vue 1 : Profil athlète ───────────────────────────────────────────
function ProfileMainView({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, updateName, updateRM } = useCanditoState()
  const [nameDraft, setNameDraft] = useState(state.athlete.name)
  const [editingName, setEditingName] = useState(false)

  const handleNameBlur = () => {
    if (nameDraft.trim()) updateName(nameDraft.trim())
    else setNameDraft(state.athlete.name)
    setEditingName(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Hero Profile Section */}
      <div className="glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 text-accent/5 pointer-events-none group-hover:text-accent/10 transition-colors duration-500">
          <User size={120} />
        </div>
        
        <div className="space-y-4 relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60">Identité Athlète</p>
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={e => e.key === 'Enter' && handleNameBlur()}
              className="w-full bg-white/5 border-b-2 border-accent rounded-t-xl px-4 py-4 text-3xl font-display italic text-white focus:outline-none bg-accent/5 transition-all"
            />
          ) : (
            <button
              onClick={() => { setNameDraft(state.athlete.name); setEditingName(true) }}
              className="text-white text-5xl font-display italic hover:text-accent transition-all duration-300 cursor-pointer text-left w-full leading-tight"
            >
              {state.athlete.name}
            </button>
          )}
        </div>
      </div>

      {/* 1RM Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-accent" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Max. Actuels (1RM)</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['squat', 'bench', 'deadlift'] as const).map(lift => (
            <AthleteRMField
              key={lift}
              lift={lift}
              value={state.athlete.rm[lift]}
              onSave={v => updateRM({ [lift]: v })}
            />
          ))}
        </div>
      </div>

      {/* CTA Personnalisation - Large Card */}
      <button
        onClick={onGoToProgram}
        className="w-full flex items-center gap-6 p-6 glass rounded-[24px] border border-border hover:border-accent/40 transition-all duration-300 cursor-pointer group hover:bg-accent/5"
      >
        <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
          <Settings2 size={24} />
        </div>
        <div className="flex-1 text-left space-y-1">
          <p className="text-base text-white font-bold italic">Personnaliser le programme</p>
          <p className="text-xs text-muted">Modifie les exercices, reps et séries de chaque semaine.</p>
        </div>
        <ChevronRight size={20} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
      </button>

      {/* Note sur la persistance */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-[10px] text-muted leading-relaxed text-center italic">
          Toutes les modifications sont sauvegardées localement sur cet appareil (v5 Architecture).
        </p>
      </div>
    </motion.div>
  )
}

// ── Vue 2 : Sélecteur semaine + sessions ─────────────────────────────
function ProgramMainView({
  initialWeekId,
  onSelectSession,
}: {
  initialWeekId: string
  onSelectSession: (sessionId: string, weekId: string) => void
}) {
  const { state, resetWeekOverrides } = useCanditoState()
  const { showToast } = useToasts()
  const [selectedWeek, setSelectedWeek] = useState(initialWeekId)
  const weekData = PROGRAM_DATA[selectedWeek]
  const overrides = state.programOverrides

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-6"
    >
      {/* Sélecteur semaine — Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 mask-fade-right">
        {WEEK_ORDER.map(wId => {
          const isCurrent = wId === state.currentWeekId
          const isSelected = selectedWeek === wId
          return (
            <button
              key={wId}
              onClick={() => setSelectedWeek(wId)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 transition-all duration-300 cursor-pointer',
                isSelected
                  ? 'bg-accent text-background shadow-lg shadow-accent/20'
                  : 'bg-white/5 text-muted hover:text-white hover:bg-white/10',
                isCurrent && !isSelected ? 'ring-1 ring-accent/40' : ''
              )}
            >
              {wId.replace('_', ' ').toUpperCase()}
              {isCurrent && <span className="ml-1.5 opacity-50">•</span>}
            </button>
          )
        })}
      </div>

      {/* Info semaine + Reset */}
      <div className="flex items-start justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Description</p>
          <p className="text-xs text-muted leading-snug">
            {PROGRAM_METADATA[selectedWeek]?.subtitle}
          </p>
        </div>
        {hasWeekOverrides(selectedWeek, overrides) && (
          <button
            onClick={() => {
              resetWeekOverrides(selectedWeek)
              showToast({ message: 'Semaine réinitialisée.', duration: 4000 })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Liste des sessions */}
      <div className="grid gap-3">
        {weekData?.sessions.map(session => {
          const overrideActive = hasSessionOverride(selectedWeek, session.id, overrides)
          const displayFocus = overrides[selectedWeek]?.[session.id]?.focus ?? session.focus
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id, selectedWeek)}
              className="w-full flex items-center justify-between p-5 glass rounded-2xl border border-border hover:border-accent/40 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center transition-colors",
                  overrideActive ? "bg-accent/20 text-accent" : "bg-white/5 text-muted group-hover:text-white"
                )}>
                  <Dumbbell size={18} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm text-white font-bold truncate group-hover:text-accent transition-colors">{displayFocus}</p>
                  <p className="text-[10px] text-muted italic">{session.day ?? 'Séance adaptable'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Vue 3 : Exercices d'une session ─────────────────────────────────
function SessionMainView({
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
  const overrides = state.programOverrides
  const resolved = resolveSession(weekId, sessionId, overrides)

  if (!resolved) return <p className="text-muted text-sm py-4 text-center">Session introuvable.</p>

  const hasOv = hasSessionOverride(weekId, sessionId, overrides)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-6"
    >
      {/* Focus de la session */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Nom de la séance</p>
        <ProfilInlineTextField
          value={resolved.focus}
          onSave={v => setSessionFocus(weekId, sessionId, v)}
          placeholder="Ex : Bas lourd"
          textClass="text-2xl font-display italic text-white"
        />
      </div>

      {/* Exercices */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Structure des Exercices</p>
        {resolved.exercises.map((ex, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-4 border border-border hover:border-accent/10 transition-colors">
            {/* Nom */}
            <ProfilInlineTextField
              value={ex.name}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { name: v })}
              placeholder="Nom de l'exercice"
              textClass="text-base font-bold text-white group-hover:text-accent"
            />

            {/* Sets + Reps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Séries</label>
                <ProfilInlineTextField
                  value={ex.sets}
                  onSave={v => setExerciseOverride(weekId, sessionId, i, { sets: v })}
                  placeholder="ex: 4x5"
                  textClass="text-sm text-white tabular-nums bg-white/5 rounded-lg px-2 py-1"
                />
              </div>
              {ex.reps && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Reps</label>
                  <ProfilInlineTextField
                    value={ex.reps}
                    onSave={v => setExerciseOverride(weekId, sessionId, i, { reps: v })}
                    placeholder="ex: 6-8"
                    textClass="text-sm text-white tabular-nums bg-white/5 rounded-lg px-2 py-1"
                  />
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Note technique</label>
              <ProfilInlineTextField
                value={ex.note ?? ''}
                onSave={v => setExerciseOverride(weekId, sessionId, i, { note: v || undefined })}
                placeholder="Ajouter une consigne…"
                textClass="text-[11px] text-muted italic bg-white/[0.02] rounded-lg px-2 py-1"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reset session */}
      {hasOv && (
        <button
          onClick={() => {
            resetSessionOverride(weekId, sessionId)
            showToast({ message: `Séance "${resolved.focus}" réinitialisée.`, duration: 4000 })
            onBack()
          }}
          className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-danger/60 hover:text-danger transition-colors cursor-pointer border border-danger/20 rounded-2xl bg-danger/5"
        >
          <RotateCcw size={12} />
          Réinitialiser cette séance
        </button>
      )}
    </motion.div>
  )
}

// ── Champ texte inline (Adapté pour Profil) ───────────────────────────────
function ProfilInlineTextField({
  value,
  onSave,
  placeholder,
  textClass,
}: {
  value: string
  onSave: (v: string) => void
  placeholder?: string
  textClass?: string
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
          'text-left w-full cursor-pointer hover:text-accent transition-colors group',
          value ? textClass : 'text-muted/40 text-sm italic',
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
      className="w-full bg-accent/5 border-b-2 border-accent/60 px-3 py-2 text-base text-white focus:outline-none transition-all"
    />
  )
}

// ── Champ 1RM (Adapté pour Profil) ───────────────────────────────────────
function AthleteRMField({
  lift,
  value,
  onSave,
}: {
  lift: string
  value: number
  onSave: (v: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  const handleBlur = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n > 0) onSave(Math.round(n / 2.5) * 2.5)
    else setDraft(String(value))
  }

  return (
    <div className="glass rounded-[24px] p-4 flex flex-col items-center gap-2 border border-border group hover:border-accent/40 transition-colors">
      <label className="text-[9px] font-bold uppercase tracking-widest text-muted/60 capitalize">{lift}</label>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-16 bg-transparent text-xl font-display italic text-white text-center focus:outline-none focus:text-accent transition-colors"
        />
        <span className="text-[10px] text-muted font-bold">KG</span>
      </div>
    </div>
  )
}
