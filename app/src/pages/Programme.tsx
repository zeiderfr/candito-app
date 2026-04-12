import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'
import { PROGRAM_DATA, PROGRAM_METADATA } from '@/data/program'
import { calcWeight } from '@/lib/weightCalc'
import { CheckCircle2, Circle } from 'lucide-react'

type S6Variant = 's6_test' | 's6_dec'

// ── Week display labels for the pill selector ───────────────────────
const WEEK_LABELS: Record<string, string> = {
  s1s2: 'S1-2',
  s3: 'S3',
  s4: 'S4',
  s5: 'S5',
  s6_test: 'S6',
  s6_dec: 'S6',
}

// Unique pills (S6 is one pill controlling both s6_test and s6_dec)
const PILL_WEEKS = ['s1s2', 's3', 's4', 's5', 's6'] as const

function getWeekIdForPill(pill: string, s6Variant: S6Variant): string {
  return pill === 's6' ? s6Variant : pill
}

function getPillForWeekId(weekId: string): string {
  return weekId.startsWith('s6') ? 's6' : weekId
}

// ── Week Selector ───────────────────────────────────────────────────
function WeekSelector({
  selectedWeekId,
  s6Variant,
  onWeekChange,
  onS6VariantChange,
}: {
  selectedWeekId: string
  s6Variant: S6Variant
  onWeekChange: (weekId: string) => void
  onS6VariantChange: (v: S6Variant) => void
}) {
  const activePill = getPillForWeekId(selectedWeekId)

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
        {PILL_WEEKS.map(pill => {
          const isActive = activePill === pill
          return (
            <button
              key={pill}
              onClick={() => onWeekChange(getWeekIdForPill(pill, s6Variant))}
              className={cn(
                "px-5 py-2.5 rounded-pill text-[11px] font-bold uppercase tracking-widest shrink-0 transition-colors duration-200 cursor-pointer",
                isActive
                  ? "bg-accent text-background"
                  : "bg-white/5 text-muted hover:text-white"
              )}
            >
              {pill === 's6' ? 'S6' : WEEK_LABELS[pill]}
            </button>
          )
        })}
      </div>

      {/* S6 sub-variant toggle */}
      {selectedWeekId.startsWith('s6') && (
        <div className="flex gap-2">
          {([
            { id: 's6_test' as S6Variant, label: 'Test Maxis' },
            { id: 's6_dec' as S6Variant, label: 'Décharge' },
          ]).map(v => (
            <button
              key={v.id}
              onClick={() => {
                onS6VariantChange(v.id)
                onWeekChange(v.id)
              }}
              className={cn(
                "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 cursor-pointer",
                s6Variant === v.id
                  ? "bg-white/10 text-white border border-border"
                  : "text-muted hover:text-white"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Session Card ────────────────────────────────────────────────────
function SessionCard({
  session,
  isCompleted,
  onToggle,
  rm,
}: {
  session: { id: string; day?: string; focus: string; exercises: { name: string; sets: string; reps?: string; lift?: 'squat' | 'bench' | 'deadlift'; percentage?: { lo: number; hi: number } }[] }
  isCompleted: boolean
  onToggle: () => void
  rm: { squat: number; bench: number; deadlift: number }
}) {
  return (
    <div className={cn(
      "glass rounded-card overflow-hidden transition-opacity duration-200",
      isCompleted && "opacity-60"
    )}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{session.day}</p>
          <h3 className="text-base font-display text-white italic mt-0.5">{session.focus}</h3>
        </div>
        <button
          onClick={onToggle}
          className="cursor-pointer p-1 transition-colors duration-200"
          aria-label={isCompleted ? 'Marquer comme non fait' : 'Marquer comme fait'}
        >
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Done</span>
              <CheckCircle2 size={22} className="text-accent" />
            </div>
          ) : (
            <Circle size={22} className="text-muted hover:text-white" />
          )}
        </button>
      </div>

      {/* Exercises */}
      <div className="divide-y divide-border">
        {session.exercises.map((ex, i) => {
          const hasWeight = ex.lift && ex.percentage
          const loWeight = hasWeight ? calcWeight(rm[ex.lift!], ex.percentage!.lo) : null
          const hiWeight = hasWeight ? calcWeight(rm[ex.lift!], ex.percentage!.hi) : null

          return (
            <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{ex.name}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted tabular-nums">
                  {ex.sets}×{ex.reps}
                </span>
                {hasWeight && loWeight !== null && hiWeight !== null && rm[ex.lift!] > 0 && (
                  <span className="text-xs font-bold text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-pill whitespace-nowrap">
                    {loWeight === hiWeight ? `${loWeight} kg` : `${loWeight}–${hiWeight} kg`}
                  </span>
                )}
                {hasWeight && rm[ex.lift!] === 0 && (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────
export function Programme() {
  const { state, toggleSession, setCurrentWeek } = useCanditoState()
  const [selectedWeekId, setSelectedWeekId] = useState(state.currentWeekId)
  const [s6Variant, setS6Variant] = useState<S6Variant>(
    state.currentWeekId === 's6_dec' ? 's6_dec' : 's6_test'
  )

  const weekData = PROGRAM_DATA[selectedWeekId]
  const meta = PROGRAM_METADATA[selectedWeekId]
  const isActiveWeek = selectedWeekId === state.currentWeekId

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Programme
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
          {meta?.subtitle ?? 'Candito 6-Week Strength Program'}
        </p>
      </div>

      {/* Week Selector */}
      <WeekSelector
        selectedWeekId={selectedWeekId}
        s6Variant={s6Variant}
        onWeekChange={setSelectedWeekId}
        onS6VariantChange={setS6Variant}
      />

      {/* Week Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-display text-white italic">
          {meta?.title}
        </h2>
        {isActiveWeek && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-pill">
            Active
          </span>
        )}
      </div>

      {/* Session Cards */}
      {weekData?.sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          isCompleted={state.progress.completedSessions.includes(session.id)}
          onToggle={() => toggleSession(session.id)}
          rm={state.athlete.rm}
        />
      ))}

      {/* Set Current Week Button */}
      <button
        onClick={() => setCurrentWeek(selectedWeekId)}
        disabled={isActiveWeek}
        className={cn(
          "w-full py-4 rounded-pill text-[12px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer",
          isActiveWeek
            ? "bg-white/5 text-muted opacity-40 cursor-not-allowed"
            : "bg-accent text-background hover:bg-[#77cc7b] active:scale-[0.98] shadow-lg shadow-accent/20"
        )}
      >
        {isActiveWeek ? 'SEMAINE ACTIVE' : 'ACTIVER CETTE SEMAINE'}
      </button>

      <footer className="pt-4 pb-4 text-center">
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-40 italic">
          Forge ton corps, forge ton mental • Candito 6-Week
        </p>
      </footer>
    </div>
  )
}
