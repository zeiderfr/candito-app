import { cn } from '@/lib/utils'
import { CoachCard } from '@/components/dashboard/CoachCard'
import { NotificationBanner } from '@/components/common/NotificationBanner'
import { TrainingNotificationBanner } from '@/components/common/TrainingNotificationBanner'
import { InstallBanner } from '@/components/common/InstallBanner'
import { NextSessionHero } from '@/components/dashboard/NextSessionHero'
import { AthleteStats } from '@/components/dashboard/AthleteStats'
import { useCanditoState } from '@/hooks/useCanditoState'
import { useWorkoutSchedule } from '@/hooks/useWorkoutSchedule'

export function Dashboard() {
  const { state, getTotal } = useCanditoState()
  const { workoutState, getCalculatedWeight } = useWorkoutSchedule()

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Tableau de bord...
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
            {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <CoachCard />

        <NotificationBanner />
        <TrainingNotificationBanner />
        <InstallBanner />

        <NextSessionHero
          workoutState={workoutState}
          getWeight={getCalculatedWeight}
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
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-40 italic">
          Forge ton corps, forge ton mental • Candito React v2.0
        </p>
      </footer>
    </div>
  )
}
