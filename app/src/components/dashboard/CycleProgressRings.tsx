import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RingProps {
  label: string
  value: number
  target: number
  color: string
}

function ProgressRing({ label, value, target, color }: RingProps) {
  const R = 32
  const circ = 2 * Math.PI * R
  const pct = Math.min(100, Math.round((value / target) * 100)) || 0

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-20">
        <svg viewBox="0 0 80 80" className="-rotate-90 size-full">
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          <motion.circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold tabular-nums text-white">{value}</span>
        </div>
      </div>
      <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">{label}</p>
    </div>
  )
}

interface CycleProgressRingsProps {
  squat: number
  bench: number
  deadlift: number
}

export function CycleProgressRings({ squat, bench, deadlift }: CycleProgressRingsProps) {
  return (
    <div className="glass p-6 rounded-card border-none grid grid-cols-3 gap-4">
      <ProgressRing label="Squat" value={squat} target={200} color="var(--color-accent)" />
      <ProgressRing label="Bench" value={bench} target={140} color="rgba(255,255,255,0.7)" />
      <ProgressRing label="Deadlift" value={deadlift} target={240} color="rgba(255,255,255,0.4)" />
    </div>
  )
}
