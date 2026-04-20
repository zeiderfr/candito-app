import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { useWorkoutSchedule } from '@/hooks/useWorkoutSchedule'
import { COACH_MESSAGES, PROGRAM_METADATA, type CoachTimeSlot } from '@/data/program'
import type { SessionLog } from '@/types'
import { Sun, Coffee, Sunset, Moon } from 'lucide-react'

// ── Time-of-day config ──────────────────────────────────────────────
const TIME_ICON: Record<CoachTimeSlot, typeof Sun> = {
  matin: Sun,
  midi: Coffee,
  aprem: Sunset,
  soir: Moon,
}

const TIME_TINT: Record<CoachTimeSlot, string> = {
  matin:  'from-amber-500/5 to-transparent',
  midi:   'from-yellow-500/5 to-transparent',
  aprem:  'from-orange-500/5 to-transparent',
  soir:   'from-blue-900/10 to-transparent',
}

function getTimeContext(): { slot: CoachTimeSlot; greeting: string } {
  const hour = new Date().getHours()
  if (hour < 13) return { slot: 'matin', greeting: 'Bonjour' }
  if (hour < 14) return { slot: 'midi', greeting: 'Bonjour' }
  if (hour < 18) return { slot: 'aprem', greeting: 'Bon après-midi' }
  return { slot: 'soir', greeting: 'Bonsoir' }
}

function daysSinceLog(log: SessionLog): number {
  const now = new Date()
  const then = new Date(log.startedAt ?? log.date)
  
  if (now.toLocaleDateString() === then.toLocaleDateString()) return 0
  
  const diffTime = now.getTime() - then.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

function avgRPEFromLog(log: SessionLog): number | null {
  const values = log.exercises
    .flatMap(ex => ex.sets)
    .filter(s => s.rpe != null)
    .map(s => s.rpe!)
  if (!values.length) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

function topWeightForLift(
  log: SessionLog,
  lift: 'squat' | 'bench' | 'deadlift'
): { weight: number; reps: number } | null {
  const sets = log.exercises
    .filter(ex => ex.lift === lift)
    .flatMap(ex => ex.sets)
    .filter(s => s.weight != null && s.weight > 0)
  if (!sets.length) return null
  const best = sets.reduce((b, s) => (s.weight! > b.weight! ? s : b))
  return { weight: best.weight!, reps: best.reps }
}

const LIFT_LABEL: Record<'squat' | 'bench' | 'deadlift', string> = {
  squat: 'squat',
  bench: 'développé',
  deadlift: 'soulevé de terre',
}

export function CoachCard() {
  const { state } = useCandito()
  const { workoutState } = useWorkoutSchedule()

  const { greeting, message, tone, slot } = useMemo(() => {
    const { slot, greeting } = getTimeContext()
    const logs = state.progress.sessionLogs

    // Dernière séance (la plus récente)
    const last = logs.length
      ? [...logs].sort((a, b) => {
          const timeA = new Date(a.startedAt ?? a.date).getTime()
          const timeB = new Date(b.startedAt ?? b.date).getTime()
          return timeB - timeA
        })[0]
      : null

    const daysSince = last != null ? daysSinceLog(last) : null
    const avgRPE = last != null ? avgRPEFromLog(last) : null

    // Lift principal de la prochaine séance (si applicable)
    const nextLift =
      workoutState.type === 'workout'
        ? (workoutState.session.exercises.find(ex => ex.lift != null)?.lift ?? null)
        : null

    let contextualMessage: string | null = null

    if (last != null && daysSince === 0) {
      if (avgRPE != null) {
        contextualMessage = `Séance du jour bouclée — RPE moyen ${avgRPE}. Récupère bien ce soir.`
      } else {
        contextualMessage = `Séance terminée ! Le dossier "Dernière séance" est à jour. Récupère bien.`
      }
    } else if (last != null && daysSince === 1 && avgRPE != null && avgRPE >= 8.5) {
      contextualMessage = `Ta séance d'hier était exigeante (RPE ${avgRPE}). Profite de cette journée de récupération.`
    } else if (daysSince != null && daysSince >= 4 && last != null) {
      const nextFocus = workoutState.type === 'workout' 
        ? workoutState.session.focus 
        : null
      const focus = nextFocus ?? last.sessionFocus ?? last.sessionId
      contextualMessage = `${daysSince} jours sans entraînement. La prochaine séance : ${focus}. Lance-toi.`
    } else if (nextLift != null) {
      const prev = last ? topWeightForLift(last, nextLift) : null
      if (prev) {
        contextualMessage = `La dernière fois en ${LIFT_LABEL[nextLift]} : ${prev.weight} kg × ${prev.reps} reps. Vise un poil plus haut.`
      }
    }

    // Fallback → messages prédéfinis du programme
    const weekData = COACH_MESSAGES[state.currentWeekId] ?? COACH_MESSAGES['s1']
    const pool = weekData[slot]
    const fallback = pool[new Date().getDay() % pool.length]

    return { greeting, message: contextualMessage ?? fallback, tone: weekData.tone, slot }
  }, [state.currentWeekId, state.progress.sessionLogs, workoutState])

  const TimeIcon = TIME_ICON[slot]

  return (
    <div className={cn(
      "glass p-5 rounded-card border-none flex flex-col gap-4",
      "bg-gradient-to-br", TIME_TINT[slot],
      "animate-in fade-in slide-in-from-bottom-4 duration-300"
    )}>
      {/* Header : icône + label + tone */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimeIcon size={14} className="text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
            Coach Programme Candito
          </span>
        </div>
        <span className="text-[9px] text-dim/50 uppercase tracking-widest font-bold italic">
          {tone}
        </span>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-display text-white leading-tight">
          {greeting}, {state.athlete.name}.
        </h2>
        <p className="text-[10px] text-muted/50 uppercase tracking-widest mt-0.5 font-bold">
          {PROGRAM_METADATA[state.currentWeekId]?.subtitle}
        </p>
      </div>

      <div className="h-[1px] w-8 bg-accent/20" />

      {/* Message */}
      <p className="text-muted text-sm leading-relaxed max-w-[90%]">
        {message}
      </p>
    </div>
  )
}
