/**
 * program.ts — Program data definition for Candito 6-Week.
 * Standardized structure migrated from Vanilla JS data.js.
 */
import { type Day } from '../types'

export const PROGRAM_METADATA = {
  s1s2: { title: 'Semaines 1-2', subtitle: 'Accumulation — 5 séances/semaine — 78-82%' },
  s3: { title: 'Semaine 3', subtitle: 'Transmutation — 3 séances — 85-88%' },
  s4: { title: 'Semaine 4', subtitle: 'Acclimatation — 3 séances — 90-93%' },
  s5: { title: 'Semaine 5', subtitle: 'Peaking — Tests AMRAP — 95%' },
  s6: { title: 'Semaine 6', subtitle: 'Test Maxis ou Décharge' },
}

export const PROGRAM_DATA: Record<string, Day[]> = {
  s1s2: [
    {
      id: 's12_lun',
      label: 'Lundi',
      sessions: [
        {
          id: 's12_lun_s1',
          focus: 'Squat & Deadlift',
          status: 'pending',
          exercises: [
            { name: 'Squat Low Bar', sets: '4', reps: '6-8', rpe_target: '7-8', note: 'Charge cible: 78-82%' },
            { name: 'Soulevé de terre', sets: '2', reps: '6', rpe_target: '8' },
            { name: 'Hip Thrust', sets: '3', reps: '8-10' },
            { name: 'Hack Squat', sets: '3', reps: '8-12' },
          ]
        }
      ]
    }
  ]
}
