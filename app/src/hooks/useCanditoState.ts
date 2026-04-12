import { useState, useEffect, useCallback } from 'react'
import { type CanditoState, type RM } from '../types'

const STORAGE_KEY = 'candito_tracker_data'

const DEFAULT_STATE: CanditoState = {
  version: 1,
  initialized: false,
  athlete: {
    name: 'Athlète',
    rm: { squat: 0, bench: 0, deadlift: 0 }
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
        return JSON.parse(saved)
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

  return {
    state,
    updateRM,
    toggleSession,
    getTotal,
    isInitialized: state.initialized
  }
}
