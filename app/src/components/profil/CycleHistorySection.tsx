import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type CycleSnapshot } from '@/types'
import { Database, ChevronDown } from 'lucide-react'
import { SectionLabel } from './SectionLabel'

export function CycleHistorySection({ history }: { history: CycleSnapshot[] }) {
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
