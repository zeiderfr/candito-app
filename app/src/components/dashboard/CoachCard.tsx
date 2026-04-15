import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'
import { COACH_MESSAGES } from '@/data/program'

export function CoachCard() {
  const { state } = useCanditoState()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 13) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  const coaching = COACH_MESSAGES[state.currentWeekId] ?? COACH_MESSAGES['s1s2']

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
          {coaching.tone}
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-display text-white">
          {greeting}, {state.athlete.name}.
        </h2>
      </div>

      <div className="h-[1px] w-8 bg-accent/20 my-1" />

      <p className="text-muted text-sm leading-relaxed max-w-[90%]">
        {coaching.message}
      </p>
    </div>
  )
}
