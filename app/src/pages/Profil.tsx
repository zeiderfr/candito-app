import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { useToasts } from '@/context/ToastContext'
import { PROGRAM_DATA, WEEK_ORDER, PROGRAM_METADATA } from '@/data/program'
import { resolveSession, hasSessionOverride, hasWeekOverrides } from '@/lib/programResolver'
import { epley } from '@/lib/weightCalc'
import { LiftProgressGraph } from '@/components/dashboard/LiftProgressGraph'
import { NewCycleModal } from '@/components/common/NewCycleModal'
import { NotificationSettings } from '@/components/common/NotificationSettings'
import { type PR, type CycleSnapshot } from '@/types'
import {
  ChevronLeft, ChevronRight, ChevronDown, RotateCcw,
  Settings2, Dumbbell, Activity, Trophy,
  Database, Plus, Trash2, Bell,
} from 'lucide-react'

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

// ── Vue 1 : Page riche Profil ────────────────────────────────────────
function ProfileMainView({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, updateName, updateRM, addPR, removePR, startNewCycle, suggestNewRM } = useCandito()
  const { showToast } = useToasts()
  const [showNewCycleModal, setShowNewCycleModal] = useState(false)
  const [nameDraft, setNameDraft] = useState(state.athlete.name)
  const [editingName, setEditingName] = useState(false)

  const total = state.athlete.rm.squat + state.athlete.rm.bench + state.athlete.rm.deadlift

  const TOTAL_SESSIONS = Object.values(PROGRAM_DATA).reduce(
    (acc, w) => acc + w.sessions.length, 0
  )
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
      {/* 1. HERO ATHLÈTE */}
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

      {/* 2. 1RM ACTUELS */}
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

      {/* 3. PROGRESSION DU CYCLE */}
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

      {/* 4. RECORDS PERSONNELS */}
      <PRSection
        prs={state.progress.prs}
        onAdd={addPR}
        onRemove={(id) => {
          removePR(id)
          showToast({ message: 'Record supprimé.', duration: 4000 })
        }}
      />

      {/* 5. TRAJECTOIRE DE FORCE */}
      {state.progress.prs.length >= 2 && (
        <section className="space-y-4">
          <SectionLabel icon={<Trophy size={14} />}>Trajectoire de Force</SectionLabel>
          <LiftProgressGraph prs={state.progress.prs} />
        </section>
      )}

      {/* 6. HISTORIQUE DES CYCLES */}
      {state.cycleHistory && state.cycleHistory.length > 0 && (
        <CycleHistorySection history={state.cycleHistory} />
      )}

      {/* 7. PARAMÈTRES */}
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

// ── Hero athlète ──────────────────────────────────────────────────────
function AthleteHeroSection({
  name, nameDraft, editingName, total, cycleNumber, currentWeekId,
  onEditName, onNameChange, onNameBlur,
}: {
  name: string; nameDraft: string; editingName: boolean; total: number
  cycleNumber: number; currentWeekId: string
  onEditName: () => void; onNameChange: (v: string) => void; onNameBlur: () => void
}) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
      <div className="flex items-start gap-6">
        <div className="size-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={e => onNameChange(e.target.value)}
              onBlur={onNameBlur}
              onKeyDown={e => e.key === 'Enter' && onNameBlur()}
              className="w-full bg-accent/5 border-b-2 border-accent/60 px-2 py-1 text-2xl font-display italic text-white focus:outline-none text-base"
            />
          ) : (
            <button
              onClick={onEditName}
              className="text-white text-3xl font-display italic hover:text-accent transition-colors cursor-pointer text-left leading-tight"
            >
              {name}
            </button>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full tabular-nums">
              Total {total} kg
            </span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
              Cycle {cycleNumber}
            </span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
              {currentWeekId.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Utilitaire en-tête de section ─────────────────────────────────────
function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{children}</p>
    </div>
  )
}

