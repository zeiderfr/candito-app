import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { useToasts } from '@/context/ToastContext'
import { PROGRAM_DATA, WEEK_ORDER, PROGRAM_METADATA } from '@/data/program'
import { hasSessionOverride, hasWeekOverrides } from '@/lib/programResolver'
import { ChevronRight, Dumbbell, RotateCcw } from 'lucide-react'

export function ProgramMainView({
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
