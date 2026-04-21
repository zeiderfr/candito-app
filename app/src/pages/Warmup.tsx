import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { calcWeight } from '@/lib/weightCalc'
import { Footprints, Dumbbell, ArrowUp } from 'lucide-react'

interface WarmupExercise {
  name: string
  sets: number
  reps: string
  isGamme?: boolean
  lift?: 'squat' | 'bench' | 'deadlift'
  percentage?: number
}

const LOWER_BODY: WarmupExercise[] = [
  { name: 'Foam Rolling quad/fessiers/ischio', sets: 1, reps: '60-90s/zone' },
  { name: 'Cat-Camel', sets: 2, reps: '10' },
  { name: 'Hip Thrust activation', sets: 3, reps: '10 BW' },
  { name: 'Cossack Squat', sets: 2, reps: '8/côté' },
  { name: 'Dead Bugs', sets: 2, reps: '8/côté' },
  { name: 'Gamme Squat @40%', sets: 1, reps: '8',  isGamme: true, lift: 'squat', percentage: 0.40 },
  { name: 'Gamme Squat @60%', sets: 1, reps: '5',  isGamme: true, lift: 'squat', percentage: 0.60 },
  { name: 'Gamme Squat @75%', sets: 1, reps: '3',  isGamme: true, lift: 'squat', percentage: 0.75 },
  { name: 'Gamme Squat @85%', sets: 1, reps: '1',  isGamme: true, lift: 'squat', percentage: 0.85 },
]

const UPPER_BODY: WarmupExercise[] = [
  { name: 'Foam Rolling pecto/dorsaux', sets: 1, reps: '60s/zone' },
  { name: 'Face Pulls activation', sets: 3, reps: '15 charge légère' },
  { name: 'Élévations latérales', sets: 2, reps: '12 haltères légers' },
  { name: 'Gamme Bench @40%', sets: 1, reps: '10', isGamme: true, lift: 'bench', percentage: 0.40 },
  { name: 'Gamme Bench @60%', sets: 1, reps: '5',  isGamme: true, lift: 'bench', percentage: 0.60 },
  { name: 'Gamme Bench @75%', sets: 1, reps: '3',  isGamme: true, lift: 'bench', percentage: 0.75 },
]

const DEADLIFT: WarmupExercise[] = [
  { name: 'Foam Rolling ischio/fessiers/mollets', sets: 1, reps: '60-90s/zone' },
  { name: 'Hip Hinge bodyweight', sets: 2, reps: '10' },
  { name: 'RDL léger (barre vide)', sets: 2, reps: '8' },
  { name: 'Good Morning', sets: 2, reps: '8' },
  { name: 'Gamme DL @40%',  sets: 1, reps: '8', isGamme: true, lift: 'deadlift', percentage: 0.40 },
  { name: 'Gamme DL @60%',  sets: 1, reps: '5', isGamme: true, lift: 'deadlift', percentage: 0.60 },
  { name: 'Gamme DL @75%',  sets: 1, reps: '3', isGamme: true, lift: 'deadlift', percentage: 0.75 },
  { name: 'Gamme DL @85%',  sets: 1, reps: '1', isGamme: true, lift: 'deadlift', percentage: 0.85 },
]

// ── ExerciseRow ─────────────────────────────────────────────────────
function ExerciseRow({ name, sets, reps, weight }: {
  name: string
  sets: number
  reps: string
  weight?: number
}) {
  return (
    <div
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left",
      )}
    >
      {/* Nom + métadonnée */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug text-white"
        )}>
          {name}
        </p>
        <p className="text-[11px] text-muted/60 tabular-nums mt-0.5">
          {sets}×{reps}
        </p>
      </div>

      {/* Badge poids (gamme seulement) */}
      {weight != null && weight > 0 && (
        <span className="text-[12px] font-bold tabular-nums text-accent bg-accent/10 px-2.5 py-1 rounded-pill shrink-0">
          {weight} kg
        </span>
      )}
    </div>
  )
}

// ── WarmupSection ───────────────────────────────────────────────────
function WarmupSection({ title, icon: Icon, exercises, rm }: {
  title: string
  icon: typeof Footprints
  exercises: WarmupExercise[]
  rm: { squat: number; bench: number; deadlift: number }
}) {
  const mobility = exercises.filter(e => !e.isGamme)
  const gamme    = exercises.filter(e => e.isGamme)

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
        <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={15} className="text-accent" />
        </div>
        <h3 className="text-base font-display text-white italic flex-1">{title}</h3>
      </div>

      {/* Mobilité */}
      <div className="divide-y divide-border/50">
        {mobility.map((ex, i) => (
          <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} />
        ))}
      </div>

      {/* Séparateur gamme */}
      {gamme.length > 0 && (
        <>
          <div className="flex items-center gap-3 px-4 py-2 bg-accent/[0.03] border-y border-border/50">
            <div className="h-px flex-1 bg-accent/20" />
            <span className="text-[9px] font-bold text-accent/60 uppercase tracking-widest">
              Gamme montante
            </span>
            <div className="h-px flex-1 bg-accent/20" />
          </div>
          <div className="divide-y divide-border/40 border-l-2 border-accent/30 ml-4 mr-0">
            {gamme.map((ex, i) => {
              const weight = ex.lift && ex.percentage
                ? calcWeight(rm[ex.lift], ex.percentage)
                : undefined
              return (
                <ExerciseRow key={i} name={ex.name} sets={ex.sets} reps={ex.reps} weight={weight} />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────
export function Warmup() {
  const { state } = useCandito()
  const rm = { squat: state.athlete.rm.squat, bench: state.athlete.rm.bench, deadlift: state.athlete.rm.deadlift }

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Warm up
        </h1>
        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-2">
          Protocole d'activation pré-séance (Guide)
        </p>
      </div>

      {/* Note Wenning */}
      <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-border">
        <p className="text-[11px] text-muted leading-relaxed">
          <span className="text-white font-semibold">Protocole Wenning — </span>
          activation musculaire sans accumuler de fatigue.
        </p>
      </div>

      <WarmupSection title="Bas du corps — Squat" icon={Footprints} exercises={LOWER_BODY} rm={rm} />
      <WarmupSection title="Haut du corps — Bench" icon={Dumbbell} exercises={UPPER_BODY} rm={rm} />
      <WarmupSection title="Deadlift" icon={ArrowUp} exercises={DEADLIFT} rm={rm} />

    </div>
  )
}
