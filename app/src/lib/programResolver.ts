import { PROGRAM_DATA } from '@/data/program'
import type { Session, Exercise, ProgramOverrides } from '@/types'

/**
 * resolveSession — fusionne PROGRAM_DATA statique avec les overrides utilisateur.
 * Retourne toujours une Session immuable (spread). Ne mute jamais PROGRAM_DATA.
 */
export function resolveSession(
  weekId: string,
  sessionId: string,
  overrides: ProgramOverrides
): Session | null {
  const week = PROGRAM_DATA[weekId]
  if (!week) return null

  const session = week.sessions.find(s => s.id === sessionId)
  if (!session) return null

  const sessionOverride = overrides[weekId]?.[sessionId]
  if (!sessionOverride) return session

  return {
    ...session,
    focus: sessionOverride.focus ?? session.focus,
    exercises: session.exercises.map((ex: Exercise, i: number) => {
      const exOv = sessionOverride.exercises?.[i]
      return exOv ? { ...ex, ...exOv } : ex
    }),
  }
}

/** Vrai si la semaine a au moins un override non-vide */
export function hasWeekOverrides(weekId: string, overrides: ProgramOverrides): boolean {
  const week = overrides[weekId]
  if (!week) return false
  return Object.values(week).some(
    s => s.focus || s.skipped || (s.exercises && Object.keys(s.exercises).length > 0)
  )
}

/** Vrai si cette session précise a un override */
export function hasSessionOverride(
  weekId: string,
  sessionId: string,
  overrides: ProgramOverrides
): boolean {
  return !!overrides[weekId]?.[sessionId]
}
