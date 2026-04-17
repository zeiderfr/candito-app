import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
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

// ── Séparateur ──────────────────────────────────────────────────────
function GammeSeparator() {
  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-accent/[0.03]">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[9px] font-bold text-dim uppercase tracking-widest whitespace-nowrap">
        Gamme montante
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ── WarmupCard ──────────────────────────────────────────────────────
function WarmupCard({ title, exercises, rm }: {
  title: string
  exercises: WarmupExercise[]
  rm: { squat: number; bench: number }
}) {
  // Séparer mobilité et gamme
  const mobility = exercises.filter(e => !e.isGamme)
  const gamme    = exercises.filter(e => e.isGamme)

  return (
    <div className="glass rounded-card overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <Flame size={16} />
        </div>
        <h3 className="text-lg font-display text-white italic">{title}</h3>
      </div>

      {/* Exercices de mobilité */}
      <div className="divide-y divide-border">
        {mobility.map((ex, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3">
            <p className="text-sm text-white/80 flex-1 min-w-0 truncate">{ex.name}</p>
            <span className="text-xs text-muted tabular-nums shrink-0">
              {ex.sets}×{ex.reps}
            </span>
          </div>
        ))}
      </div>

      {/* Séparateur */}
      <GammeSeparator />

      {/* Gamme montante */}
      <div className="divide-y divide-border/50">
        {gamme.map((ex, i) => {
          const weight = ex.lift && ex.percentage
            ? calcWeight(rm[ex.lift], ex.percentage)
            : 0
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-5 py-3.5 border-l-2 border-accent/40"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{ex.name}</p>
                <p className="text-xs text-muted tabular-nums mt-0.5">{ex.sets}×{ex.reps}</p>
              </div>
              <span className={cn(
                "text-sm font-bold tabular-nums shrink-0 bg-accent/10 px-2.5 py-1 rounded-pill",
                weight > 0 ? "text-accent" : "text-muted"
              )}>
                {weight > 0 ? `${weight} kg` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────
export function Warmup() {
  const { state } = useCandito()
  const rm = { squat: state.athlete.rm.squat, bench: state.athlete.rm.bench }

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
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

      {/* Note protocole Wenning */}
      <div className="glass px-5 py-4 rounded-xl">
        <p className="text-sm text-muted leading-relaxed">
          <span className="text-white font-semibold">Protocole Wenning — </span>
          2 exercices d'activation × 3 séries × 10 reps, tempo lent, charge légère.
          Focus : activation musculaire sans accumuler de fatigue avant la séance.
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
