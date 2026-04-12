/**
 * types.ts — Shared interfaces for the Candito application.
 */

export interface Exercise {
  name: string
  sets: string
  reps?: string
  rpe_target?: string
  note?: string
  lift?: 'squat' | 'bench' | 'deadlift' // Type de mouvement pour le calcul des charges
  percentage?: { lo: number; hi: number } // Pourcentages cibles du 1RM
}

export interface Session {
  id: string
  day?: string // Jour théorique (Lundi, etc.)
  focus: string
  status: 'done' | 'pending' | 'skip'
  exercises: Exercise[]
}

export type WorkoutState = 
  | { type: 'workout'; session: Session } 
  | { type: 'rest'; action: string; suggestion: string }

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
