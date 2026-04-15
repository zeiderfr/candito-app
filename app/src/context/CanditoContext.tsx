import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import { type CanditoState, type CycleSnapshot, type RM, type PR, type SessionLog } from '../types'
import { suggestNewRM } from '../lib/weightCalc'
import { STORAGE_KEYS } from '../lib/storageKeys'

const STORAGE_KEY = STORAGE_KEYS.CANDITO_STATE

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

export interface CanditoContextType {
  state: CanditoState
  isLoading: boolean
  updateRM: (newRM: Partial<RM>) => void
  updateName: (name: string) => void
  toggleSession: (sessionId: string) => void
  getTotal: () => number
  setCurrentWeek: (weekId: string) => void
  addPR: (lift: 'squat' | 'bench' | 'deadlift', weight: number, reps: number) => void
  logSession: (log: SessionLog) => void
  importState: (data: CanditoState) => void
  startNewCycle: (newRM: RM) => void
  suggestNewRM: () => RM
  isInitialized: boolean
}

const CanditoContext = createContext<CanditoContextType | undefined>(undefined)

export function CanditoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CanditoState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(true)

  // ── Load from IndexedDB (with LocalStorage fallback) ──────────────────
  useEffect(() => {
    async function initStore() {
      try {
        let saved = await get(STORAGE_KEY)
        
        // LocalStorage Fallback (Migration)
        if (!saved) {
          const lsData = localStorage.getItem(STORAGE_KEY)
          if (lsData) {
            saved = JSON.parse(lsData)
            // Save to IDB for next time
            await set(STORAGE_KEY, saved)
            // Cleanup LS optionally, but keep for safety during transition
          }
        }

        if (saved) {
          const data = saved as CanditoState
          
          // Ensure structure exists (Migration/Safety)
          if (!data.progress) {
            data.progress = { completedSessions: [], prs: [], sessionLogs: [] }
          }
          data.progress.completedSessions = data.progress.completedSessions || []
          data.progress.prs = data.progress.prs || []
          data.progress.sessionLogs = data.progress.sessionLogs || []
          
          const legacyData = data as Record<string, unknown>
          if (!data.athlete && legacyData.rm && typeof legacyData.rm === 'object') {
            // Basic migration v1 -> v2 logic here if needed
          }
          
          if (data.athlete?.name === 'Athlète') {
            data.athlete.name = 'Théo'
          }

          if (!data.cycleNumber) {
            data.cycleNumber = 1
            data.cycleStartDate = TODAY()
            data.cycleHistory = []
            data.version = 4
          }
          
          setState(data)
        }
      } catch (e) {
        console.error("Critical: Failed to load Candito store from IDB", e)
      } finally {
        setIsLoading(false)
      }
    }
    initStore()
  }, [])

  // ── Persistence effect (Asynchronous) ──────────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      set(STORAGE_KEY, state).catch(e => console.error("Failed to persist state", e))
    }
  }, [state, isLoading])

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
      athlete: { ...prev.athlete, name }
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
      lift, weight, reps,
      date: TODAY(),
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

  const value = {
    state,
    isLoading,
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

  return (
    <CanditoContext.Provider value={value}>
      {children}
    </CanditoContext.Provider>
  )
}

export function useCandito() {
  const context = useContext(CanditoContext)
  if (context === undefined) {
    throw new Error('useCandito must be used within a CanditoProvider')
  }
  return context
}
