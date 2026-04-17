import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { COACH_MESSAGES, type CoachTimeSlot } from '@/data/program'

function getTimeContext(): { slot: CoachTimeSlot; greeting: string } {
  const hour = new Date().getHours()
  if (hour < 13) return { slot: 'matin',  greeting: 'Bonjour' }
  if (hour < 14) return { slot: 'midi',   greeting: 'Bonjour' }
  if (hour < 18) return { slot: 'aprem',  greeting: 'Bon après-midi' }
  return             { slot: 'soir',   greeting: 'Bonsoir' }
}

export function CoachCard() {
  const { state } = useCandito()

  const { greeting, message, tone } = useMemo(() => {
    const { slot, greeting } = getTimeContext()
    const dayOfWeek = new Date().getDay()

    const weekData = COACH_MESSAGES[state.currentWeekId] ?? COACH_MESSAGES['s1']
    const pool = weekData[slot]
    const message = pool[dayOfWeek % pool.length]

    return { greeting, message, tone: weekData.tone }
  }, [state.currentWeekId])

  return (
    <div className={cn(
      "glass p-6 rounded-card border-none flex flex-col gap-3",
      "animate-in fade-in slide-in-from-bottom-4 duration-300"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            Coach Candito AI
          </span>
        </div>
        <span className="text-[9px] text-dim/60 uppercase tracking-widest font-bold italic">
          {tone}
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-display text-white">
          {greeting}, {state.athlete.name}.
        </h2>
      </div>

      <div className="h-[1px] w-8 bg-accent/20 my-1" />

      <p className="text-muted text-sm leading-relaxed max-w-[90%]">
        {message}
      </p>
    </div>
  )
}
