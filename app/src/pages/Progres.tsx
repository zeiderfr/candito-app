import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'
import { calcWeight } from '@/lib/weightCalc'
import { PROGRAM_DATA, WEEK_ORDER } from '@/data/program'
import { AlertTriangle, Plus, Trophy } from 'lucide-react'

type SubTab = 'charges' | 'rpe'

const PERCENTAGES = [40, 50, 60, 65, 70, 75, 78, 80, 82, 85, 88, 90, 92, 93, 95, 98, 100, 102]

const USAGE_MAP: Record<number, string> = {
  40: 'Échauffement', 50: 'Activation', 60: 'Technique',
  65: 'Accessoire', 70: 'Volume', 75: 'Gamme montante',
  78: 'S1-2 bas', 80: 'S1-2 / Décharge', 82: 'S1-2 haut',
  85: 'S3 bas', 88: 'S3 haut', 90: 'S4 / Opener S6',
  92: 'S4 Bench', 93: 'S4 haut', 95: 'S5 AMRAP',
  98: '2ème tentative S6', 100: 'PR égalisé', 102: 'Nouveau PR'
}

const RPE_DATA = [
  { rpe: 10, rir: '0', sensation: 'Effort maximal, impossible de continuer' },
  { rpe: 9, rir: '1', sensation: '1 rép en réserve, vitesse lente' },
  { rpe: 8, rir: '2', sensation: '2 reps, technique solide' },
  { rpe: 7, rir: '3', sensation: '3 reps, rythme fluide' },
  { rpe: 6, rir: '4+', sensation: 'Échauffement / Technique' },
]

const WEEK_DISPLAY: Record<string, string> = {
  s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6_test: 'S6T', s6_dec: 'S6D'
}

