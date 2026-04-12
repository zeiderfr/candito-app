/**
 * types.ts — Shared interfaces for the Candito application.
 */

export interface Exercise {
  name: string
  sets: string
  reps?: string
  rpe_target?: string
  note?: string
}

export interface Session {
  id: string
  focus: string
  status: 'done' | 'pending' | 'skip'
  exercises: Exercise[]
}

export interface Day {
  id: string
  label: string
  sessions: Session[]
}

export interface Week {
  id: string
  label: string
  sessions: Session[]
}

export interface RM {
  squat: number
  bench: number
  deadlift: number
}

export interface PR {
  id: string
  lift: 'squat' | 'bench' | 'deadlift'
  weight: number
  reps: number
  date: string
}

export interface CanditoState {
  version: number
  initialized: boolean
  athlete: {
    name: string
    rm: RM
  }
  progress: {
    completedSessions: string[] // IDs des sessions terminées
    prs: PR[]
  }
  currentWeekId: string
}
