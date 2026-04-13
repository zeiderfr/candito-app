import { useState, useEffect, useCallback } from 'react'
import { type CanditoState, type RM, type PR, type SessionLog } from '../types'

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
    prs: [],
    sessionLogs: []
  },
  currentWeekId: 's1'
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
            currentWeekId: 's1'
          }
        }

        // Force Théo name if it was the default "Athlète"
        if (data.athlete && data.athlete.name === 'Athlète') {
          data.athlete.name = 'Théo'
        }

        // Migration spécifique S1/S2 Split
        if (data.currentWeekId === 's1s2') {
          data.currentWeekId = 's2' // Théo entame la S2 demain !
        }
        
        // Migration pour le nouveau champ sessionLogs (v3 implicite)
        data.progress.sessionLogs = data.progress.sessionLogs ?? []
        
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

  const addPR = useCallback((lift: 'squat' | 'bench' | 'deadlift', weight: number, reps: number) => {
    const newPR: PR = {
      id: `${lift}_${Date.now()}`,
      lift,
      weight,
      reps,
      date: new Date().toISOString().split('T')[0],
    }
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        prs: [...prev.progress.prs, newPR],
      },
    }))
  }, [])

  const logSession = useCallback((log: SessionLog) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        sessionLogs: [
          ...prev.progress.sessionLogs.filter(l => l.sessionId !== log.sessionId),
          log
        ]
      }
    }))
  }, [])

  const importState = useCallback((data: CanditoState) => {
    setState(data)
  }, [])

  return {
    state,
    updateRM,
    updateName,
    toggleSession,
    getTotal,
    setCurrentWeek,
    addPR,
    logSession,
    importState,
    isInitialized: state.initialized
  }
}
