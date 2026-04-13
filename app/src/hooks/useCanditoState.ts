import { useState, useEffect, useCallback } from 'react'
import { type CanditoState, type CycleSnapshot, type RM, type PR, type SessionLog } from '../types'

const STORAGE_KEY = 'candito_tracker_data'

const TODAY = (): string => new Date().toISOString().split('T')[0]

const DEFAULT_STATE: CanditoState = {
  version: 4,
  initialized: false,
  athlete: {
    name: 'Théo',
    rm: { squat: 150, bench: 110, deadlift: 170 }
  },
  cycleNumber: 1,
  cycleStartDate: TODAY(),
  cycleHistory: [],
  progress: {
    completedSessions: [],
    prs: [],
    sessionLogs: []
  },
  currentWeekId: 's1'
}

// ── EPLEY 1RM SUGGESTION ─────────────────────────────────────────────────────
// e1RM = weight * (1 + reps/30), arrondi au 2.5kg supérieur
function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

function roundUp2_5(value: number): number {
  return Math.ceil(value / 2.5) * 2.5
}

export function suggestNewRM(state: CanditoState): RM {
  const lifts: Array<'squat' | 'bench' | 'deadlift'> = ['squat', 'bench', 'deadlift']
  const result: RM = { squat: 0, bench: 0, deadlift: 0 }

  for (const lift of lifts) {
    let best = state.athlete.rm[lift] // fallback = 1RM actuel

    // Parcourir tous les sessionLogs
    for (const log of state.progress.sessionLogs) {
      for (const ex of log.exercises) {
        // Identifier le mouvement principal par nom (squat, bench, deadlift)
        const nameLower = ex.exerciseName.toLowerCase()
        const isLift =
          (lift === 'squat' && (nameLower.includes('squat') || nameLower.includes('box'))) ||
          (lift === 'bench' && nameLower.includes('bench')) ||
          (lift === 'deadlift' && (nameLower.includes('deadlift') || nameLower.includes('soulevé')))

        if (!isLift) continue

        for (const set of ex.sets) {
          if (!set.weight || set.reps <= 0) continue
          const e1rm = epley(set.weight, set.reps)
          if (e1rm > best) best = e1rm
        }
      }
    }

    // Comparer avec les PRs
    for (const pr of state.progress.prs) {
      if (pr.lift !== lift) continue
      const e1rm = epley(pr.weight, pr.reps)
      if (e1rm > best) best = e1rm
    }

    result[lift] = roundUp2_5(best)
  }

  return result
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
          data.currentWeekId = 's2'
        }

        // Migration pour le nouveau champ sessionLogs (v3 implicite)
        data.progress.sessionLogs = data.progress.sessionLogs ?? []

        // ── MIGRATION v4 — Multi-cycles ──────────────────────────────────────
        if (!data.cycleNumber) {
          data.cycleNumber = 1
          data.cycleStartDate = TODAY()
          data.cycleHistory = []
          data.version = 4
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

  const startNewCycle = useCallback((newRM: RM) => {
    setState(prev => {
      const snapshot: CycleSnapshot = {
        id: `cycle_${prev.cycleNumber}`,
        number: prev.cycleNumber,
        startDate: prev.cycleStartDate ?? TODAY(),
        endDate: TODAY(),
        rm: prev.athlete.rm,
        completedSessions: prev.progress.completedSessions,
        prs: prev.progress.prs,
        sessionLogs: prev.progress.sessionLogs,
      }
      return {
        ...prev,
        version: 4,
        athlete: { ...prev.athlete, rm: newRM },
        cycleNumber: prev.cycleNumber + 1,
        cycleStartDate: TODAY(),
        cycleHistory: [...(prev.cycleHistory ?? []), snapshot],
        currentWeekId: 's1',
        progress: { completedSessions: [], prs: [], sessionLogs: [] },
      }
    })
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
    startNewCycle,
    suggestNewRM: () => suggestNewRM(state),
    isInitialized: state.initialized
  }
}
