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
    <div className="relative size-16 shrink-0">
      <svg
        width="64" height="64" viewBox="0 0 80 80"
        className="-rotate-90 absolute inset-0"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="40" cy="40" r={R}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="3"
        />
        {/* Progress */}
        <circle
          ref={ringRef}
          cx="40" cy="40" r={R}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-display italic text-white tabular-nums leading-none">
          {pct}%
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

      {/* Stat numbers - Editorial Grid */}
      <div ref={statsRef} className="relative grid grid-cols-2 gap-x-12 gap-y-10">
        {[
          { label: 'Squat',    value: squat },
          { label: 'Bench',    value: bench },
          { label: 'Deadlift', value: deadlift },
          { label: 'Total',    value: total, isAccent: true },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 border-l border-white/5 pl-4 group hover:border-accent/30 transition-colors">
            <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-1">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                'text-5xl font-display italic tabular-nums leading-none tracking-tight',
                stat.isAccent ? 'text-accent' : 'text-white',
              )}>
                {stat.value}
              </span>
              <span className="text-xs text-muted/30 font-bold uppercase">kg</span>
            </div>
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
