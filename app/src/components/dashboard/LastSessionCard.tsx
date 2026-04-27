import { useMemo } from 'react'
import { ClockArrowUp } from 'lucide-react'
import { useCandito } from '@/context/CanditoContext'
import type { SessionLog, SetLog } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  
  // Date Comparison
  const isToday = now.toLocaleDateString() === then.toLocaleDateString()
  if (isToday) return "aujourd'hui"
  
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = yesterday.toLocaleDateString() === then.toLocaleDateString()
  if (isYesterday) return 'hier'
  
  const diffTime = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `il y a ${diffDays}j` : "aujourd'hui"
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function topSetForLift(
  log: SessionLog,
  lift: 'squat' | 'bench' | 'deadlift'
): SetLog | null {
  const sets = log.exercises
    .filter(ex => ex.lift === lift)
    .flatMap(ex => ex.sets)
    .filter(s => s.weight != null && s.weight > 0)
  if (!sets.length) return null
  return sets.reduce((best, s) => (s.weight! > best.weight! ? s : best))
}

function computeTonnage(log: SessionLog): number {
  return log.exercises
    .flatMap(ex => ex.sets)
    .filter(s => s.weight != null && s.reps > 0)
    .reduce((sum, s) => sum + s.weight! * s.reps, 0)
}

// ── LiftRow ───────────────────────────────────────────────────────────

const LIFT_SHORT: Record<'squat' | 'bench' | 'deadlift', string> = {
  squat: 'SQ',
  bench: 'BP',
  deadlift: 'DL',
}

function LiftRow({
  lift,
  set,
}: {
  lift: 'squat' | 'bench' | 'deadlift'
  set: SetLog | null
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-bold text-dim uppercase tracking-wider w-6 shrink-0">
        {LIFT_SHORT[lift]}
      </span>
      {set ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold text-white tabular-nums">
            {set.weight} kg
          </span>
          <span className="text-[10px] text-muted tabular-nums">
            × {set.reps}
          </span>
          {set.rpe != null && (
            <span className="text-[9px] font-bold text-muted bg-white/5 px-1.5 py-0.5 rounded-full tabular-nums">
              @{set.rpe}
            </span>
          )}
        </div>
      ) : (
        <span className="text-[11px] text-muted/30">—</span>
      )}
    </div>
  )
}

// ── LastSessionCard ───────────────────────────────────────────────────

export function LastSessionCard() {
  const { state } = useCandito()

  const data = useMemo(() => {
    const logs = state.progress.sessionLogs
    if (!logs.length) return null

    const last = [...logs].sort((a, b) => {
      const timeA = new Date(a.startedAt ?? a.date).getTime()
      const timeB = new Date(b.startedAt ?? b.date).getTime()
      return timeB - timeA
    })[0]

    const isoDate = last.startedAt ?? last.date
    const squat    = topSetForLift(last, 'squat')
    const bench    = topSetForLift(last, 'bench')
    const deadlift = topSetForLift(last, 'deadlift')
    const hasLifts = squat || bench || deadlift

    // Fallback si aucun lift typé: 2 premiers exercices avec poids
    const fallbackExercises = hasLifts
      ? []
      : last.exercises
          .filter(ex => ex.sets.some(s => s.weight != null && s.weight > 0))
          .slice(0, 2)
          .map(ex => {
            const best = ex.sets
              .filter(s => s.weight != null)
              .reduce((b, s) => (s.weight! > b.weight! ? s : b), ex.sets[0])
            return { name: ex.exerciseName, set: best }
          })

    const tonnage = computeTonnage(last)
    const tonnes  = (tonnage / 1000).toFixed(1)
    const heavy   = tonnage >= 3000

    return {
      focus: last.sessionFocus ?? last.sessionId,
      relative: relativeDate(isoDate),
      dateStr: formatDate(isoDate),
      squat,
      bench,
      deadlift,
      hasLifts,
      fallbackExercises,
      tonnes,
      heavy,
    }
  }, [state.progress.sessionLogs])

  if (!data) return null

  return (
    <div className="glass rounded-2xl border border-border p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockArrowUp size={13} className="text-muted" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Dernière séance
          </span>
        </div>
        <span className="text-[10px] font-bold text-dim tabular-nums">
          {data.relative}
        </span>
      </div>

      {/* Focus + date */}
      <div>
        <p className="text-[13px] font-bold text-white">{data.focus}</p>
        <p className="text-[10px] text-muted capitalize mt-0.5">{data.dateStr}</p>
      </div>

      <div className="h-px bg-border/60" />

      {/* Lifts ou exercices fallback */}
      {data.hasLifts ? (
        <div className="space-y-2">
          <LiftRow lift="squat"    set={data.squat} />
          <LiftRow lift="bench"    set={data.bench} />
          <LiftRow lift="deadlift" set={data.deadlift} />
        </div>
      ) : data.fallbackExercises.length > 0 ? (
        <div className="space-y-2">
          {data.fallbackExercises.map((ex, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/70 truncate flex-1">{ex.name}</span>
              {ex.set?.weight != null ? (
                <span className="text-[13px] font-bold text-white tabular-nums shrink-0">
                  {ex.set.weight} kg × {ex.set.reps}
                </span>
              ) : (
                <span className="text-muted/30 text-[11px]">—</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted/40 italic">Aucune charge enregistrée</p>
      )}

      {/* Volume total */}
      {parseFloat(data.tonnes) > 0 && (
        <>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold">
              Volume total
            </span>
            <span className={data.heavy ? 'text-accent text-[13px] font-bold tabular-nums' : 'text-muted text-[12px] font-bold tabular-nums'}>
              {data.tonnes} t
            </span>
          </div>
        </>
      )}
    </div>
  )
}
