import { cn } from '@/lib/utils'
import { Zap, ChevronRight } from 'lucide-react'

interface NextSessionHeroProps {
  sessionTitle: string
  mainExercise: string
  targetWeight: string
  setsReps: string
}

export function NextSessionHero({ sessionTitle, mainExercise, targetWeight, setsReps }: NextSessionHeroProps) {
  return (
    <div className={cn(
      "relative group glass p-8 rounded-card border-none flex flex-col gap-6 overflow-hidden",
      "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-accent fill-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent/80">
            {sessionTitle}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-3xl font-display text-white">
            {mainExercise}
          </h3>
          <p className="text-muted text-lg tracking-wide">
            {setsReps}
          </p>
        </div>

        <div className={cn(
          "inline-flex items-center gap-1.5 tabular-nums px-4 py-2 rounded-lg",
          "bg-white/5 border border-white/5 shadow-inner"
        )}>
           <span className="text-4xl font-display text-white">{targetWeight}</span>
           <span className="text-lg font-display text-white/40 pt-2">kg</span>
        </div>
      </div>

      <button className={cn(
        "w-full bg-accent hover:bg-[#77cc7b] active:scale-[0.98] transition-all",
        "text-background font-bold uppercase tracking-widest text-[12px] py-6 px-4 rounded-pill",
        "flex items-center justify-center gap-2 shadow-lg shadow-accent/10 cursor-pointer"
      )}>
        DÉMARRER LA SÉANCE
        <ChevronRight size={16} />
      </button>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 size-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
