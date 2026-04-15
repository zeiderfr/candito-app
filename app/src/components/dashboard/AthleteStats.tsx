import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { animate, utils } from 'animejs'

interface AthleteStatsProps {
  squat: number
  bench: number
  deadlift: number
  total: number
  progressPct: number
  completedCount: number
  totalCount: number
}

// ── PR particle burst ────────────────────────────────────────────────
function triggerPRExplosion(container: HTMLElement) {
  const N = 12
  const particles: HTMLDivElement[] = []

  for (let i = 0; i < N; i++) {
    const el = document.createElement('div')
    el.style.cssText = [
      'position:absolute',
      'width:5px',
      'height:5px',
      'border-radius:50%',
      'background:var(--color-accent)',
      'pointer-events:none',
      'top:50%',
      'left:50%',
      'transform:translate(-50%,-50%)',
      'z-index:20',
    ].join(';')
    container.appendChild(el)
    particles.push(el)
  }

  // Container flash
  animate(container, {
    scale: [1, 1.04, 1],
    duration: 420,
    ease: 'outBack(2)',
  })

  // Particle burst
  animate(particles as unknown as HTMLElement, {
    translateX: () => utils.random(-120, 120),
    translateY: () => utils.random(-90, 40),
    opacity: [1, 0],
    scale: [1.8, 0],
    duration: 800,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delay: utils.stagger(25) as any,
    ease: 'outExpo',
    onComplete: () => particles.forEach(p => p.remove()),
  })
}

// ── Animated progress ring ───────────────────────────────────────────
function ProgressRing({ pct }: { pct: number }) {
  const R = 32
  const circ = 2 * Math.PI * R
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!ringRef.current) return
    animate(ringRef.current, {
      strokeDashoffset: circ * (1 - pct / 100),
      duration: 1000,
      delay: 300,
      ease: 'outExpo',
    })
  }, [pct])

  return (
    <div className="relative size-20 shrink-0">
      <svg
        width="80" height="80" viewBox="0 0 80 80"
        className="-rotate-90 absolute inset-0"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="40" cy="40" r={R}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="4"
        />
        {/* Progress */}
        <circle
          ref={ringRef}
          cx="40" cy="40" r={R}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-display text-accent tabular-nums leading-none">
          {pct}%
        </span>
        <span className="text-[8px] text-muted/50 uppercase tracking-wider mt-0.5">
          done
        </span>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export function AthleteStats({
  squat,
  bench,
  deadlift,
  total,
  progressPct,
  completedCount,
  totalCount,
}: AthleteStatsProps) {
  const statsRef = useRef<HTMLDivElement>(null)
  const prevTotalRef = useRef(total)

  // PR explosion when total increases
  useEffect(() => {
    if (total > prevTotalRef.current && statsRef.current) {
      triggerPRExplosion(statsRef.current)
    }
    prevTotalRef.current = total
  }, [total])

  return (
    <div className={cn(
      'glass p-8 rounded-card border-none flex flex-col gap-8',
      'animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150',
    )}>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        Dossier Athlète
      </span>

      {/* Stat numbers */}
      <div ref={statsRef} className="relative grid grid-cols-4 gap-4">
        {[
          { label: 'SQUAT',    value: squat },
          { label: 'BENCH',    value: bench },
          { label: 'DEADLIFT', value: deadlift },
          { label: 'TOTAL',    value: total, isAccent: true },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 text-center">
            <span className="text-[9px] font-bold text-muted/60 uppercase">
              {stat.label}
            </span>
            <span className={cn(
              'text-2xl font-display tabular-nums leading-none',
              stat.isAccent ? 'text-accent' : 'text-white',
            )}>
              {stat.value}
            </span>
            <span className="text-[10px] text-muted/40 font-medium">kg</span>
          </div>
        ))}
      </div>

      {/* Progress ring + label */}
      <div className="flex items-center gap-5">
        <ProgressRing pct={progressPct} />
        <div className="flex-1 space-y-1.5">
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">
            Progression du programme
          </p>
          <p className="text-[11px] text-muted font-medium">
            {completedCount} sur {totalCount} séances complétées
          </p>
        </div>
      </div>
    </div>
  )
}
