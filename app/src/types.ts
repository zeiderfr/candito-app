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

export interface SetLog {
  weight: number | null   // Poids réel utilisé (kg), null si non renseigné
  reps: number            // Reps réelles effectuées
  rpe: number | null      // RPE 6–10, null si non renseigné
}

export interface ExerciseLog {
  exerciseName: string
  lift?: 'squat' | 'bench' | 'deadlift'
  sets: SetLog[]
}

export interface SessionLog {
  sessionId: string       // Correspond à Session.id
  sessionFocus?: string   // Nom de la séance (ex : "Bas lourd")
  date: string            // ISO date YYYY-MM-DD
  startedAt?: string      // ISO datetime — timestamp précis de début de séance
  exercises: ExerciseLog[]
}

export interface CycleSnapshot {
  id: string             // 'cycle_1', 'cycle_2', ...
  number: number
  startDate: string      // ISO YYYY-MM-DD
  endDate: string        // ISO YYYY-MM-DD
  rm: RM                 // 1RM utilisés pour ce cycle
  completedSessions: string[]
  prs: PR[]
  sessionLogs: SessionLog[]
}

// ── Program Overrides ─────────────────────────────────────────────────

/** Surcharge d'un exercice individuel (tous les champs sont optionnels) */
export interface ExerciseOverride {
  name?: string
  sets?: string
  reps?: string
  percentage?: { lo: number; hi: number }
  note?: string
  lift?: 'squat' | 'bench' | 'deadlift'
}

/** Surcharge d'une session complète */
export interface SessionOverride {
  focus?: string
  exercises?: Record<number, ExerciseOverride>
  skipped?: boolean
}

/** Map sessionId → SessionOverride pour une semaine */
export type WeekOverrides = Record<string, SessionOverride>

/** Racine des overrides stockée dans CanditoState — clé : weekId */
export type ProgramOverrides = Record<string, WeekOverrides>

export interface CanditoState {
  version: number
  initialized: boolean
  athlete: {
    name: string
    rm: RM
  }
  cycleNumber: number          // Numéro du cycle actuel (commence à 1)
  cycleStartDate: string       // Date de début du cycle actuel (ISO)
  cycleHistory: CycleSnapshot[] // Cycles archivés
  progress: {
    completedSessions: string[] // IDs des sessions terminées
    prs: PR[]
    sessionLogs: SessionLog[]
  }
  currentWeekId: string
  programOverrides: ProgramOverrides  // Surcharges programme utilisateur
}
