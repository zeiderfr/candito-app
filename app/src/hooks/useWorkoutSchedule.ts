import { useMemo, useCallback } from 'react'
import { useCanditoState } from './useCanditoState'
import { WEEK_SCHEDULE_MAP } from '../data/program'
import { resolveSession } from '@/lib/programResolver'
import { calcWeight } from '@/lib/weightCalc'
import { type WorkoutState } from '../types'

/**
 * Hook centralisant la résolution du programme en fonction de la date.
 * Gère le calcul des charges dynamiques et l'état de repos.
 */
export function useWorkoutSchedule(): {
  workoutState: WorkoutState
  getCalculatedWeight: (lift: 'squat' | 'bench' | 'deadlift' | undefined, percentage: number) => number | null
} {
  const { state } = useCanditoState()

  const workoutState = useMemo((): WorkoutState => {
    const today = new Date().getDay()
    const weekSchedule = WEEK_SCHEDULE_MAP[state.currentWeekId] ?? {}
    const sessionId = weekSchedule[today] ?? null

    if (!sessionId) {
      return {
        type: 'rest',
        action: 'Récupération Optimale',
        suggestion: today === 3 
            ? 'Focus sur la mobilité des hanches (CFA) et hydratation.' 
            : 'Préparation mentale pour la semaine à venir et recharge en glycogène.'
      }
    }

    const session = resolveSession(state.currentWeekId, sessionId, state.programOverrides)

    if (!session) {
      return { type: 'rest', action: 'Repos', suggestion: 'Session non trouvée pour cette semaine.' }
    }

    return {
      type: 'workout',
      session: session
    }
  }, [state.currentWeekId, state.programOverrides])

  /**
   * Calcul de la charge arrondie à 2.5kg près.
   * Utilise l'utilitaire partagé calcWeight.
   */
  const getCalculatedWeight = useCallback((lift: 'squat' | 'bench' | 'deadlift' | undefined, percentage: number) => {
    if (!lift) return null
    const rm = state.athlete.rm[lift]
    if (!rm) return 0
    return calcWeight(rm, percentage)
  }, [state.athlete.rm])

  return {
    workoutState,
    getCalculatedWeight,
  }
}

export type UseWorkoutScheduleReturn = ReturnType<typeof useWorkoutSchedule>
