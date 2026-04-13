import { type CanditoState, type RM } from '../types'

/** Arrondi à la plaque 2.5 kg la plus proche */
export function calcWeight(rm: number, pct: number): number {
  if (!rm) return 0
  return Math.round((rm * pct) / 2.5) * 2.5
}

// ── EPLEY 1RM SUGGESTION ─────────────────────────────────────────────────────
// e1RM = weight * (1 + reps/30), arrondi au 2.5kg supérieur
export function epley(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function roundUp2_5(value: number): number {
  return Math.ceil(value / 2.5) * 2.5
}

export function suggestNewRM(state: CanditoState): RM {
  const lifts: Array<'squat' | 'bench' | 'deadlift'> = ['squat', 'bench', 'deadlift']
  const result: RM = { squat: 0, bench: 0, deadlift: 0 }

  for (const lift of lifts) {
    let best = state.athlete.rm[lift] // fallback = 1RM actuel

    // Parcourir tous les sessionLogs
    const logs = state.progress?.sessionLogs || []
    for (const log of logs) {
      for (const ex of log.exercises) {
        // Validation sécurisée prioritairement via paramètre lift
        let isLift = false
        if (ex.lift) {
          isLift = ex.lift === lift
        } else {
          // Fallback regex texte pour l'historique de V3
          const nameLower = ex.exerciseName.toLowerCase()
          isLift =
            (lift === 'squat' && (nameLower.includes('squat') || nameLower.includes('box'))) ||
            (lift === 'bench' && nameLower.includes('bench')) ||
            (lift === 'deadlift' && (nameLower.includes('deadlift') || nameLower.includes('soulevé')))
        }

        if (!isLift) continue

        for (const set of ex.sets) {
          if (!set.weight || set.reps <= 0) continue
          const e1rm = epley(set.weight, set.reps)
          if (e1rm > best) best = e1rm
        }
      }
    }

    // Comparer avec les PRs
    const prs = state.progress?.prs || []
    for (const pr of prs) {
      if (pr.lift !== lift) continue
      const e1rm = epley(pr.weight, pr.reps)
      if (e1rm > best) best = e1rm
    }

    result[lift] = roundUp2_5(best)
  }

  return result
}
