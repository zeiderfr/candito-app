import { cn } from '@/lib/utils'
import { Zap, ChevronRight, Moon, Coffee } from 'lucide-react'
import { type Session } from '@/types'

interface NextSessionHeroProps {
  workoutState: 
    | { type: 'workout'; session: Session } 
    | { type: 'rest'; action: string; suggestion: string }
  getWeight: (lift: 'squat' | 'bench' | 'deadlift' | undefined, percentage: number) => number | null
}

export function NextSessionHero({ workoutState, getWeight }: NextSessionHeroProps) {
  // ── ÉTAT REPOS (EMPTY STATE PREMIUM) ───────────────────────────────────────
  if (workoutState.type === 'rest') {
    return (
      <div className={cn(
        "glass p-8 rounded-card border-none flex flex-col gap-6 bg-surface/40",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}>
        <div className="flex items-center gap-2">
          <Moon size={14} className="text-dim" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-dim">
            Mode Récupération
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-display text-white">
            {workoutState.action}
          </h3>
          <p className="text-muted text-sm leading-relaxed max-w-[90%]">
            {workoutState.suggestion} Le progrès se construit aussi dans le calme.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button className={cn(
            "flex-1 bg-white/5 hover:bg-white/10 transition-colors",
            "text-white/60 font-bold uppercase tracking-wider text-[10px] py-4 rounded-xl",
            "flex items-center justify-center gap-2 cursor-pointer"
          )}>
            <Coffee size={14} />
            CONSEILS NUTRITION
          </button>
          <button className={cn(
            "flex-1 bg-white/5 hover:bg-white/10 transition-colors",
            "text-white/60 font-bold uppercase tracking-wider text-[10px] py-4 rounded-xl",
            "flex items-center justify-center gap-2 cursor-pointer"
          )}>
            MOBILITÉ ACTIVE
          </button>
        </div>
      </div>
    )
  }

  // ── ÉTAT ENTRAÎNEMENT (SESSION ACTIVE) ─────────────────────────────────────
  const { session } = workoutState
  const primaryEx = session.exercises[0]
  const targetWeight = primaryEx.percentage 
      ? getWeight(primaryEx.lift, primaryEx.percentage.hi) 
      : null

  return (
    <div className={cn(
      "relative group glass p-8 rounded-card border-none flex flex-col gap-8 overflow-hidden",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-accent fill-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-accent/80">
            {session.day} — {session.focus}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-4xl font-display text-white italic tracking-tight">
              {primaryEx.name}
            </h3>
            <p className="text-muted text-lg tracking-wide">
              {primaryEx.sets} séries × {primaryEx.reps} reps
            </p>
          </div>

          {targetWeight !== null && (
            <div className={cn(
              "inline-flex items-baseline gap-1.5 tabular-nums px-5 py-3 rounded-2xl",
              "bg-white/5 border border-white/5 shadow-inner"
            )}>
               <span className="text-5xl font-display text-white tracking-tighter tabular-nums">
                 {targetWeight}
               </span>
               <span className="text-xl font-display text-accent pt-2">kg</span>
            </div>
          )}
        </div>

        {/* Accessoires plus discrets */}
        <div className="space-y-3 pt-2 border-t border-white/5">
           <span className="text-[9px] font-bold text-muted/60 uppercase tracking-widest">Plan de bataille accessoire</span>
           <div className="flex flex-col gap-2">
             {session.exercises.slice(1).map((ex, i) => (
               <div key={i} className="flex justify-between items-center text-sm">
                 <span className="text-white/80">{ex.name}</span>
                 <span className="text-muted tabular-nums font-medium">{ex.sets}×{ex.reps}</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      <button className={cn(
        "w-full bg-accent hover:bg-[#77cc7b] active:scale-[0.98] transition-all",
        "text-background font-bold uppercase tracking-widest text-[12px] py-6 px-4 rounded-pill",
        "flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
      )}>
        DÉMARRER LA SÉANCE
        <ChevronRight size={16} />
      </button>

      {/* Decorative pulse for session active */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 size-56 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
    </div>
  )
}
