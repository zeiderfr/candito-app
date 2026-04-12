/**
 * program.ts — Program data definition for Candito 6-Week.
 * Standardized structure migrated from Vanilla JS data.js.
 * Phase 2: Complete S1-S6 data + WEEK_SCHEDULE_MAP.
 */
import { type Week } from '../types'

export const WEEK_ORDER = ['s1s2', 's3', 's4', 's5', 's6_test', 's6_dec'] as const
export type WeekId = typeof WEEK_ORDER[number]

export const PROGRAM_METADATA: Record<string, { title: string; subtitle: string }> = {
  s1s2: { title: 'Semaines 1-2', subtitle: 'Accumulation — 5 séances/semaine — 78-82%' },
  s3: { title: 'Semaine 3', subtitle: 'Transmutation — 3 séances — 85-88%' },
  s4: { title: 'Semaine 4', subtitle: 'Acclimatation — 3 séances — 90-93%' },
  s5: { title: 'Semaine 5', subtitle: 'Peaking — Tests AMRAP — 95%' },
  s6_test: { title: 'Semaine 6', subtitle: 'Test Maxis — Openers → PR' },
  s6_dec: { title: 'Semaine 6', subtitle: 'Décharge — Récupération active — 80%' },
}

// ── COACH MESSAGES ─────────────────────────────────────────────────
// Message dynamique affiché dans CoachCard selon la semaine active.
export const COACH_MESSAGES: Record<string, { tone: string; message: string }> = {
  s1s2: {
    tone: 'Fondations',
    message: "Construisons les fondations. Volume élevé, RPE contrôlé — la fatigue est normale, c'est le signal que tu progresses.",
  },
  s3: {
    tone: 'Transition',
    message: "Les charges montent. Reste technique sous la barre. Le physique s'adapte, le mental aussi.",
  },
  s4: {
    tone: 'Acclimatation',
    message: "Acclimatation aux charges lourdes. Chaque rep compte. La confiance se construit maintenant.",
  },
  s5: {
    tone: 'Peaking',
    message: "Semaine de test AMRAP. Pousse au maximum sur chaque mouvement — note chaque répétition, elles calculeront ton prochain 1RM.",
  },
  s6_test: {
    tone: 'Jour J',
    message: "C'est le jour J. 6 semaines de travail pour ce moment. Confiance absolue dans le processus — tu es prêt.",
  },
  s6_dec: {
    tone: 'Récupération',
    message: "Semaine de décharge. Le travail est fait. Récupère pleinement — le prochain cycle commence dans quelques jours.",
  },
}

// ── WEEK_SCHEDULE_MAP ───────────────────────────────────────────────
// Maps weekId -> { dayOfWeek: sessionId | null }
// dayOfWeek: 0=Dimanche, 1=Lundi, ..., 6=Samedi
export const WEEK_SCHEDULE_MAP: Record<string, Record<number, string | null>> = {
  s1s2:    { 1: 's12_lun', 2: 's12_mar', 3: null, 4: 's12_jeu', 5: 's12_ven', 6: 's12_sam', 0: null },
  s3:      { 1: 's3_lun',  2: 's3_mar',  3: null, 4: null,       5: 's3_ven',  6: null,      0: null },
  s4:      { 1: 's4_lun',  2: 's4_mar',  3: null, 4: null,       5: 's4_ven',  6: null,      0: null },
  s5:      { 1: 's5_lun',  2: 's5_mar',  3: null, 4: null,       5: null,      6: null,      0: null },
  s6_test: { 1: 's6_test_lun', 2: null, 3: 's6_test_mer', 4: null, 5: null, 6: null, 0: null },
  s6_dec:  { 1: 's6_dec_lun',  2: null, 3: 's6_dec_mer',  4: null, 5: null, 6: null, 0: null },
}

