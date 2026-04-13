/**
 * program.ts — Program data definition for Candito 6-Week.
 * Standardized structure migrated from Vanilla JS data.js.
 * Phase 2: Complete S1-S6 data + WEEK_SCHEDULE_MAP.
 * Phase CFA: Mise à jour clinique pour Conflit Fémoro-Acétabulaire (Box Squat, Rehab Adducteurs, Splitting S5).
 */
import { type Week } from '../types'

export const WEEK_ORDER = ['s1', 's2', 's3', 's4', 's5', 's6_test', 's6_dec'] as const
export type WeekId = typeof WEEK_ORDER[number]

export const PROGRAM_METADATA: Record<string, { title: string; subtitle: string }> = {
  s1: { title: 'Semaine 1', subtitle: 'Accumulation 1 — Muscular Hypertrophy — 80%' },
  s2: { title: 'Semaine 2', subtitle: 'Accumulation 2 — Muscular Hypertrophy — 80%' },
  s3: { title: 'Semaine 3', subtitle: 'Transmutation — 3 séances — 85-87%' },
  s4: { title: 'Semaine 4', subtitle: 'Acclimatation — 4 séances — 90%' },
  s5: { title: 'Semaine 5', subtitle: 'Peaking — Tests AMRAP — 97.5%' },
  s6_test: { title: 'Semaine 6', subtitle: 'Test Maxis — Option Déconseillée' },
  s6_dec: { title: 'Semaine 6', subtitle: 'Décharge — Récupération active — 50-60%' },
}

// ── COACH MESSAGES ─────────────────────────────────────────────────
// Message dynamique affiché dans CoachCard selon la semaine active.
export const COACH_MESSAGES: Record<string, { tone: string; message: string }> = {
  s1: {
    tone: 'Fondations',
    message: "Construisons les fondations. Volume élevé, fatigue normale. L'objectif est l'hypertrophie. Suis les méthodes d'échauffement.",
  },
  s2: {
    tone: 'Consolidation',
    message: "La continuité de la semaine 1. Va chercher cette surcompensation tout en épongeant la fatigue. Ne force pas sur l'aine.",
  },
  s3: {
    tone: 'Transmutation',
    message: "On quitte le volume pour la force pure. Les repos augmentent. Pense au bain froid ce week-end !",
  },
  s4: {
    tone: 'Acclimatation',
    message: "Semaine la plus lourde avant ton test final. Préparation du SNC. Concentre-toi sur l'ouverture de hanches et ton gainage.",
  },
  s5: {
    tone: 'Peaking',
    message: "Semaine de Réalisation ! Exprime toute la force emmagasinée. 1 seul test AMRAP par jour. Donne tout au box squat !",
  },
  s6_test: {
    tone: 'Jour J',
    message: "Test des maxis. Option déconseillée au vu du CFA, privilégie toujours de battre tes records sans aller sur un vrai 1RM complet.",
  },
  s6_dec: {
    tone: 'Récupération',
    message: "Semaine de décharge indispensable. Purge la fatigue, soigne tes tissus. Le prochain cycle approche.",
  },
}

// ── WEEK_SCHEDULE_MAP ───────────────────────────────────────────────
// Maps weekId -> { dayOfWeek: sessionId | null }
// dayOfWeek: 0=Dimanche, 1=Lundi, ..., 6=Samedi
export const WEEK_SCHEDULE_MAP: Record<string, Record<number, string | null>> = {
  s1:      { 1: 's1_lun', 2: 's1_mar', 3: null, 4: 's1_jeu', 5: 's1_ven', 6: 's1_sam', 0: null },
  s2:      { 1: 's2_lun', 2: 's2_mar', 3: null, 4: 's2_jeu', 5: 's2_ven', 6: 's2_sam', 0: null },
  s3:      { 1: 's3_lun',  2: null,  3: 's3_mer', 4: null,       5: 's3_ven',  6: null,      0: null },
  s4:      { 1: 's4_lun',  2: 's4_mar',  3: null, 4: 's4_jeu',   5: 's4_ven',  6: null,      0: null },
  s5:      { 1: 's5_j1',  2: 's5_j2',  3: 's5_j3', 4: null,       5: null,      6: null,      0: null },
  s6_test: { 1: 's6_test_lun', 2: null, 3: 's6_test_mer', 4: null, 5: 's6_test_ven', 6: null, 0: null },
  s6_dec:  { 1: 's6_dec_lun',  2: null, 3: 's6_dec_mer',  4: null, 5: 's6_dec_ven', 6: null, 0: null },
}

