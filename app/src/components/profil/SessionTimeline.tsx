import { motion } from 'framer-motion'
import { PROGRAM_DATA, WEEK_ORDER } from '@/data/program'

export function SessionTimeline({ completedSessions }: { completedSessions: string[] }) {
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