// ── Session Timeline ─────────────────────────────────────────────────
function SessionTimeline({ completedSessions }: { completedSessions: string[] }) {
  return (
    <div className="glass rounded-card p-5 space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted">Progression du programme</h3>
      <div className="flex flex-col gap-3">
        {WEEK_ORDER.map(weekId => {
          const week = PROGRAM_DATA[weekId]
          if (!week) return null
          const sessions = week.sessions
          const done = sessions.filter((s: { id: string }) => completedSessions.includes(s.id)).length
          return (
            <div key={weekId} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted w-8 shrink-0">{WEEK_DISPLAY[weekId]}</span>
              <div className="flex gap-1.5 flex-1">
                {sessions.map((s: { id: string }) => (
                  <div key={s.id} className={cn(
                    "h-2 flex-1 rounded-full transition-colors duration-300",
                    completedSessions.includes(s.id) ? "bg-accent" : "bg-white/10"
                  )} />
                ))}
              </div>
              <span className="text-[10px] tabular-nums text-muted shrink-0 w-8 text-right">
                {done}/{sessions.length}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── PR Section ───────────────────────────────────────────────────────
function PRSection() {
  const { state, addPR } = useCanditoState()
  const [showForm, setShowForm] = useState(false)
  const [formLift, setFormLift] = useState<'squat' | 'bench' | 'deadlift'>('squat')
  const [formWeight, setFormWeight] = useState('')
  const [formReps, setFormReps] = useState('1')

  const prs = state.progress.prs ?? []

  const lastPRs = (['squat', 'bench', 'deadlift'] as const).map(lift => {
    const liftPRs = prs.filter(p => p.lift === lift)
    return liftPRs.length ? liftPRs[liftPRs.length - 1] : null
  }).filter(Boolean)

  const handleSubmit = () => {
    const w = Number(formWeight)
    const r = Number(formReps)
    if (!w || !r) return
    addPR(formLift, w, r)
    setFormWeight('')
    setFormReps('1')
    setShowForm(false)
  }

  return (
    <div className="glass rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Trophy size={16} />
          </div>
          <h3 className="text-lg font-display text-white italic">Records personnels</h3>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className={cn(
            "size-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer",
            showForm ? "bg-accent text-background" : "bg-white/5 text-muted hover:text-white"
          )}
        >
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-border space-y-3 bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-2">
            {(['squat', 'bench', 'deadlift'] as const).map(lift => (
              <button
                key={lift}
                onClick={() => setFormLift(lift)}
                className={cn(
                  "py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer",
                  formLift === lift ? "bg-accent text-background" : "bg-white/5 text-muted hover:text-white"
                )}
              >
                {lift === 'deadlift' ? 'DL' : lift}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Poids (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={formWeight}
                onChange={e => setFormWeight(e.target.value)}
                placeholder="0"
                className="bg-white/5 border border-border rounded-input py-2.5 px-3 text-center text-lg font-display text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Reps</label>
              <input
                type="number"
                inputMode="numeric"
                value={formReps}
                onChange={e => setFormReps(e.target.value)}
                min={1}
                className="bg-white/5 border border-border rounded-input py-2.5 px-3 text-center text-lg font-display text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-accent hover:bg-[#77cc7b] text-background font-bold uppercase tracking-widest text-[11px] py-3 rounded-pill transition-colors duration-200 cursor-pointer"
          >
            Enregistrer le PR
          </button>
        </div>
      )}

      <div className="divide-y divide-border">
        {lastPRs.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted text-center">Aucun PR enregistré</p>
        ) : lastPRs.map((pr, i) => pr && (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium capitalize">{pr.lift}</p>
              <p className="text-[10px] text-muted mt-0.5">{pr.date} • {pr.reps} rep{pr.reps > 1 ? 's' : ''}</p>
            </div>
            <span className="text-accent font-bold tabular-nums text-lg font-display">{pr.weight} kg</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub Tab Bar ─────────────────────────────────────────────────────
function SubTabBar({ active, onChange }: { active: SubTab; onChange: (t: SubTab) => void }) {
  const tabs: { id: SubTab; label: string }[] = [
    { id: 'charges', label: 'Charges' },
    { id: 'rpe', label: 'RPE' },
  ]
  return (
    <div className="flex gap-2 p-1 rounded-pill bg-white/5">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-pill transition-colors duration-200 cursor-pointer",
            active === t.id
              ? "bg-accent text-background"
              : "text-muted hover:text-white"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Charges Panel ───────────────────────────────────────────────────
function ChargesPanel() {
  const { state, updateRM, updateName } = useCanditoState()
  const [localName, setLocalName] = useState(state.athlete.name)
  const [localRM, setLocalRM] = useState({
    squat: state.athlete.rm.squat.toString(),
    bench: state.athlete.rm.bench.toString(),
    deadlift: state.athlete.rm.deadlift.toString(),
  })

  const handleBlur = (lift: 'squat' | 'bench' | 'deadlift') => {
    const value = Number(localRM[lift]) || 0
    updateRM({ [lift]: value })
  }

  const rm = {
    squat: Number(localRM.squat) || 0,
    bench: Number(localRM.bench) || 0,
    deadlift: Number(localRM.deadlift) || 0,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Name Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">
          Ton Prénom
        </label>
        <input
          type="text"
          value={localName}
          onChange={e => setLocalName(e.target.value)}
          onBlur={() => updateName(localName)}
          placeholder="Ex: Théo"
          className="bg-white/5 border border-border rounded-input py-3 px-4 text-base font-display text-white w-full focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
        />
      </div>

      {/* RM Inputs */}
      <div className="grid grid-cols-3 gap-3">
        {(['squat', 'bench', 'deadlift'] as const).map(lift => (
          <div key={lift} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted text-center">
              {lift === 'squat' ? 'Squat' : lift === 'bench' ? 'Bench' : 'Deadlift'}
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={localRM[lift]}
              onChange={e => setLocalRM(prev => ({ ...prev, [lift]: e.target.value }))}
              onBlur={() => handleBlur(lift)}
              className="bg-white/5 border border-border rounded-input py-3 text-center text-xl font-display text-white w-full tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-colors"
            />
            <span className="text-[9px] text-muted text-center">kg</span>
          </div>
        ))}
      </div>

      {/* Charges Table */}
      <div className="glass rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">%</th>
                <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted">Usage</th>
                <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted">Squat</th>
                <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted">Bench</th>
                <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-widest text-muted">DL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PERCENTAGES.map(pct => (
                <tr
                  key={pct}
                  className={cn(pct >= 95 && "bg-accent/5")}
                >
                  <td className="py-2.5 px-3 text-white font-medium tabular-nums">{pct}%</td>
                  <td className="py-2.5 px-3 text-white/60 text-xs">{USAGE_MAP[pct]}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-white/80">
                    {rm.squat ? `${calcWeight(rm.squat, pct / 100)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-white/80">
                    {rm.bench ? `${calcWeight(rm.bench, pct / 100)}` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-white/80">
                    {rm.deadlift ? `${calcWeight(rm.deadlift, pct / 100)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── RPE Panel ───────────────────────────────────────────────────────
function RPEPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* RPE Scale */}
      <div className="glass rounded-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-lg font-display text-white italic">Échelle RPE</h3>
        </div>
        <div className="divide-y divide-border">
          {RPE_DATA.map(r => (
            <div key={r.rpe} className="px-5 py-3.5 flex items-center gap-4">
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center font-display text-lg font-bold shrink-0",
                r.rpe >= 9 ? "bg-danger/10 text-danger" :
                r.rpe >= 7 ? "bg-accent/10 text-accent" :
                "bg-white/5 text-muted"
              )}>
                {r.rpe}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{r.sensation}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                  {r.rir} RIR
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Autoregulation Rules */}
      <div className="glass rounded-card p-5 space-y-3">
        <h3 className="text-lg font-display text-white italic">Autorégulation</h3>
        <ul className="space-y-2.5">
          {[
            'RPE réel > cible de +1 → baisser de 2.5-5 kg',
            'RPE réel < cible de -1 → augmentation légère possible',
            '3+ séances à RPE > 9 → mini-décharge (volume -40%)',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
              <span className="size-1.5 rounded-full bg-accent mt-2 shrink-0" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Alert Signals */}
      <div className="glass rounded-card p-5 space-y-3 border-danger/20">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-danger" />
          <h3 className="text-lg font-display text-white italic">Signaux d'alerte</h3>
        </div>
        <ul className="space-y-2.5">
          {[
            'Douleur articulaire aiguë',
            'Technique qui s\'effondre sous charge',
            'Vertiges ou nausées persistantes',
            'RPE +2 vs semaine précédente à charges égales',
          ].map((signal, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
              <span className="size-1.5 rounded-full bg-danger mt-2 shrink-0" />
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────
export function Progres() {
  const { state } = useCanditoState()
  const [activeTab, setActiveTab] = useState<SubTab>('charges')

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Progrès
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
          Suivi des charges et autorégulation
        </p>
      </div>

      <SessionTimeline completedSessions={state.progress.completedSessions} />

      <PRSection />

      <SubTabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'charges' ? <ChargesPanel /> : <RPEPanel />}
    </div>
  )
}