// ── PROGRAM DATA ────────────────────────────────────────────────────
export const PROGRAM_DATA: Record<string, Week> = {

  // ── SEMAINE 1 ──────────────────────────
  s1: {
    id: 's1',
    label: 'Semaine 1',
    sessions: [
      {
        id: 's1_lun',
        day: 'Lundi',
        focus: 'Bas (Lourd)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat (>30°)', sets: '4', reps: '6-8', lift: 'squat', percentage: { lo: 0.80, hi: 0.816 }, note: 'Échauffement Wenning 4x25 avant! Stance large, boîte au-dessus pincement.' },
          { name: 'Soulevé de terre', sets: '2', reps: '6', lift: 'deadlift', percentage: { lo: 0.794, hi: 0.808 } },
          { name: 'Machine Adducteurs', sets: '3', reps: '8-12', note: 'RPE 8. Remplace le Hack Squat pour la hanche.' },
          { name: 'Abdos (Gainage/Crunch)', sets: '3', reps: '10-20' }
        ]
      },
      {
        id: 's1_mar',
        day: 'Mardi',
        focus: 'Haut (Lourd)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '4', reps: '6-8', lift: 'bench', percentage: { lo: 0.795, hi: 0.818 }, note: 'Échauffement Wenning 4x25.' },
          { name: 'Dips', sets: '3', reps: '8-12', note: 'Lestés si possible, RPE 8' },
          { name: 'Rowing', sets: '3', reps: '8-12', note: 'RPE 8' },
          { name: 'Face Pulls', sets: '4', reps: '15-20', note: 'RPE 7, très léger' }
        ]
      },
      {
        id: 's1_jeu',
        day: 'Jeudi',
        focus: 'Haut (Volume & Tech)',
        status: 'pending',
        exercises: [
          { name: 'Larsen Press', sets: '4', reps: '8-10', lift: 'bench', percentage: { lo: 0.659, hi: 0.75 } },
          { name: 'Tractions/Tirage Vert', sets: '3', reps: '8-10', note: 'RPE 8' },
          { name: 'Oiseau/Face Pulls', sets: '3', reps: '15-20' },
        ]
      },
      {
        id: 's1_ven',
        day: 'Vendredi',
        focus: 'Bas (Volume & Tech)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat Pause', sets: '3', reps: '8', lift: 'squat', percentage: { lo: 0.70, hi: 0.70 }, note: 'Mobilité Limber 11. Arrêt mort 2-3s.' },
          { name: 'RDL', sets: '3', reps: '8', lift: 'deadlift', percentage: { lo: 0.647, hi: 0.676 } },
          { name: 'Leg Curls', sets: '3', reps: '12-15', note: 'RPE 8-9' },
          { name: 'Abdos', sets: '3', reps: '15' }
        ]
      },
      {
        id: 's1_sam',
        day: 'Samedi',
        focus: 'Haut (Hypertrophie)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '6-8', lift: 'bench', percentage: { lo: 0.795, hi: 0.795 } },
          { name: 'Dév. Incliné Haltères', sets: '3', reps: '8-12', note: 'RPE 8' },
          { name: 'Triceps Pushdowns', sets: '3', reps: '10-15', note: 'RPE 8-9' }
        ]
      }
    ]
  },

  // ── SEMAINE 2 ──────────────────────────
  s2: {
    id: 's2',
    label: 'Semaine 2',
    sessions: [
      {
        id: 's2_lun',
        day: 'Lundi',
        focus: 'Bas (Lourd)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat (>30°)', sets: '4', reps: '6-8', lift: 'squat', percentage: { lo: 0.80, hi: 0.816 }, note: 'Échauffement Wenning 4x25 avant! Stance large, boîte au-dessus pincement.' },
          { name: 'Soulevé de terre', sets: '2', reps: '6', lift: 'deadlift', percentage: { lo: 0.794, hi: 0.808 } },
          { name: 'Machine Adducteurs', sets: '3', reps: '8-12', note: 'RPE 8. Remplace le Hack Squat pour la hanche.' },
          { name: 'Abdos (Gainage/Crunch)', sets: '3', reps: '10-20' }
        ]
      },
      {
        id: 's2_mar',
        day: 'Mardi',
        focus: 'Haut (Lourd)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '4', reps: '6-8', lift: 'bench', percentage: { lo: 0.795, hi: 0.818 }, note: 'Échauffement Wenning 4x25.' },
          { name: 'Dips', sets: '3', reps: '8-12', note: 'Lestés si possible, RPE 8' },
          { name: 'Rowing', sets: '3', reps: '8-12', note: 'RPE 8' },
          { name: 'Face Pulls', sets: '4', reps: '15-20', note: 'RPE 7, très léger' }
        ]
      },
      {
        id: 's2_jeu',
        day: 'Jeudi',
        focus: 'Haut (Volume & Tech)',
        status: 'pending',
        exercises: [
          { name: 'Larsen Press', sets: '4', reps: '8-10', lift: 'bench', percentage: { lo: 0.659, hi: 0.75 } },
          { name: 'Tractions/Tirage Vert', sets: '3', reps: '8-10', note: 'RPE 8' },
          { name: 'Oiseau/Face Pulls', sets: '3', reps: '15-20' },
        ]
      },
      {
        id: 's2_ven',
        day: 'Vendredi',
        focus: 'Bas (Volume & Tech)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat Pause', sets: '3', reps: '8', lift: 'squat', percentage: { lo: 0.70, hi: 0.70 }, note: 'Mobilité Limber 11. Arrêt mort 2-3s.' },
          { name: 'RDL', sets: '3', reps: '8', lift: 'deadlift', percentage: { lo: 0.647, hi: 0.676 } },
          { name: 'Leg Curls', sets: '3', reps: '12-15', note: 'RPE 8-9' },
          { name: 'Abdos', sets: '3', reps: '15' }
        ]
      },
      {
        id: 's2_sam',
        day: 'Samedi',
        focus: 'Haut (Hypertrophie)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '6-8', lift: 'bench', percentage: { lo: 0.795, hi: 0.795 } },
          { name: 'Dév. Incliné Haltères', sets: '3', reps: '8-12', note: 'RPE 8' },
          { name: 'Triceps Pushdowns', sets: '3', reps: '10-15', note: 'RPE 8-9' }
        ]
      }
    ]
  },

  // ── SEMAINE 3 ──────────────────────────
  s3: {
    id: 's3',
    label: 'Semaine 3',
    sessions: [
      {
        id: 's3_lun',
        day: 'Lundi',
        focus: 'Bas (Puissance)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat', sets: '3', reps: '4-6', lift: 'squat', percentage: { lo: 0.85, hi: 0.87 }, note: 'Wenning 4x25. Gère la douleur 3/10 max.' },
          { name: 'Soulevé de terre', sets: '2', reps: '4-6', lift: 'deadlift', percentage: { lo: 0.85, hi: 0.85 } },
          { name: 'Machine Adducteurs', sets: '3', reps: '10', note: 'RPE 7. Maintien de stabilité bassin.' }
        ]
      },
      {
        id: 's3_mer',
        day: 'Mercredi',
        focus: 'Haut (Puissance)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '4-6', lift: 'bench', percentage: { lo: 0.85, hi: 0.87 }, note: 'Wenning 4x25. Explosif.' },
          { name: 'Rowing lourd', sets: '3', reps: '6', note: 'RPE 8.' },
          { name: 'Face Pulls', sets: '3', reps: '15', note: 'RPE 7.' }
        ]
      },
      {
        id: 's3_ven',
        day: 'Vendredi',
        focus: 'Full Body (Transmut.)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat', sets: '3', reps: '4', lift: 'squat', percentage: { lo: 0.86, hi: 0.86 }, note: 'Mobilité Limber 11.' },
          { name: 'Développé couché', sets: '3', reps: '4', lift: 'bench', percentage: { lo: 0.86, hi: 0.86 } },
          { name: 'Leg Curls/Reverse Hypers', sets: '3', reps: '10', note: 'RPE 7.' }
        ]
      }
    ]
  },

  // ── SEMAINE 4 ──────────────────────────
  s4: {
    id: 's4',
    label: 'Semaine 4',
    sessions: [
      {
        id: 's4_lun',
        day: 'Lundi',
        focus: 'Bas (>90%)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat', sets: '3', reps: '3-4', lift: 'squat', percentage: { lo: 0.90, hi: 0.90 }, note: 'Pas de cul au sol ! Stance large.' },
          { name: 'Soulevé de terre', sets: '2', reps: '3-4', lift: 'deadlift', percentage: { lo: 0.90, hi: 0.91 } },
          { name: 'Machine Adducteurs', sets: '2', reps: '10-15', note: 'RPE 7.' }
        ]
      },
      {
        id: 's4_mar',
        day: 'Mardi',
        focus: 'Haut (>90%)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '3-4', lift: 'bench', percentage: { lo: 0.90, hi: 0.90 } },
          { name: 'Rowing lourd', sets: '3', reps: '6-8', note: 'RPE 8.' },
          { name: 'Face Pulls', sets: '2', reps: '15', note: 'RPE 7.' }
        ]
      },
      {
        id: 's4_jeu',
        day: 'Jeudi',
        focus: 'Bas (Explosivité)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat Dynamique', sets: '3', reps: '2', lift: 'squat', percentage: { lo: 0.70, hi: 0.70 }, note: 'Pause, puis explose ! Force des fessiers.' },
          { name: 'RDL / Leg Curls', sets: '3', reps: '8', note: 'RPE 7. Léger.' }
        ]
      },
      {
        id: 's4_ven',
        day: 'Vendredi',
        focus: 'Haut (Maintien)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '4', reps: '4-6', lift: 'bench', percentage: { lo: 0.77, hi: 0.79 } },
          { name: 'Tractions/Tirage Vert', sets: '3', reps: '8' }
        ]
      }
    ]
  },

  // ── SEMAINE 5 ──────────────────────────
  s5: {
    id: 's5',
    label: 'Semaine 5 — AMRAP',
    sessions: [
      {
        id: 's5_j1',
        day: 'Jour 1',
        focus: 'Test Squat',
        status: 'pending',
        exercises: [
          { name: 'AMRAP Box Squat', sets: '1', reps: 'AMRAP', lift: 'squat', percentage: { lo: 0.966, hi: 0.983 }, note: 'Vise 2 à 4 formidables répétitions. Stop.' }
        ]
      },
      {
        id: 's5_j2',
        day: 'Jour 2',
        focus: 'Test Bench',
        status: 'pending',
        exercises: [
          { name: 'AMRAP Développé couché', sets: '1', reps: 'AMRAP', lift: 'bench', percentage: { lo: 0.977, hi: 0.977 }, note: '2 à 4 répétitions cibles.' },
          { name: 'Tirage/Face Pulls', sets: '3', reps: '15', note: 'Léger décompression épaules.' }
        ]
      },
      {
        id: 's5_j3',
        day: 'Jour 3',
        focus: 'Test Deadlift',
        status: 'pending',
        exercises: [
          { name: 'AMRAP Soulevé de terre', sets: '1', reps: 'AMRAP', lift: 'deadlift', percentage: { lo: 0.97, hi: 0.985 }, note: '2 à 4 répétitions cibles. Dernier effort du cycle.' }
        ]
      }
    ]
  },

  // ── SEMAINE 6 : TEST MAXIS (Option inadaptée CFA) ───────────
  s6_test: {
    id: 's6_test',
    label: 'Semaine 6 — Test 1RM (Risque Hanche)',
    sessions: [
      {
        id: 's6_test_lun',
        day: 'Jour 1',
        focus: 'Test Box Squat',
        status: 'pending',
        exercises: [
          { name: 'Test 1RM', sets: '1', reps: '1', lift: 'squat', percentage: { lo: 1.00, hi: 1.03 } }
        ]
      },
      {
        id: 's6_test_mer',
        day: 'Jour 3',
        focus: 'Test Bench',
        status: 'pending',
        exercises: [
          { name: 'Test 1RM', sets: '1', reps: '1', lift: 'bench', percentage: { lo: 1.00, hi: 1.03 } }
        ]
      },
      {
        id: 's6_test_ven',
        day: 'Jour 5',
        focus: 'Test Deadlift',
        status: 'pending',
        exercises: [
          { name: 'Test 1RM', sets: '1', reps: '1', lift: 'deadlift', percentage: { lo: 1.00, hi: 1.03 } }
        ]
      }
    ]
  },

  // ── SEMAINE 6 : DÉCHARGE (Recommandée) ───────────
  s6_dec: {
    id: 's6_dec',
    label: 'Semaine 6 — Décharge',
    sessions: [
      {
        id: 's6_dec_lun',
        day: 'Jour 1',
        focus: 'Bas (Récup. Active)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat', sets: '3', reps: '5', lift: 'squat', percentage: { lo: 0.50, hi: 0.53 }, note: 'Fait circuler le sang.' },
          { name: 'Soulevé de terre', sets: '2', reps: '5', lift: 'deadlift', percentage: { lo: 0.50, hi: 0.53 } },
          { name: 'Machine Adducteurs', sets: '2', reps: '10' }
        ]
      },
      {
        id: 's6_dec_mer',
        day: 'Jour 2',
        focus: 'Haut (Récup. Active)',
        status: 'pending',
        exercises: [
          { name: 'Développé couché', sets: '3', reps: '5', lift: 'bench', percentage: { lo: 0.50, hi: 0.54 } },
          { name: 'Rowing', sets: '3', reps: '8' },
          { name: 'Face Pulls', sets: '3', reps: '15' }
        ]
      },
      {
        id: 's6_dec_ven',
        day: 'Jour 3',
        focus: 'Bas (Mobilité)',
        status: 'pending',
        exercises: [
          { name: 'Box Squat', sets: '3', reps: '3', lift: 'squat', percentage: { lo: 0.46, hi: 0.46 }, note: 'Remontée explosive. Léger.' }
        ]
      }
    ]
  }
}
