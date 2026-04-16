import { useEffect, useRef, memo } from 'react'
import { animate } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Zap, ChevronRight, Moon, Coffee } from 'lucide-react'
import { type Session } from '@/types'
import { useNavigation } from '@/context/NavigationContext'

interface NextSessionHeroProps {
  workoutState:
    | { type: 'workout'; session: Session }
    | { type: 'rest'; action: string; suggestion: string }
  getWeight: (lift: 'squat' | 'bench' | 'deadlift' | undefined, percentage: number) => number | null
}

export const NextSessionHero = memo(function NextSessionHero({ workoutState, getWeight }: NextSessionHeroProps) {
  const navigate = useNavigation()

  // Pre-compute pour les hooks
  const primaryEx = workoutState.type === 'workout' ? workoutState.session.exercises[0] : null
  const targetWeight = primaryEx?.percentage
    ? getWeight(primaryEx.lift, primaryEx.percentage.hi)
    : null

  const weightRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!weightRef.current || targetWeight === null) return
    const controls = animate(0, targetWeight, {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      delay: 0.3,
      onUpdate: (val) => {
        if (weightRef.current) {
          weightRef.current.textContent = String(Math.round(val / 2.5) * 2.5)
        }
      },
    })
    return () => controls.stop()
  }, [targetWeight])

  // ── ÉTAT REPOS ──────────────────────────────────────────────────────
  if (workoutState.type === 'rest') {
    return (
      <div className={cn(
        'glass p-6 rounded-card border-none flex flex-col gap-6 bg-surface/40',
        'animate-in fade-in slide-in-from-bottom-4 duration-300',
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
          <p className="text-muted text-xs leading-relaxed max-w-[95%]">
            {workoutState.suggestion} Le progrès se construit aussi dans le calme.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate('nutrition')}
            className={cn(
              'glass border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all duration-300',
              'p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer group text-left',
            )}>
            <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:bg-accent/10 transition-all shrink-0">
              <Coffee size={16} />
            </div>
            <span className="text-[9px] font-bold text-muted group-hover:text-white uppercase tracking-widest leading-tight">
              Conseils<br />Nutrition
            </span>
          </button>
          
          <button
            onClick={() => navigate('warmup')}
            className={cn(
              'glass border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all duration-300',
              'p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer group text-left',
            )}>
            <div className="size-9 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all shrink-0">
              <Zap size={16} />
            </div>
            <span className="text-[9px] font-bold text-muted group-hover:text-white uppercase tracking-widest leading-tight">
              Mobilité<br />Active
            </span>
          </button>
        </div>
      </div>
    )
  }

  // ── ÉTAT ENTRAÎNEMENT ───────────────────────────────────────────────
  const { session } = workoutState

  return (
    <div className={cn(
      'relative group glass p-8 rounded-card border-none flex flex-col gap-8 overflow-hidden',
      'animate-in fade-in slide-in-from-bottom-4 duration-300',
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
              {primaryEx!.name}
            </h3>
            <p className="text-muted text-lg tracking-wide">
              {primaryEx!.sets} séries × {primaryEx!.reps} reps
            </p>
          </div>

          {targetWeight !== null && (
            <div className={cn(
              'inline-flex items-baseline gap-1.5 tabular-nums px-5 py-3 rounded-2xl',
              'bg-white/5 border border-white/5 shadow-inner',
            )}>
              <span
                ref={weightRef}
                className="text-5xl font-display text-white tracking-tighter tabular-nums"
              >
                0
              </span>
              <span className="text-xl font-display text-accent pt-2">kg</span>
            </div>
          )}
        </div>

        {/* Accessoires */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <span className="text-[9px] font-bold text-muted/60 uppercase tracking-widest">
            Plan de bataille accessoire
          </span>
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

      <button
        onClick={() => navigate('programme')}
        className={cn(
          'w-full bg-accent hover:bg-accent-hover active:scale-[0.98] transition-all duration-200',
          'text-background font-bold uppercase tracking-widest text-[12px] py-6 px-4 rounded-pill',
          'flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer',
        )}>
        DÉMARRER LA SÉANCE
        <ChevronRight size={16} />
      </button>

      {/* Decorative pulse */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 size-56 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
    </div>
  )
})
