import { cn } from '@/lib/utils'
import { CoachCard } from '@/components/dashboard/CoachCard'
import { NextSessionHero } from '@/components/dashboard/NextSessionHero'
import { AthleteStats } from '@/components/dashboard/AthleteStats'
import { useCanditoState } from '@/hooks/useCanditoState'

export function Dashboard() {
  const { state, getTotal } = useCanditoState()

  // Simplified logic for Phase 1 as planned
  // In Phase 2 this will come from the state machine and data logic
  const nextSession = {
    title: 'Lundi — Squat & Deadlift',
    focus: 'Squat & Deadlift',
    mainExercise: 'Squat Low Bar',
    targetWeight: '117.5',
    setsReps: '4 séries × 6-8 reps'
  }

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      {/* Editorial Header */}
      <h1 className="text-4xl font-display text-white italic tracking-tight">
        Tableau de bord
      </h1>

      <div className="flex flex-col gap-6">
        <CoachCard
          name={state.athlete.name}
          sessionFocus={nextSession.focus}
        />

        <NextSessionHero
          sessionTitle={nextSession.title}
          mainExercise={nextSession.mainExercise}
          targetWeight={nextSession.targetWeight}
          setsReps={nextSession.setsReps}
        />

        <AthleteStats
          squat={state.athlete.rm.squat}
          bench={state.athlete.rm.bench}
          deadlift={state.athlete.rm.deadlift}
          total={getTotal()}
          progressPct={Math.round((state.progress.completedSessions.length / 17) * 100)}
          completedCount={state.progress.completedSessions.length}
          totalCount={17}
        />
      </div>

      <footer className="pt-8 pb-4 text-center">
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-40">
          Candito 6 Semaines • v2.0 React
        </p>
      </footer>
    </div>
  )
}
