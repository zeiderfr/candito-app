import { useMemo } from 'react'
import { useCanditoState } from './useCanditoState'
import { PROGRAM_DATA, SCHEDULE_MAP } from '../data/program'
import { type WorkoutState, type Session } from '../types'

/**
 * Hook centralisant la résolution du programme en fonction de la date.
 * Gère le calcul des charges dynamiques et l'état de repos.
 */
export function useWorkoutSchedule() {
  const { state } = useCanditoState()

  const workoutState = useMemo((): WorkoutState => {
    const today = new Date().getDay()
    const sessionId = SCHEDULE_MAP[today]

    if (!sessionId) {
      return {
        type: 'rest',
        action: 'Récupération Optimale',
        suggestion: today === 3 
            ? 'Focus sur la mobilité des hanches (CFA) et hydratation.' 
            : 'Préparation mentale pour la semaine à venir et recharge en glycogène.'
      }
    }

    // Recherche de la session dans la semaine actuelle
    const currentWeek = PROGRAM_DATA[state.currentWeekId]
    const session = currentWeek.sessions.find(s => s.id === sessionId)

    if (!session) {
      return { type: 'rest', action: 'Repos', suggestion: 'Session non trouvée.' }
    }

    return {
      type: 'workout',
      session: session
    }
  }, [state.currentWeekId])

  /**
   * Calcul de la charge arrondie à 2.5kg près.
   * Formule : round(1RM * % / 2.5) * 2.5
   */
  const getCalculatedWeight = (lift: 'squat' | 'bench' | 'deadlift' | undefined, percentage: number) => {
    if (!lift) return null
    const rm = state.athlete.rm[lift]
    if (!rm) return 0
    return Math.round((rm * percentage) / 2.5) * 2.5
  }

  return {
    workoutState,
    getCalculatedWeight
  }
}
