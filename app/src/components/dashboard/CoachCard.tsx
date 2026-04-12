import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CoachCardProps {
  name: string
  sessionFocus?: string
}

export function CoachCard({ name, sessionFocus }: CoachCardProps) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  return (
    <div className={cn(
      "glass p-6 rounded-card border-none flex flex-col gap-3",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      <div className="flex items-center gap-2">
        <span className="size-2 bg-accent rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent/80">
          Coach Candito AI
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-display text-white">
          {greeting}, {name}.
        </h2>
        {sessionFocus && (
          <p className="text-muted text-sm font-medium">
             Focus du jour : <span className="text-white font-semibold">{sessionFocus}</span>.
          </p>
        )}
      </div>

      <div className="h-[1px] w-8 bg-accent/20 my-1" />

      <p className="text-muted text-sm leading-relaxed max-w-[90%]">
        C'est le début. Chaque grand total commence ici. Technique propre, charges contrôlées — on construit ensemble.
      </p>
    </div>
  )
}
