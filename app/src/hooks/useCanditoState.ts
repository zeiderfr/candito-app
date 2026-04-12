import { useState, useEffect, useCallback } from 'react'
import { type CanditoState, type RM } from '../types'

const STORAGE_KEY = 'candito_tracker_data'

const DEFAULT_STATE: CanditoState = {
  version: 1,
  initialized: false,
  athlete: {
    name: 'Théo',
    rm: { squat: 150, bench: 110, deadlift: 170 }
  },
  progress: {
    completedSessions: [],
    prs: []
  },
  currentWeekId: 's1s2'
}

export function useCanditoState() {
  const [state, setState] = useState<CanditoState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        
        // ── MIGRATION LAYER (Vanilla JS -> React v2) ────────────────────────
        // L'ancienne app stocke 'rm' à la racine. La nouvelle dans 'athlete'.
        if (data.rm && !data.athlete) {
          console.log("Migration des données Candito détectée...")
          return {
            version: 2,
            initialized: data.initialized ?? true,
            athlete: {
              name: 'Théo',
              rm: {
                squat: Number(data.rm.squat || 0),
                bench: Number(data.rm.bench || 0),
                deadlift: Number(data.rm.deadlift || 0),
              }
            },
            progress: {
              completedSessions: [], // Sessions à réinitialiser pour la v2
              prs: Array.isArray(data.prs) ? data.prs : []
            },
            currentWeekId: 's1s2'
          }
        }
        
        return data
      } catch (e) {
        console.error("Failed to parse Candito state", e)
      }
    }
    return DEFAULT_STATE
  })

  // Persistence effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const updateRM = useCallback((newRM: Partial<RM>) => {
    setState((prev) => ({
      ...prev,
      athlete: {
        ...prev.athlete,
        rm: { ...prev.athlete.rm, ...newRM }
      },
      initialized: true
    }))
  }, [])

  const updateName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      athlete: {
        ...prev.athlete,
        name
      }
    }))
  }, [])

  const toggleSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const completed = prev.progress.completedSessions.includes(sessionId)
      const newList = completed
          ? prev.progress.completedSessions.filter(id => id !== sessionId)
          : [...prev.progress.completedSessions, sessionId]

      return {
          ...prev,
          progress: {
              ...prev.progress,
              completedSessions: newList
          }
      }
    })
  }, [])

  const getTotal = useCallback(() => {
    return state.athlete.rm.squat + state.athlete.rm.bench + state.athlete.rm.deadlift
  }, [state.athlete.rm])

  const setCurrentWeek = useCallback((weekId: string) => {
    setState(prev => ({ ...prev, currentWeekId: weekId }))
  }, [])

  return {
    state,
    updateRM,
    updateName,
    toggleSession,
    getTotal,
    setCurrentWeek,
    isInitialized: state.initialized
  }
}
