import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { useCanditoState } from '@/hooks/useCanditoState'
import { useToasts } from '@/context/ToastContext'
import { PROGRAM_DATA, WEEK_ORDER, PROGRAM_METADATA } from '@/data/program'
import { resolveSession, hasSessionOverride, hasWeekOverrides } from '@/lib/programResolver'
import { cn } from '@/lib/utils'

// ── Navigation stack ─────────────────────────────────────────────────
type ProfileView =
  | { id: 'profile' }
  | { id: 'program'; weekId: string }
  | { id: 'session'; weekId: string; sessionId: string }

const VIEW_TITLES: Record<ProfileView['id'], string> = {
  profile: 'Profil',
  program: 'Personnaliser',
  session: 'Exercices',
}

// ── Sheet principal ──────────────────────────────────────────────────
export function ProfileSheet() {
  const { isOpen, close } = useProfile()
  const { state } = useCanditoState()
  const [stack, setStack] = useState<ProfileView[]>([{ id: 'profile' }])
  const current = stack[stack.length - 1]

  const push = (v: ProfileView) => setStack(p => [...p, v])
  const pop = () => setStack(p => (p.length > 1 ? p.slice(0, -1) : p))

  const handleClose = () => {
    close()
    // Reset navigation after close animation
    setTimeout(() => setStack([{ id: 'profile' }]), 350)
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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-[24px] border-t border-border"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          {stack.length > 1 && (
            <button
              onClick={pop}
              className="text-muted hover:text-white cursor-pointer p-1 -m-1 transition-colors"
              aria-label="Retour"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-sm font-bold text-white flex-1">{VIEW_TITLES[current.id]}</h2>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="text-muted hover:text-white cursor-pointer p-1 -m-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto max-h-[72dvh] px-5 py-4" data-no-swipe>
          <AnimatePresence mode="wait">
            {current.id === 'profile' && (
              <ProfileView
                key="profile"
                onGoToProgram={() => push({ id: 'program', weekId: state.currentWeekId })}
              />
            )}
            {current.id === 'program' && (
              <ProgramView
                key="program"
                initialWeekId={(current as Extract<ProfileView, { id: 'program' }>).weekId}
                onSelectSession={(sessionId, weekId) => push({ id: 'session', weekId, sessionId })}
              />
            )}
            {current.id === 'session' && (
              <SessionView
                key={`${(current as Extract<ProfileView, { id: 'session' }>).weekId}-${(current as Extract<ProfileView, { id: 'session' }>).sessionId}`}
                weekId={(current as Extract<ProfileView, { id: 'session' }>).weekId}
                sessionId={(current as Extract<ProfileView, { id: 'session' }>).sessionId}
                onBack={pop}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Vue 1 : Profil athlète ───────────────────────────────────────────
function ProfileView({ onGoToProgram }: { onGoToProgram: () => void }) {
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
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-6"
    >
      {/* Nom */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Nom</p>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={e => e.key === 'Enter' && handleNameBlur()}
            className="w-full bg-white/5 border border-accent/60 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        ) : (
          <button
            onClick={() => { setNameDraft(state.athlete.name); setEditingName(true) }}
            className="text-white text-2xl font-display italic hover:text-accent transition-colors cursor-pointer text-left w-full"
          >
            {state.athlete.name}
          </button>
        )}
      </div>

      {/* 1RM */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">1RM actuels</p>
        <div className="grid grid-cols-3 gap-3">
          {(['squat', 'bench', 'deadlift'] as const).map(lift => (
            <RMField
              key={lift}
              lift={lift}
              value={state.athlete.rm[lift]}
              onSave={v => updateRM({ [lift]: v })}
            />
          ))}
        </div>
      </div>

      {/* CTA programme */}
      <button
        onClick={onGoToProgram}
        className="w-full flex items-center justify-between px-4 py-3.5 glass rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer group"
      >
        <span className="text-sm text-white font-medium">Personnaliser le programme</span>
        <ChevronRight size={16} className="text-muted group-hover:text-accent transition-colors" />
      </button>
    </motion.div>
  )
}

// ── Vue 2 : Sélecteur semaine + sessions ─────────────────────────────
function ProgramView({
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
      className="space-y-4"
    >
      {/* Sélecteur semaine — scroll horizontal */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {WEEK_ORDER.map(wId => (
          <button
            key={wId}
            onClick={() => setSelectedWeek(wId)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 transition-colors cursor-pointer',
              selectedWeek === wId
                ? 'bg-accent text-background'
                : 'bg-white/5 text-muted hover:text-white',
              wId === state.currentWeekId && selectedWeek !== wId
                ? 'ring-1 ring-accent/40'
                : ''
            )}
          >
            {wId.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sous-titre + reset semaine */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted leading-snug flex-1 pr-4">
          {PROGRAM_METADATA[selectedWeek]?.subtitle}
        </p>
        {hasWeekOverrides(selectedWeek, overrides) && (
          <button
            onClick={() => {
              resetWeekOverrides(selectedWeek)
              showToast({ message: 'Semaine réinitialisée.', duration: 4000 })
            }}
            className="flex items-center gap-1.5 text-[10px] text-muted hover:text-danger transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={11} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste des sessions */}
      <div className="space-y-2">
        {weekData?.sessions.map(session => {
          const overrideActive = hasSessionOverride(selectedWeek, session.id, overrides)
          const displayFocus = overrides[selectedWeek]?.[session.id]?.focus ?? session.focus
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id, selectedWeek)}
              className="w-full flex items-center justify-between px-4 py-3.5 glass rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer group"
            >
              <div className="text-left min-w-0">
                <p className="text-sm text-white font-medium truncate">{displayFocus}</p>
                <p className="text-[10px] text-muted mt-0.5">{session.day ?? '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {overrideActive && (
                  <span className="size-1.5 rounded-full bg-accent" aria-label="Modifiée" />
                )}
                <ChevronRight size={16} className="text-muted group-hover:text-accent transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Vue 3 : Exercices d'une session ─────────────────────────────────
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
  const overrides = state.programOverrides
  const resolved = resolveSession(weekId, sessionId, overrides)

  if (!resolved) return <p className="text-muted text-sm py-4 text-center">Session introuvable.</p>

  const hasOv = hasSessionOverride(weekId, sessionId, overrides)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      {/* Focus de la session */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Nom de la séance</p>
        <InlineTextField
          value={resolved.focus}
          onSave={v => setSessionFocus(weekId, sessionId, v)}
          placeholder="Ex : Bas lourd"
          textClass="text-base font-medium text-white"
        />
      </div>

      {/* Exercices */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Exercices</p>
        {resolved.exercises.map((ex, i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3 border border-border">
            {/* Nom */}
            <InlineTextField
              value={ex.name}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { name: v })}
              placeholder="Nom de l'exercice"
              textClass="text-sm font-semibold text-white"
            />

            {/* Sets + Reps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Séries</label>
                <InlineTextField
                  value={ex.sets}
                  onSave={v => setExerciseOverride(weekId, sessionId, i, { sets: v })}
                  placeholder="ex: 4x5"
                  textClass="text-sm text-white tabular-nums"
                />
              </div>
              {ex.reps && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Reps</label>
                  <InlineTextField
                    value={ex.reps}
                    onSave={v => setExerciseOverride(weekId, sessionId, i, { reps: v })}
                    placeholder="ex: 6-8"
                    textClass="text-sm text-white tabular-nums"
                  />
                </div>
              )}
              {ex.percentage && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Intensité</label>
                  <p className="text-sm text-muted tabular-nums">{ex.percentage.lo}–{ex.percentage.hi}%</p>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Note</label>
              <InlineTextField
                value={ex.note ?? ''}
                onSave={v => setExerciseOverride(weekId, sessionId, i, { note: v || undefined })}
                placeholder="Ajouter une note…"
                textClass="text-[11px] text-muted"
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
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-danger transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          Réinitialiser cette séance
        </button>
      )}
    </motion.div>
  )
}

// ── Champ texte inline ───────────────────────────────────────────────
function InlineTextField({
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
          'text-left w-full cursor-pointer hover:text-accent transition-colors',
          value ? textClass : 'text-muted/60 text-sm',
        )}
      >
        {value || <span className="italic">{placeholder}</span>}
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
      className="w-full bg-white/5 border border-accent/60 rounded-lg px-3 py-2 text-base text-white focus:outline-none focus:ring-2 focus:ring-accent/40"
    />
  )
}

// ── Champ 1RM ────────────────────────────────────────────────────────
function RMField({
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
    <div className="flex flex-col gap-1.5 items-center">
      <label className="text-[9px] font-bold uppercase tracking-widest text-muted capitalize">{lift}</label>
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-full bg-white/5 border border-border rounded-lg px-2 py-2.5 text-base text-white tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
      />
      <span className="text-[9px] text-muted">kg</span>
    </div>
  )
}