// ── PROGRAM DATA ────────────────────────────────────────────────────
export const PROGRAM_DATA: Record<string, Week> = {

  // ── SEMAINES 1-2 : ACCUMULATION (78-82%) ──────────────────────────
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
  },

  // ── SEMAINE 3 : TRANSMUTATION (85-88%) ────────────────────────────
  s3: {
    id: 's3',
    label: 'Semaine 3',
    sessions: [
      {
        id: 's3_lun',
        day: 'Lundi',
        focus: 'Squat & Deadlift',
        status: 'pending',
        exercises: [
          { name: 'Squat Low Bar', sets: '3', reps: '4-6', lift: 'squat', percentage: { lo: 0.85, hi: 0.88 } },
          { name: 'Soulevé de terre', sets: '2', reps: '4-6', lift: 'deadlift', percentage: { lo: 0.85, hi: 0.88 } },
          { name: 'Hanging Leg Raises', sets: '2', reps: '10-15' },
        ]
      },
      {
        id: 's3_mar',
        day: 'Mardi',
        focus: 'Bench & Upper',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '4-6', lift: 'bench', percentage: { lo: 0.85, hi: 0.88 } },
          { name: 'Rowing buste penché', sets: '2', reps: '6-8' },
          { name: 'Face Pulls', sets: '3', reps: '15' },
        ]
      },
      {
        id: 's3_ven',
        day: 'Vendredi',
        focus: 'Bench Technique',
        status: 'pending',
        exercises: [
          { name: 'Larsen Press', sets: '3', reps: '4-6', lift: 'bench', percentage: { lo: 0.82, hi: 0.85 } },
          { name: 'Tractions', sets: '2', reps: '6-8' },
          { name: 'Face Pulls', sets: '2', reps: '15' },
        ]
      }
    ]
  },

  // ── SEMAINE 4 : ACCLIMATATION (90-93%) ────────────────────────────
  s4: {
    id: 's4',
    label: 'Semaine 4',
    sessions: [
      {
        id: 's4_lun',
        day: 'Lundi',
        focus: 'Squat & Deadlift',
        status: 'pending',
        exercises: [
          { name: 'Squat Low Bar', sets: '3', reps: '2-3', lift: 'squat', percentage: { lo: 0.90, hi: 0.93 } },
          { name: 'Soulevé de terre', sets: '2', reps: '2-3', lift: 'deadlift', percentage: { lo: 0.90, hi: 0.93 } },
        ]
      },
      {
        id: 's4_mar',
        day: 'Mardi',
        focus: 'Bench & Upper',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '2-3', lift: 'bench', percentage: { lo: 0.90, hi: 0.93 } },
          { name: 'Rowing buste penché', sets: '2', reps: '5-6' },
        ]
      },
      {
        id: 's4_ven',
        day: 'Vendredi',
        focus: 'Bench Technique',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '2-3', lift: 'bench', percentage: { lo: 0.90, hi: 0.92 } },
          { name: 'Face Pulls', sets: '2', reps: '15' },
        ]
      }
    ]
  },

  // ── SEMAINE 5 : PEAKING — TESTS AMRAP (95%) ──────────────────────
  s5: {
    id: 's5',
    label: 'Semaine 5',
    sessions: [
      {
        id: 's5_lun',
        day: 'Lundi',
        focus: 'Test Squat & Deadlift',
        status: 'pending',
        exercises: [
          { name: 'TEST Squat — Max reps', sets: '1', reps: 'AMRAP', lift: 'squat', percentage: { lo: 0.95, hi: 0.95 } },
          { name: 'TEST Deadlift — Max reps', sets: '1', reps: 'AMRAP', lift: 'deadlift', percentage: { lo: 0.95, hi: 0.95 } },
        ]
      },
      {
        id: 's5_mar',
        day: 'Mardi',
        focus: 'Test Bench',
        status: 'pending',
        exercises: [
          { name: 'TEST Bench — Max reps', sets: '1', reps: 'AMRAP', lift: 'bench', percentage: { lo: 0.95, hi: 0.95 } },
          { name: 'Rowing buste penché', sets: '3', reps: '8' },
          { name: 'Face Pulls', sets: '2', reps: '15' },
        ]
      }
    ]
  },

  // ── SEMAINE 6 TEST : MAXIS ────────────────────────────────────────
  s6_test: {
    id: 's6_test',
    label: 'Semaine 6 — Test Maxis',
    sessions: [
      {
        id: 's6_test_lun',
        day: 'Lundi',
        focus: 'Test Squat & Deadlift',
        status: 'pending',
        exercises: [
          { name: 'Squat Opener', sets: '1', reps: '1', lift: 'squat', percentage: { lo: 0.90, hi: 0.92 } },
          { name: 'Squat 2ème tentative', sets: '1', reps: '1', lift: 'squat', percentage: { lo: 0.96, hi: 0.98 } },
          { name: 'Squat PR', sets: '1', reps: '1', lift: 'squat', percentage: { lo: 1.00, hi: 1.02 } },
          { name: 'DL Opener', sets: '1', reps: '1', lift: 'deadlift', percentage: { lo: 0.90, hi: 0.92 } },
          { name: 'DL 2ème tentative', sets: '1', reps: '1', lift: 'deadlift', percentage: { lo: 0.96, hi: 0.98 } },
          { name: 'DL PR', sets: '1', reps: '1', lift: 'deadlift', percentage: { lo: 1.00, hi: 1.02 } },
        ]
      },
      {
        id: 's6_test_mer',
        day: 'Mercredi',
        focus: 'Test Bench',
        status: 'pending',
        exercises: [
          { name: 'Bench Opener', sets: '1', reps: '1', lift: 'bench', percentage: { lo: 0.90, hi: 0.92 } },
          { name: 'Bench 2ème tentative', sets: '1', reps: '1', lift: 'bench', percentage: { lo: 0.96, hi: 0.98 } },
          { name: 'Bench PR', sets: '1', reps: '1', lift: 'bench', percentage: { lo: 1.00, hi: 1.02 } },
        ]
      }
    ]
  },

  // ── SEMAINE 6 DÉCHARGE ────────────────────────────────────────────
  s6_dec: {
    id: 's6_dec',
    label: 'Semaine 6 — Décharge',
    sessions: [
      {
        id: 's6_dec_lun',
        day: 'Lundi',
        focus: 'Lower Décharge',
        status: 'pending',
        exercises: [
          { name: 'Squat Low Bar', sets: '2', reps: '3', lift: 'squat', percentage: { lo: 0.80, hi: 0.80 } },
          { name: 'Soulevé de terre', sets: '1', reps: '3', lift: 'deadlift', percentage: { lo: 0.80, hi: 0.80 } },
        ]
      },
      {
        id: 's6_dec_mer',
        day: 'Mercredi',
        focus: 'Upper Décharge',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '2', reps: '3', lift: 'bench', percentage: { lo: 0.80, hi: 0.80 } },
        ]
      }
    ]
  },
}
