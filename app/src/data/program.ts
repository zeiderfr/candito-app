/**
 * program.ts — Program data definition for Candito 6-Week.
 * Standardized structure migrated from Vanilla JS data.js.
 * Strictly following the 'Schedule Engine' requirements.
 */
import { type Day, type Week } from '../types'

export const PROGRAM_METADATA = {
  s1s2: { title: 'Semaines 1-2', subtitle: 'Accumulation — 5 séances/semaine — 78-82%' },
  s3: { title: 'Semaine 3', subtitle: 'Transmutation — 3 séances — 85-88%' },
  s4: { title: 'Semaine 4', subtitle: 'Acclimatation — 3 séances — 90-93%' },
  s5: { title: 'Semaine 5', subtitle: 'Peaking — Tests AMRAP — 95%' },
  s6: { title: 'Semaine 6', subtitle: 'Test Maxis ou Décharge' },
}

// Mapping des jours de la semaine (Date.getDay()) vers les IDs de sessions
// 0: Dimanche, 1: Lundi, 2: Mardi, 3: Mercredi, 4: Jeudi, 5: Vendredi, 6: Samedi
export const SCHEDULE_MAP: Record<number, string | null> = {
  1: 's12_lun',
  2: 's12_mar',
  3: null, // Repos
  4: 's12_jeu',
  5: 's12_ven',
  6: 's12_sam',
  0: null, // Repos
}

export const PROGRAM_DATA: Record<string, Week> = {
  s1s2: {
    id: 's1s2',
    label: 'Semaines 1-2',
    sessions: [
      {
        id: 's12_lun',
        day: 'Lundi',
        focus: 'Squat & Deadlift',
        status: 'pending',
        exercises: [
          { name: 'Squat Low Bar', sets: '4', reps: '6-8', lift: 'squat', percentage: { lo: 0.78, hi: 0.82 } },
          { name: 'Soulevé de terre', sets: '2', reps: '6', lift: 'deadlift', percentage: { lo: 0.78, hi: 0.82 } },
          { name: 'Hip Thrust', sets: '3', reps: '8-10' },
          { name: 'Hack Squat', sets: '3', reps: '8-12' },
          { name: 'Hanging Leg Raises', sets: '3', reps: '10-15' },
        ]
      },
      {
        id: 's12_mar',
        day: 'Mardi',
        focus: 'Bench & Upper',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '4', reps: '6-8', lift: 'bench', percentage: { lo: 0.78, hi: 0.82 } },
          { name: 'Dips', sets: '3', reps: '8-12' },
          { name: 'Rowing buste penché', sets: '3', reps: '8-12' },
          { name: 'Face Pulls', sets: '4', reps: '15-20' },
        ]
      },
      {
        id: 's12_jeu',
        day: 'Jeudi',
        focus: 'Upper Accessoire',
        status: 'pending',
        exercises: [
          { name: 'Larsen Press', sets: '4', reps: '8-10', lift: 'bench', percentage: { lo: 0.65, hi: 0.75 } },
          { name: 'OHP Dév. militaire', sets: '3', reps: '6-8' },
          { name: 'Tractions', sets: '3', reps: '8-10' },
          { name: 'Face Pulls', sets: '4', reps: '15-20' },
        ]
      },
      {
        id: 's12_ven',
        day: 'Vendredi',
        focus: 'Lower Accessoire',
        status: 'pending',
        exercises: [
          { name: 'Pause Squat', sets: '3', reps: '8', lift: 'squat', percentage: { lo: 0.68, hi: 0.72 } },
          { name: 'RDL Romanian DL', sets: '3', reps: '8', lift: 'deadlift', percentage: { lo: 0.65, hi: 0.70 } },
          { name: 'Nordic Curls', sets: '3', reps: '4-6' },
          { name: 'Ab Wheel', sets: '3', reps: '10-15' },
        ]
      },
      {
        id: 's12_sam',
        day: 'Samedi',
        focus: 'Bench Volume',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '6-8', lift: 'bench', percentage: { lo: 0.78, hi: 0.82 } },
          { name: 'Dév. incliné haltères', sets: '3', reps: '8-12' },
          { name: 'Élévations latérales', sets: '3', reps: '12-15' },
          { name: 'Triceps Pushdowns', sets: '3', reps: '10-15' },
          { name: 'Face Pulls', sets: '3', reps: '15-20' },
        ]
      }
    ]
  }
}
