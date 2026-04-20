import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import { type CanditoState, type CycleSnapshot, type RM, type PR, type SessionLog, type ExerciseOverride } from '../types'
import { suggestNewRM } from '../lib/weightCalc'
import { STORAGE_KEYS } from '../lib/storageKeys'
import { PROGRAM_DATA, WEEK_ORDER } from '../data/program'

const WEEK_AUTO_ORDER = WEEK_ORDER.filter(w => w !== 's6_test')

const STORAGE_KEY = STORAGE_KEYS.CANDITO_STATE
const CURRENT_VERSION = 6

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
  programOverrides: {},
}

/**
 * migrate — Permet de faire évoluer le schéma du localStorage de manière incrémentale.
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

    const legacyData = migrated as unknown as Record<string, unknown>
    if (!migrated.athlete && legacyData.rm && typeof legacyData.rm === 'object') {
      migrated.athlete = { name: 'Théo', rm: legacyData.rm }
    }

    if (migrated.athlete?.name === 'Athlète') {
      migrated.athlete.name = 'Théo'
    }
  }

  // v5 -> v6 (Program Overrides)
  if (migrated.version < 6) {
    migrated.programOverrides = migrated.programOverrides ?? {}
  }

  // Nettoyage : retirer le champ isDemoMode s'il existe encore en base
  delete migrated.isDemoMode

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
  removePR: (prId: string) => void
  importState: (data: CanditoState) => void
  startNewCycle: (newRM: RM) => void
  suggestNewRM: () => RM
  isInitialized: boolean
  setExerciseOverride: (weekId: string, sessionId: string, exerciseIndex: number, override: Partial<ExerciseOverride>) => void
  setSessionFocus: (weekId: string, sessionId: string, focus: string) => void
  resetSessionOverride: (weekId: string, sessionId: string) => void
  resetWeekOverrides: (weekId: string) => void
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
            await set(STORAGE_KEY, saved)
          }
        }

        if (saved) {
          setState(migrate(saved))
        }
      } catch (e) {
        console.error("Critical: Failed to load Candito store from IDB", e)
      } finally {
        setIsLoading(false)
      }
    }
    initStore()
  }, [])

  // ── Persistence effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) {
      set(STORAGE_KEY, state).catch(e => console.error("Failed to persist state", e))
    }
  }, [state, isLoading])

  const updateRM = useCallback((newRM: Partial<RM>) => {
    setState((prev) => ({
      ...prev,
      athlete: { ...prev.athlete, rm: { ...prev.athlete.rm, ...newRM } },
      initialized: true,
    }))
  }, [])

  const updateName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, athlete: { ...prev.athlete, name } }))
  }, [])

  const toggleSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const completed = prev.progress.completedSessions.includes(sessionId)
      return {
        ...prev,
        progress: {
          ...prev.progress,
          completedSessions: completed
            ? prev.progress.completedSessions.filter(id => id !== sessionId)
            : [...prev.progress.completedSessions, sessionId],
        },
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
    const newPR: PR = { id: `${lift}_${Date.now()}`, lift, weight, reps, date: TODAY() }
    setState(prev => ({
      ...prev,
      progress: { ...prev.progress, prs: [...prev.progress.prs, newPR] },
    }))
  }, [])

  const removePR = useCallback((prId: string) => {
    setState(prev => ({
      ...prev,
      progress: { ...prev.progress, prs: prev.progress.prs.filter(p => p.id !== prId) },
    }))
  }, [])

  const logSession = useCallback((log: SessionLog) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        sessionLogs: [
          ...prev.progress.sessionLogs.filter(l => l.sessionId !== log.sessionId),
          log,
        ],
      },
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
        version: CURRENT_VERSION,
        athlete: { ...prev.athlete, rm: newRM },
        cycleNumber: prev.cycleNumber + 1,
        cycleStartDate: TODAY(),
        cycleHistory: [...(prev.cycleHistory ?? []), snapshot],
        currentWeekId: 's1',
        progress: { completedSessions: [], prs: [], sessionLogs: [] },
      }
    })
  }, [])

  const setExerciseOverride = useCallback((
    weekId: string,
    sessionId: string,
    exerciseIndex: number,
    override: Partial<ExerciseOverride>
  ): void => {
    setState(prev => ({
      ...prev,
      programOverrides: {
        ...prev.programOverrides,
        [weekId]: {
          ...prev.programOverrides[weekId],
          [sessionId]: {
            ...prev.programOverrides[weekId]?.[sessionId],
            exercises: {
              ...prev.programOverrides[weekId]?.[sessionId]?.exercises,
              [exerciseIndex]: {
                ...prev.programOverrides[weekId]?.[sessionId]?.exercises?.[exerciseIndex],
                ...override,
              },
            },
          },
        },
      },
    }))
  }, [])

  const setSessionFocus = useCallback((weekId: string, sessionId: string, focus: string): void => {
    setState(prev => ({
      ...prev,
      programOverrides: {
        ...prev.programOverrides,
        [weekId]: {
          ...prev.programOverrides[weekId],
          [sessionId]: { ...prev.programOverrides[weekId]?.[sessionId], focus },
        },
      },
    }))
  }, [])

  const resetSessionOverride = useCallback((weekId: string, sessionId: string): void => {
    setState(prev => {
      const weekOv = { ...prev.programOverrides[weekId] }
      delete weekOv[sessionId]
      return { ...prev, programOverrides: { ...prev.programOverrides, [weekId]: weekOv } }
    })
  }, [])

  const resetWeekOverrides = useCallback((weekId: string): void => {
    setState(prev => {
      const overrides = { ...prev.programOverrides }
      delete overrides[weekId]
      return { ...prev, programOverrides: overrides }
    })
  }, [])

  const value: CanditoContextType = {
    state,
    isLoading,
    updateRM,
    updateName,
    toggleSession,
    getTotal,
    setCurrentWeek,
    addPR,
    logSession,
    removePR,
    importState,
    startNewCycle,
    suggestNewRM: () => suggestNewRM(state),
    isInitialized: state.initialized,
    setExerciseOverride,
    setSessionFocus,
    resetSessionOverride,
    resetWeekOverrides,
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
