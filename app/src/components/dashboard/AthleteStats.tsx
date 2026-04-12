import { cn } from '@/lib/utils'

interface AthleteStatsProps {
  squat: number
  bench: number
  deadlift: number
  total: number
  progressPct: number
  completedCount: number
  totalCount: number
}

export function AthleteStats({
  squat,
  bench,
  deadlift,
  total,
  progressPct,
  completedCount,
  totalCount
}: AthleteStatsProps) {
  return (
    <div className={cn(
      "glass p-8 rounded-card border-none flex flex-col gap-8",
      "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
          Dossier Athlète
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'SQUAT', value: squat },
          { label: 'BENCH', value: bench },
          { label: 'DEADLIFT', value: deadlift },
          { label: 'TOTAL', value: total, isAccent: true }
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 text-center">
            <span className="text-[9px] font-bold text-muted/60 uppercase">
              {stat.label}
            </span>
            <span className={cn(
              "text-2xl font-display tabular-nums leading-none",
              stat.isAccent ? "text-accent" : "text-white"
            )}>
              {stat.value}
            </span>
            <span className="text-[10px] text-muted/40 font-medium">kg</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Progression du programme
          </span>
          <span className="text-[14px] font-display text-accent tabular-nums">
            {progressPct}%
          </span>
        </div>

        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-[11px] text-muted text-center font-medium">
          {completedCount} sur {totalCount} séances complétées
        </p>
      </div>
    </div>
  )
}