// ── SessionTimeline ───────────────────────────────────────────────────
function SessionTimeline({ completedSessions }: { completedSessions: string[] }) {
  return (
    <div className="space-y-2">
      {WEEK_ORDER.map(weekId => {
        const week = PROGRAM_DATA[weekId]
        if (!week) return null
        const total = week.sessions.length
        const done = week.sessions.filter((s: { id: string }) =>
          completedSessions.includes(s.id)
        ).length
        const pct = total > 0 ? done / total : 0

        return (
          <div key={weekId} className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted w-12 shrink-0 uppercase">
              {weekId.replace('_', ' ')}
            </span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted w-8 text-right shrink-0">
              {done}/{total}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Records personnels ────────────────────────────────────────────────
function PRSection({
  prs, onAdd, onRemove,
}: {
  prs: PR[]
  onAdd: (lift: 'squat' | 'bench' | 'deadlift', weight: number, reps: number) => void
  onRemove: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [formLift, setFormLift] = useState<'squat' | 'bench' | 'deadlift'>('squat')
  const [formWeight, setFormWeight] = useState('')
  const [formReps, setFormReps] = useState('')

  const lastPRPerLift = (['squat', 'bench', 'deadlift'] as const).map(lift => ({
    lift,
    pr: [...prs]
      .filter(p => p.lift === lift)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null,
  }))

  const w = parseFloat(formWeight)
  const r = parseInt(formReps)
  const estimated = !isNaN(w) && !isNaN(r) && w > 0 && r > 0 ? epley(w, r) : null

  const handleSubmit = () => {
    if (estimated !== null) {
      onAdd(formLift, w, r)
      setFormWeight('')
      setFormReps('')
      setShowForm(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon={<Trophy size={14} />}>Records Personnels</SectionLabel>
        <button
          onClick={() => setShowForm(v => !v)}
          className="size-7 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
          aria-label="Ajouter un record"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 3 cartes dernier PR */}
      <div className="grid grid-cols-3 gap-3">
        {lastPRPerLift.map(({ lift, pr }) => (
          <div key={lift} className="glass rounded-2xl p-4 text-center space-y-1 border border-border">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted capitalize">{lift}</p>
            {pr ? (
              <>
                <p className="text-xl font-display italic text-white tabular-nums">{pr.weight}</p>
                <p className="text-[9px] text-muted tabular-nums">{pr.reps} reps</p>
              </>
            ) : (
              <p className="text-xl text-muted/30">—</p>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire ajout PR */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-5 space-y-4 border border-accent/20 overflow-hidden"
          >
            <div className="flex gap-2">
              {(['squat', 'bench', 'deadlift'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setFormLift(l)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer capitalize',
                    formLift === l ? 'bg-accent text-background' : 'bg-white/5 text-muted'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted block mb-1">Poids (kg)</label>
                <input
                  type="number" inputMode="decimal" value={formWeight}
                  onChange={e => setFormWeight(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-base focus:outline-none focus:bg-accent/5"
                  placeholder="140"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted block mb-1">Répétitions</label>
                <input
                  type="number" inputMode="numeric" value={formReps}
                  onChange={e => setFormReps(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-base focus:outline-none focus:bg-accent/5"
                  placeholder="3"
                />
              </div>
            </div>
            {estimated !== null && (
              <p className="text-[10px] text-accent/70 text-center">
                1RM estimé : <strong className="tabular-nums">{estimated} kg</strong>
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={estimated === null}
              className="w-full py-3 bg-accent text-background rounded-xl text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enregistrer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste exhaustive */}
      {prs.length > 0 && (
        <div className="space-y-2">
          {[...prs].reverse().map(pr => (
            <div
              key={pr.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-accent capitalize w-14">{pr.lift}</span>
                <span className="text-sm font-bold text-white tabular-nums">{pr.weight} kg × {pr.reps}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted tabular-nums">{pr.date}</span>
                <button
                  onClick={() => onRemove(pr.id)}
                  className="p-1 text-muted hover:text-danger transition-colors cursor-pointer"
                  aria-label="Supprimer ce record"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Historique des cycles ─────────────────────────────────────────────
function CycleHistorySection({ history }: { history: CycleSnapshot[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="space-y-3">
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <SectionLabel icon={<Database size={14} />}>
          Historique ({history.length} cycle{history.length > 1 ? 's' : ''})
        </SectionLabel>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {[...history].reverse().map(cycle => {
              const total = cycle.rm.squat + cycle.rm.bench + cycle.rm.deadlift
              return (
                <div key={cycle.id} className="glass rounded-2xl p-5 space-y-3 border border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">Cycle {cycle.number}</p>
                    <p className="text-[10px] text-muted tabular-nums">{cycle.startDate} → {cycle.endDate}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(['squat', 'bench', 'deadlift'] as const).map(lift => (
                      <div key={lift}>
                        <p className="text-[9px] text-muted uppercase tracking-widest capitalize">{lift}</p>
                        <p className="text-sm font-bold text-white tabular-nums">{cycle.rm[lift]} kg</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Total : <strong className="text-white tabular-nums">{total} kg</strong></span>
                    <span className="tabular-nums">{cycle.completedSessions.length} séances · {cycle.prs.length} PRs</span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Paramètres ────────────────────────────────────────────────────────
function SettingsSection({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, importState } = useCandito()
  const { showToast } = useToasts()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggle = (id: string) => setOpenSection(v => v === id ? null : id)

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `candito-backup-${new Date().toISOString().split('T')[0]}.json`

    const triggerDownload = () => {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    if (navigator.share) {
      navigator.share({ title: 'Candito Backup', files: [new File([blob], filename)] })
        .catch(triggerDownload)
    } else {
      triggerDownload()
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed?.athlete && parsed?.progress) {
          importState(parsed)
          showToast({ message: 'Données importées avec succès.', duration: 5000 })
        } else {
          showToast({ message: 'Fichier invalide.', duration: 4000 })
        }
      } catch {
        showToast({ message: 'Impossible de lire ce fichier.', duration: 4000 })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="space-y-3">
      <SectionLabel icon={<Settings2 size={14} />}>Paramètres</SectionLabel>

      {/* Personnaliser le programme */}
      <SettingsRow
        icon={<Dumbbell size={18} />}
        label="Personnaliser le programme"
        description="Modifie exercices, reps et séries de chaque semaine"
        onClick={onGoToProgram}
        chevron
      />

      {/* Rappels locaux */}
      <SettingsRow
        icon={<Bell size={18} />}
        label="Rappels d'entraînement"
        description="Notifications matinales et alertes de séance"
        onClick={() => toggle('notif')}
        expanded={openSection === 'notif'}
      >
        <div className="pt-2">
          <NotificationSettings />
        </div>
      </SettingsRow>

      {/* Sauvegarde */}
      <SettingsRow
        icon={<Database size={18} />}
        label="Sauvegarde des données"
        description="Exporter ou importer vos données JSON"
        onClick={() => toggle('backup')}
        expanded={openSection === 'backup'}
      >
        <div className="pt-3 space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 bg-white/5 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
          >
            Exporter les données
          </button>
          <label className="w-full py-3 bg-white/5 text-muted rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
            Importer un fichier
            <input type="file" accept=".json" onChange={handleImport} className="sr-only" />
          </label>
        </div>
      </SettingsRow>

    </section>
  )
}

// ── SettingsRow ───────────────────────────────────────────────────────
function SettingsRow({
  icon, label, description, onClick, chevron = false, expanded = false, children,
}: {
  icon: ReactNode; label: string; description: string
  onClick: () => void; chevron?: boolean; expanded?: boolean; children?: ReactNode
}) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group"
      >
        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-white transition-colors shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[10px] text-muted">{description}</p>
        </div>
        {chevron ? (
          <ChevronRight size={18} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        ) : (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-muted" />
          </motion.div>
        )}
      </button>
      <AnimatePresence>
        {!chevron && expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-5 pb-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
  const { state, resetWeekOverrides } = useCandito()
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
      <div data-no-swipe className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
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
                  'size-10 rounded-xl flex items-center justify-center transition-colors',
                  overrideActive ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted group-hover:text-white'
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

// ── Vue 3 : Exercices d'une session ──────────────────────────────────
function SessionMainView({
  weekId, sessionId, onBack,
}: {
  weekId: string; sessionId: string; onBack: () => void
}) {
  const { state, setExerciseOverride, setSessionFocus, resetSessionOverride } = useCandito()
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
            <ProfilInlineTextField
              value={ex.name}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { name: v })}
              placeholder="Nom de l'exercice"
              textClass="text-base font-bold text-white"
            />
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

// ── Champ texte inline ────────────────────────────────────────────────
function ProfilInlineTextField({
  value, onSave, placeholder, textClass,
}: {
  value: string; onSave: (v: string) => void; placeholder?: string; textClass?: string
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

// ── Champ 1RM ─────────────────────────────────────────────────────────
function AthleteRMField({
  lift, value, onSave,
}: {
  lift: string; value: number; onSave: (v: number) => void
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
          className="w-16 bg-transparent text-xl font-display italic text-white text-center focus:outline-none focus:text-accent transition-colors text-base"
        />
        <span className="text-[10px] text-muted font-bold">KG</span>
      </div>
    </div>
  )
}
