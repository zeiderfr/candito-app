import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useCandito } from '@/context/CanditoContext'
import { TrendingUp } from 'lucide-react'

// ── Lift config ──────────────────────────────────────────────────────
const LIFTS = [
  { key: 'squat' as const, color: 'var(--color-accent)', label: 'Squat' },
  { key: 'bench' as const, color: 'rgba(255,255,255,0.6)', label: 'Bench' },
  { key: 'deadlift' as const, color: 'rgba(255,255,255,0.3)', label: 'Deadlift' },
]

// ── Types ────────────────────────────────────────────────────────────
interface RMPoint {
  label: string
  squat: number
  bench: number
  deadlift: number
  total: number
  isCurrent?: boolean
}

// ── Insight algorithmique local (remplace appel API Claude) ─────────
function generateLocalInsight(points: RMPoint[]): string {
  if (points.length < 2) return ''

  const first = points[0]
  const last = points[points.length - 1]

  const deltas = {
    squat: last.squat - first.squat,
    bench: last.bench - first.bench,
    deadlift: last.deadlift - first.deadlift,
  }

  const totalDelta = last.total - first.total
  const lifts = Object.entries(deltas) as [keyof typeof deltas, number][]
  const stagnant = lifts.filter(([, d]) => d === 0)
  const regressing = lifts.filter(([, d]) => d < 0)
  const progressing = lifts.filter(([, d]) => d > 0)

  const liftName = (k: string) =>
    k === 'squat' ? 'squat' : k === 'bench' ? 'bench' : 'deadlift'

  // ── Priority messages ──────────────────────────────────────────────
  if (regressing.length > 0) {
    const worst = regressing.sort((a, b) => a[1] - b[1])[0]
    return `Attention : ${liftName(worst[0])} en régression (${worst[1]}kg). Revois ta programmation`
  }

  if (stagnant.length === 3) {
    return 'Plateau général. Envisage un deload prolongé ou un changement de variables'
  }

  if (stagnant.length > 0 && progressing.length > 0) {
    const best = progressing.sort((a, b) => b[1] - a[1])[0]
    const stuck = stagnant[0]
    return `${liftName(best[0])} progresse (+${best[1]}kg) — ${liftName(stuck[0])} stagne, c'est ton prochain levier`
  }

  if (totalDelta > 0 && progressing.length === 3) {
    return `Progression constante sur les 3 lifts (+${totalDelta}kg au total). Continue sur cette lancée`
  }

  if (totalDelta > 0) {
    const best = progressing.sort((a, b) => b[1] - a[1])[0]
    return `Total en hausse (+${totalDelta}kg). ${liftName(best[0])} mène la progression`
  }

  return 'Données insuffisantes pour analyser la tendance'
}

// ── SVG Bezier path helper ───────────────────────────────────────────
function getPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  return points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const cp1x = a[i - 1].x + (p.x - a[i - 1].x) / 2
    return `${acc} C ${cp1x},${a[i - 1].y} ${cp1x},${p.y} ${p.x},${p.y}`
  }, '')
}

// ── Component ────────────────────────────────────────────────────────
export function CycleRMGraph() {
  const { state } = useCandito()

  const points: RMPoint[] = useMemo(() => [
    ...state.cycleHistory.map(c => ({
      label: `Cycle ${c.number}`,
      squat: c.rm.squat,
      bench: c.rm.bench,
      deadlift: c.rm.deadlift,
      total: c.rm.squat + c.rm.bench + c.rm.deadlift,
    })),
    {
      label: 'Maintenant',
      squat: state.athlete.rm.squat,
      bench: state.athlete.rm.bench,
      deadlift: state.athlete.rm.deadlift,
      total: state.athlete.rm.squat + state.athlete.rm.bench + state.athlete.rm.deadlift,
      isCurrent: true,
    }
  ], [state.cycleHistory, state.athlete.rm])

  const insight = useMemo(() => generateLocalInsight(points), [points])

  // Ne pas afficher si < 2 points (besoin d'au moins 1 cycle passé + maintenant)
  if (points.length < 2) return null

  // ── SVG dimensions ─────────────────────────────────────────────────
  const CHART_W = 400
  const CHART_H = 160
  const PAD = { top: 20, right: 30, bottom: 35, left: 45 }

  const allWeights = points.flatMap(p => [p.squat, p.bench, p.deadlift])
  const yMin = Math.max(0, Math.floor(Math.min(...allWeights) / 10) * 10 - 10)
  const yMax = Math.ceil(Math.max(...allWeights) / 10) * 10 + 10

  const xScale = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (CHART_W - PAD.left - PAD.right)
  const yScale = (w: number) => {
    const ratio = (w - yMin) / (yMax - yMin)
    return CHART_H - PAD.bottom - ratio * (CHART_H - PAD.top - PAD.bottom)
  }

  return (
    <div className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-2 px-1">
        <TrendingUp size={14} className="text-muted" />
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
          Évolution 1RM
        </span>
      </div>

      <div className="glass rounded-card p-5 space-y-4 overflow-hidden border border-border">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {LIFTS.map(l => (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-px border-t border-dashed border-white/20" />
            <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Total</span>
          </div>
        </div>

        {/* SVG Chart */}
        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full overflow-visible">
          {/* Y Grid */}
          {[yMin, Math.round((yMin + yMax) / 2), yMax].map((y, i) => {
            const yPos = yScale(y)
            return (
              <g key={i}>
                <line
                  x1={PAD.left} y1={yPos} x2={CHART_W - PAD.right} y2={yPos}
                  stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4"
                />
                <text
                  x={0} y={yPos + 3} fill="var(--color-muted)" fontSize={8}
                  className="font-bold tabular-nums opacity-50"
                >
                  {Math.round(y)}kg
                </text>
              </g>
            )
          })}

          {/* X Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={xScale(i)}
              y={CHART_H - 8}
              fill={p.isCurrent ? 'var(--color-accent)' : 'var(--color-muted)'}
              fontSize={p.isCurrent ? 9 : 7}
              fontWeight={p.isCurrent ? 700 : 600}
              textAnchor="middle"
              className="uppercase tracking-wider"
            >
              {p.label}
            </text>
          ))}

          {/* Total curve (dashed) */}
          {(() => {
            const totalMin = Math.min(...points.map(p => p.total))
            const totalMax = Math.max(...points.map(p => p.total))
            const tScale = (t: number) => {
              const ratio = totalMax === totalMin ? 0.5 : (t - totalMin) / (totalMax - totalMin)
              return CHART_H - PAD.bottom - ratio * (CHART_H - PAD.top - PAD.bottom)
            }
            const totalPts = points.map((p, i) => ({ x: xScale(i), y: tScale(p.total) }))
            const path = getPath(totalPts)
            if (!path) return null
            return (
              <motion.path
                d={path}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
              />
            )
          })()}

          {/* Lift curves */}
          {LIFTS.map(lift => {
            const pts = points.map((p, i) => ({ x: xScale(i), y: yScale(p[lift.key]) }))
            const path = getPath(pts)
            if (!path) return null

            return (
              <g key={lift.key}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke={lift.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                />
                {pts.map((p, i) => (
                  <motion.circle
                    key={i}
                    cx={p.x} cy={p.y} r={points[i].isCurrent ? 4 : 3}
                    fill={lift.color}
                    className={points[i].isCurrent ? 'animate-pulse' : ''}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 400, damping: 25 }}
                  />
                ))}
              </g>
            )
          })}
        </svg>

        {/* Insight local */}
        {insight && (
          <div className="border-t border-border/60 pt-3">
            <p className="text-[11px] text-muted/70 italic leading-relaxed">
              {insight}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
