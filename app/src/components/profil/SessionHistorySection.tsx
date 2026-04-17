import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCandito } from '@/context/CanditoContext'
import { PROGRAM_DATA } from '@/data/program'
import { type SessionLog } from '@/types'
import { ClockArrowUp, ChevronDown, ChevronRight } from 'lucide-react'
import { SectionLabel } from './SectionLabel'

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function getSessionFocus(log: SessionLog): string {
  if (log.sessionFocus) return log.sessionFocus
  for (const weekData of Object.values(PROGRAM_DATA)) {
    const s = weekData.sessions.find((s: { id: string }) => s.id === log.sessionId)
    if (s) return s.focus
  }
  return log.sessionId
}

function topSet(sets: SessionLog['exercises'][number]['sets']) {
  if (sets.length === 0) return null
  return sets.reduce((best, s) => ((s.weight ?? 0) > (best.weight ?? 0) ? s : best))
}

// ── SessionCard ───────────────────────────────────────────────────────
function SessionCard({ log }: { log: SessionLog }) {
  const [expanded, setExpanded] = useState(false)
  const focus = getSessionFocus(log)
  const dateStr = formatDate(log.startedAt ?? log.date)

  // Only exercises that have at least one logged set with weight
  const meaningful = log.exercises.filter(ex => ex.sets.some(s => s.weight != null))

  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{focus}</p>
          <p className="text-[10px] text-muted mt-0.5 capitalize tabular-nums">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {meaningful.length > 0 && !expanded && (
            <span className="text-[10px] text-muted/60 font-bold">
              {meaningful.length} ex.
            </span>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 border-t border-border/60 pt-3">
              {log.exercises.length === 0 && (
                <p className="text-[11px] text-muted italic">Aucun exercice enregistré.</p>
              )}
              {log.exercises.map((ex, i) => {
                const best = topSet(ex.sets)
                return (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/80 truncate">{ex.exerciseName}</p>
                      <p className="text-[10px] text-muted tabular-nums">
                        {ex.sets.length} série{ex.sets.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    {best && best.weight != null ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-accent tabular-nums">
                          {best.weight} kg
                        </span>
                        {best.rpe != null && (
                          <span className="text-[9px] font-bold text-muted bg-white/5 px-1.5 py-0.5 rounded-full tabular-nums">
                            @{best.rpe}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted/40">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── SessionHistorySection ─────────────────────────────────────────────
export function SessionHistorySection() {
  const { state } = useCandito()
  const [showAll, setShowAll] = useState(false)

  const logs = [...state.progress.sessionLogs]
    .sort((a, b) => {
      const ta = new Date(a.startedAt ?? a.date).getTime()
      const tb = new Date(b.startedAt ?? b.date).getTime()
      return tb - ta
    })

  if (logs.length === 0) return null

  const visible = showAll ? logs : logs.slice(0, 5)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon={<ClockArrowUp size={14} />}>
          Historique des séances
        </SectionLabel>
        <span className="text-[10px] text-muted font-bold tabular-nums">
          {logs.length} séance{logs.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {visible.map((log, i) => (
          <SessionCard key={`${log.sessionId}-${i}`} log={log} />
        ))}
      </div>

      {logs.length > 5 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors cursor-pointer"
        >
          {showAll ? (
            <>Voir moins <ChevronDown size={12} /></>
          ) : (
            <>Voir tout ({logs.length}) <ChevronRight size={12} /></>
          )}
        </button>
      )}
    </section>
  )
}
