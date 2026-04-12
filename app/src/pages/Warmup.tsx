import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'
import { calcWeight } from '@/lib/weightCalc'
import { Flame } from 'lucide-react'

interface WarmupExercise {
  name: string
  sets: number
  reps: string
  isGamme?: boolean
  lift?: 'squat' | 'bench'
  percentage?: number
}

const LOWER_BODY: WarmupExercise[] = [
  { name: 'Foam Rolling quad/fessiers/ischio', sets: 1, reps: '60-90s/zone' },
  { name: 'Cat-Camel', sets: 2, reps: '10' },
  { name: 'Hip Thrust activation', sets: 3, reps: '10 BW' },
  { name: 'Cossack Squat', sets: 2, reps: '8/côté' },
  { name: 'Dead Bugs', sets: 2, reps: '8/côté' },
  { name: 'Gamme Squat @40%', sets: 1, reps: '8', isGamme: true, lift: 'squat', percentage: 0.40 },
  { name: 'Gamme Squat @60%', sets: 1, reps: '5', isGamme: true, lift: 'squat', percentage: 0.60 },
  { name: 'Gamme Squat @75%', sets: 1, reps: '3', isGamme: true, lift: 'squat', percentage: 0.75 },
  { name: 'Gamme Squat @85%', sets: 1, reps: '1', isGamme: true, lift: 'squat', percentage: 0.85 },
]

const UPPER_BODY: WarmupExercise[] = [
  { name: 'Foam Rolling pecto/dorsaux', sets: 1, reps: '60s/zone' },
  { name: 'Face Pulls activation', sets: 3, reps: '15 charge légère' },
  { name: 'Élévations latérales', sets: 2, reps: '12 haltères légers' },
  { name: 'Gamme Bench @40%', sets: 1, reps: '10', isGamme: true, lift: 'bench', percentage: 0.40 },
  { name: 'Gamme Bench @60%', sets: 1, reps: '5', isGamme: true, lift: 'bench', percentage: 0.60 },
  { name: 'Gamme Bench @75%', sets: 1, reps: '3', isGamme: true, lift: 'bench', percentage: 0.75 },
]

function WarmupCard({ title, exercises, rm }: { 
  title: string
  exercises: WarmupExercise[]
  rm: { squat: number; bench: number }
}) {
  return (
    <div className="glass rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <Flame size={16} />
        </div>
        <h3 className="text-lg font-display text-white italic">{title}</h3>
      </div>

      <div className="divide-y divide-border">
        {exercises.map((ex, i) => {
          const weight = ex.isGamme && ex.lift && ex.percentage
            ? calcWeight(rm[ex.lift], ex.percentage)
            : null

          return (
            <div
              key={i}
              className={cn(
                "px-5 py-3.5 flex items-center justify-between gap-3",
                ex.isGamme && "border-l-2 border-accent/40 pl-4"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  ex.isGamme ? "text-white font-medium" : "text-white/80"
                )}>
                  {ex.name}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted tabular-nums">
                  {ex.sets}×{ex.reps}
                </span>
                {weight !== null && weight > 0 && (
                  <span className="text-xs font-bold text-accent tabular-nums bg-accent/10 px-2 py-0.5 rounded-pill">
                    {weight} kg
                  </span>
                )}
                {weight === 0 && ex.isGamme && (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Warmup() {
  const { state } = useCanditoState()
  const rm = { squat: state.athlete.rm.squat, bench: state.athlete.rm.bench }

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Warm up
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
          Protocole d'activation pré-séance
        </p>
      </div>

      <WarmupCard title="Bas du Corps — Squat" exercises={LOWER_BODY} rm={rm} />
      <WarmupCard title="Haut du Corps — Bench" exercises={UPPER_BODY} rm={rm} />

      <footer className="pt-4 pb-4 text-center">
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-40 italic">
          Les gammes montantes utilisent tes 1RM actuels
        </p>
      </footer>
    </div>
  )
}
