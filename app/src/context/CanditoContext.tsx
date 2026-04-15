import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import { type CanditoState, type CycleSnapshot, type RM, type PR, type SessionLog } from '../types'
import { suggestNewRM } from '../lib/weightCalc'
import { STORAGE_KEYS } from '../lib/storageKeys'

const STORAGE_KEY = STORAGE_KEYS.CANDITO_STATE
const CURRENT_VERSION = 5

const TODAY = (): string => new Date().toISOString().split('T')[0]

const DEFAULT_STATE: CanditoState = {
  version: CURRENT_VERSION,
  initialized: false,
  athlete: {
    name: 'Théo',
    rm: { squat: 140, bench: 100, deadlift: 160 }
  },
  cycleNumber: 1,
  cycleStartDate: TODAY(),
  cycleHistory: [],
  progress: {
    completedSessions: [],
    prs: [],
    sessionLogs: []
  },
  currentWeekId: 's1',
  isDemoMode: false
}

const DEMO_STATE: CanditoState = {
  ...DEFAULT_STATE,
  isDemoMode: true,
  athlete: {
    name: 'Théo (Démo)',
    rm: { squat: 180, bench: 125, deadlift: 210 }
  },
  progress: {
    completedSessions: ['s1_d1', 's1_d2', 's1_d4', 's1_d5', 's2_d1'],
    prs: [
      { id: '1', lift: 'squat', weight: 185, reps: 1, date: '2026-04-10' },
      { id: '2', lift: 'bench', weight: 127.5, reps: 1, date: '2026-04-12' }
    ],
    sessionLogs: []
  },
  currentWeekId: 's2'
}

/**
 * migrate — Permet de faire évoluer le schéma du localStorage de manière incrémentale.
 * Respecte les travaux précédents (Claude) et prépare les futures évolutions.
 */
function migrate(data: any): CanditoState {
  let migrated = { ...data }

  if (!migrated.version) migrated.version = 0

  // v1 -> v4 (Héritage)
  if (migrated.version < 4) {
    migrated.cycleNumber = migrated.cycleNumber || 1
    migrated.cycleStartDate = migrated.cycleStartDate || TODAY()
    migrated.cycleHistory = migrated.cycleHistory || []
  }

  // v4 -> v5 (Normalisation & Safety)
  if (migrated.version < 5) {
    if (!migrated.progress) {
      migrated.progress = { completedSessions: [], prs: [], sessionLogs: [] }
    }
    migrated.progress.completedSessions = migrated.progress.completedSessions || []
    migrated.progress.prs = migrated.progress.prs || []
    migrated.progress.sessionLogs = migrated.progress.sessionLogs || []

    // Type guard / migration Claude
    const legacyData = migrated as unknown as Record<string, unknown>
    if (!migrated.athlete && legacyData.rm && typeof legacyData.rm === 'object') {
       // Support pour d'anciennes versions sans objet athlete
       migrated.athlete = { name: 'Théo', rm: legacyData.rm }
    }
    
    if (migrated.athlete?.name === 'Athlète') {
      migrated.athlete.name = 'Théo'
    }
    
    migrated.isDemoMode = migrated.isDemoMode || false
  }

  migrated.version = CURRENT_VERSION
  return migrated as CanditoState
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
  const [realState, setRealState] = useState<CanditoState>(DEFAULT_STATE)
  const [isLoading, setIsLoading] = useState(true)

  // Demo mode state is transient (not persisted)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Effectively the state used by the app
  const state = isDemoMode ? DEMO_STATE : realState

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
          const migrated = migrate(saved)
          setRealState(migrated)
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
    if (!isLoading && !isDemoMode) {
      set(STORAGE_KEY, realState).catch(e => console.error("Failed to persist state", e))
    }
  }, [realState, isLoading, isDemoMode])

  const updateRM = useCallback((newRM: Partial<RM>) => {
    if (isDemoMode) return
    setRealState((prev) => ({
      ...prev,
      athlete: {
        ...prev.athlete,
        rm: { ...prev.athlete.rm, ...newRM }
      },
      initialized: true
    }))
  }, [isDemoMode])

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
    toggleDemoMode,
    isInitialized: state.initialized
  }

  return (
    <CanditoContext.Provider value={value}>
      {children}
    </CanditoContext.Provider>
  )
}

export function useCandito(): CanditoContextType {
  const context = useContext(CanditoContext)
  if (context === undefined) {
    throw new Error('useCandito must be used within a CanditoProvider')
  }
  return context
}
