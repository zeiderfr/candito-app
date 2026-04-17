import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { useToasts } from '@/context/ToastContext'
import { PROGRAM_DATA } from '@/data/program'
import { LiftProgressGraph } from '@/components/dashboard/LiftProgressGraph'
import { NewCycleModal } from '@/components/common/NewCycleModal'
import { AthleteHeroSection, AthleteRMField } from '@/components/profil/AthleteHeroSection'
import { SessionTimeline } from '@/components/profil/SessionTimeline'
import { PRSection } from '@/components/profil/PRSection'
import { CycleHistorySection } from '@/components/profil/CycleHistorySection'
import { SessionHistorySection } from '@/components/profil/SessionHistorySection'
import { SettingsSection } from '@/components/profil/SettingsSection'
import { ProgramMainView } from '@/components/profil/ProgramMainView'
import { SessionMainView } from '@/components/profil/SessionMainView'
import { SectionLabel } from '@/components/profil/SectionLabel'
import { ChevronLeft, Dumbbell, Activity, Trophy } from 'lucide-react'

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
  const { state } = useCandito()
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

// ── Vue principale Profil ────────────────────────────────────────────
function ProfileMainView({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, updateName, updateRM, addPR, removePR, startNewCycle, suggestNewRM } = useCandito()
  const { showToast } = useToasts()
  const [showNewCycleModal, setShowNewCycleModal] = useState(false)
  const [nameDraft, setNameDraft] = useState(state.athlete.name)
  const [editingName, setEditingName] = useState(false)

  const total = state.athlete.rm.squat + state.athlete.rm.bench + state.athlete.rm.deadlift
  const TOTAL_SESSIONS = Object.values(PROGRAM_DATA).reduce((acc, w) => acc + w.sessions.length, 0)
  const doneSessions = state.progress.completedSessions.length
  const cycleComplete = doneSessions >= TOTAL_SESSIONS

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
      className="space-y-10"
    >
      <AthleteHeroSection
        name={state.athlete.name}
        nameDraft={nameDraft}
        editingName={editingName}
        total={total}
        cycleNumber={state.cycleNumber}
        currentWeekId={state.currentWeekId}
        onEditName={() => { setNameDraft(state.athlete.name); setEditingName(true) }}
        onNameChange={setNameDraft}
        onNameBlur={handleNameBlur}
      />

      <section className="space-y-4">
        <SectionLabel icon={<Dumbbell size={14} />}>Max. Actuels (1RM)</SectionLabel>
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
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionLabel icon={<Activity size={14} />}>
            Cycle {state.cycleNumber} — {doneSessions}/{TOTAL_SESSIONS} séances
          </SectionLabel>
          <button
            onClick={() => setShowNewCycleModal(true)}
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer',
              cycleComplete
                ? 'bg-accent text-background'
                : 'bg-white/5 text-muted hover:text-white'
            )}
          >
            Nouveau cycle
          </button>
        </div>
        <SessionTimeline completedSessions={state.progress.completedSessions} />
      </section>

      <PRSection
        prs={state.progress.prs}
        onAdd={addPR}
        onRemove={(id) => {
          removePR(id)
          showToast({ message: 'Record supprimé.', duration: 4000 })
        }}
      />

      {state.progress.prs.length >= 2 && (
        <section className="space-y-4">
          <SectionLabel icon={<Trophy size={14} />}>Trajectoire de Force</SectionLabel>
          <LiftProgressGraph prs={state.progress.prs} />
        </section>
      )}

      <SessionHistorySection />

      {state.cycleHistory && state.cycleHistory.length > 0 && (
        <CycleHistorySection history={state.cycleHistory} />
      )}

      <SettingsSection onGoToProgram={onGoToProgram} />

      <NewCycleModal
        isOpen={showNewCycleModal}
        onClose={() => setShowNewCycleModal(false)}
        cycleNumber={state.cycleNumber}
        suggestedRM={suggestNewRM()}
        currentRM={state.athlete.rm}
        onConfirm={(newRM) => {
          startNewCycle(newRM)
          setShowNewCycleModal(false)
        }}
      />
    </motion.div>
  )
}
