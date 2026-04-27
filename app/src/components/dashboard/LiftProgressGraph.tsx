import { motion } from 'framer-motion'
import { type PR } from '@/types'

interface LiftProgressGraphProps {
  prs: PR[]
}

const LIFTS = [
  { key: 'squat', color: 'var(--color-accent)', label: 'Squat' },
  { key: 'bench', color: 'rgba(255,255,255,0.6)', label: 'Bench' },
  { key: 'deadlift', color: 'rgba(255,255,255,0.3)', label: 'Deadlift' },
] as const

export function LiftProgressGraph({ prs }: LiftProgressGraphProps) {
  if (prs.length === 0) return (
    <div className="glass rounded-card p-5 h-48 flex items-center justify-center">
      <p className="text-muted text-xs uppercase tracking-widest font-bold opacity-30">En attente de records...</p>
    </div>
  )

  const CHART_W = 400, CHART_H = 200
  const PADDING = { top: 20, right: 30, bottom: 40, left: 40 }

  const dates = [...new Set(prs.map(p => p.date))].sort()
  const minTime = new Date(dates[0]).getTime()
  const maxTime = new Date(dates[dates.length - 1]).getTime()

  const weights = prs.map(p => p.weight)
  const yMin = Math.max(0, Math.floor(Math.min(...weights) / 10) * 10 - 20)
  const yMax = Math.ceil(Math.max(...weights) / 10) * 10 + 20

  const xScale = (date: string): number => {
    if (dates.length < 2) return PADDING.left + (CHART_W - PADDING.left - PADDING.right) / 2
    const ratio = (new Date(date).getTime() - minTime) / (maxTime - minTime) || 0
    return PADDING.left + ratio * (CHART_W - PADDING.left - PADDING.right)
  }
  const yScale = (weight: number): number => {
    const ratio = (weight - yMin) / (yMax - yMin)
    return CHART_H - PADDING.bottom - ratio * (CHART_H - PADDING.top - PADDING.bottom)
  }

  // Generate Bezier path
  const getPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ""
    return points.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x},${p.y}`
      const cp1x = a[i - 1].x + (p.x - a[i - 1].x) / 2
      return `${acc} C ${cp1x},${a[i - 1].y} ${cp1x},${p.y} ${p.x},${p.y}`
    }, "")
  }

  return (
    <div className="glass rounded-card p-6 space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display text-white italic">Trajectoire de force</h3>
        <div className="flex gap-4">
          {LIFTS.map(l => (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full overflow-visible">
        {/* Y Grid Lines */}
        {[yMin, (yMin + yMax) / 2, yMax].map((y, i) => {
          const yPos = yScale(y)
          return (
            <g key={i}>
              <line 
                x1={PADDING.left} y1={yPos} x2={CHART_W - PADDING.right} y2={yPos} 
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

        {/* X Dates Labels */}
        {dates.length > 1 && [dates[0], dates[dates.length - 1]].map((d, i) => (
          <text 
            key={i} x={xScale(d)} y={CHART_H - 10} 
            fill="var(--color-muted)" fontSize={8} 
            textAnchor={i === 0 ? "start" : "end"}
            className="font-bold uppercase tracking-wider opacity-50"
          >
            {new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
          </text>
        ))}

        {/* Lift Lines */}
        {LIFTS.map(lift => {
          const data = prs
            .filter(p => p.lift === lift.key)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            
          if (data.length === 0) return null
          
          const points = data.map(p => ({ x: xScale(p.date), y: yScale(p.weight) }))
          const path = getPath(points)
          
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
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              />
              {points.map((p, i) => (
                <motion.circle 
                  key={i} 
                  cx={p.x} cy={p.y} r={3} 
                  fill={lift.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.1, type: "spring" }}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
