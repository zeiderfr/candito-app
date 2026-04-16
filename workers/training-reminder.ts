import webpush from 'web-push';

// Minimal Cloudflare Workers type stubs (provided by runtime, not installed as a dev-dep)
interface KVNamespace {
  list(options: { prefix: string }): Promise<{ keys: Array<{ name: string }> }>
  get(key: string): Promise<string | null>
  delete(key: string): Promise<void>
}

export interface Env {
  CANDITO_SUBS: KVNamespace;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
}

type WeekId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6_test' | 's6_dec'

// Traduction lisible des sessions pour le titre de la notification
const FOCUS_DISPLAY: Record<string, string> = {
  s1_lun: '🏋️ Squat & Deadlift',   s1_mar: '💪 Bench & Back',
  s1_jeu: '📦 Volume Haut',          s1_ven: '📦 Volume Bas',       s1_sam: '🔥 Hypertrophie Haut',
  s2_lun: '🏋️ Squat & Deadlift',   s2_mar: '💪 Bench & Back',
  s2_jeu: '📦 Volume Haut',          s2_ven: '📦 Volume Bas',       s2_sam: '🔥 Hypertrophie Haut',
  s3_lun: '⚡ Puissance Bas',        s3_mer: '⚡ Puissance Haut',   s3_ven: '🔥 Full Body',
  s4_lun: '🔴 Lourd — Squat & DL',  s4_mar: '🔴 Lourd — Bench',
  s4_jeu: '⚡ Explosivité Bas',      s4_ven: '💪 Maintien Haut',
  s5_j1:  '🏆 TEST SQUAT',           s5_j2:  '🏆 TEST BENCH',       s5_j3: '🏆 TEST DEADLIFT',
  s6_test_lun: '🏆 PR Squat & DL',  s6_test_mer: '🏆 PR Bench',    s6_test_ven: '🏆 PR Deadlift',
  s6_dec_lun:  '🌿 Décharge Bas',   s6_dec_mer:  '🌿 Décharge Haut', s6_dec_ven: '🌿 Mobilité & Récup',
}

// Messages motivants par semaine (5 par pool, sélection déterministe par jour)
const PUSH_MESSAGES: Record<WeekId, string[]> = {
  s1: [
    "Volume S1. Chaque série d'aujourd'hui est une fondation.",
    "80% et régularité — c'est ici que le cycle se construit.",
    "S1 démarre. Sois propre, sois constant.",
    "Le moteur se règle en S1. Aujourd'hui tu poses les bases.",
    "Première brique du cycle. En salle.",
  ],
  s2: [
    "S2 — Les habitudes se gravent. Tiens le cap.",
    "Volume maintenu. La régularité bat l'intensité.",
    "Deuxième semaine — consolide ce que S1 a commencé.",
    "80% encore. La technique prime sur l'ego.",
    "S2 — C'est la constance qui construit un athlète.",
  ],
  s3: [
    "S3 — L'intensité monte, le volume recule. C'est voulu.",
    "Moins de séries, plus de poids. Reste concentré.",
    "85-87% aujourd'hui — échauffement long obligatoire.",
    "Transmutation S3. Tu passes en mode puissance.",
    "S3 — Approche différemment. La charge parle maintenant.",
  ],
  s4: [
    "S4 — Semaine la plus lourde du cycle. Sois prêt.",
    "90%. C'est ici que le cycle se gagne ou se perd.",
    "Acclimatation S4 — échauffement long, mouvement parfait.",
    "Le plus dur de ton cycle est aujourd'hui. Mobilise tout.",
    "S4 — Lourd et propre. Concentre-toi sur chaque rep.",
  ],
  s5: [
    "S5 — Exprime ce que 4 semaines ont construit.",
    "Test aujourd'hui. Vise 2 à 4 reps parfaites. Stop.",
    "Peaking. Tout ce que tu as fait mène à aujourd'hui.",
    "Visualise, respire, exécute. Tu es prêt.",
    "AMRAP de vérité. Pas d'ego — laisse le travail parler.",
  ],
  s6_test: [
    "Jour J. Les maxes arrivent. Technique avant tout.",
    "6 semaines pour ce moment. Concentre-toi.",
    "PR — échauffement progressif, rien de forcé.",
    "Ce n'est pas une épreuve, c'est une démonstration.",
    "Confiance. Tu as fait le travail. Maintenant montre-le.",
  ],
  s6_dec: [
    "Décharge S6 — le corps récupère et se renforce.",
    "50-60% aujourd'hui. Mouvement fluide, aucune douleur.",
    "Le plus dur est derrière toi. Laisse le corps absorber.",
    "Décharge active — protège le travail accompli.",
    "Dernière semaine. Le prochain cycle sera plus fort.",
  ],
}

interface PushSubscriptionData {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

interface SubscriptionRecord {
  subscription: PushSubscriptionData
  weekId: string
  name?: string
  lastSync?: string
}

// Data simplifiée du programme pour le worker
const WEEK_SCHEDULE_MAP: Record<WeekId, Partial<Record<number, string>>> = {
  s1:      { 1: 's1_lun', 2: 's1_mar', 4: 's1_jeu', 5: 's1_ven', 6: 's1_sam' },
  s2:      { 1: 's2_lun', 2: 's2_mar', 4: 's2_jeu', 5: 's2_ven', 6: 's2_sam' },
  s3:      { 1: 's3_lun', 3: 's3_mer', 5: 's3_ven' },
  s4:      { 1: 's4_lun', 2: 's4_mar', 4: 's4_jeu', 5: 's4_ven' },
  s5:      { 1: 's5_j1',  2: 's5_j2',  3: 's5_j3' },
  s6_test: { 1: 's6_test_lun', 3: 's6_test_mer', 5: 's6_test_ven' },
  s6_dec:  { 1: 's6_dec_lun',  3: 's6_dec_mer',  5: 's6_dec_ven' },
};

const FOCUS_MAP: Record<string, string> = {
  s1_lun: 'Bas (Lourd)', s1_mar: 'Haut (Lourd)', s1_jeu: 'Haut (Volume)', s1_ven: 'Bas (Volume)', s1_sam: 'Haut (Hyper)',
  s2_lun: 'Bas (Lourd)', s2_mar: 'Haut (Lourd)', s2_jeu: 'Haut (Volume)', s2_ven: 'Bas (Volume)', s2_sam: 'Haut (Hyper)',
  s3_lun: 'Bas (Puissance)', s3_mer: 'Haut (Puissance)', s3_ven: 'Full Body',
  s4_lun: 'Bas (>90%)', s4_mar: 'Haut (>90%)', s4_jeu: 'Bas (Explo)', s4_ven: 'Haut (Maintien)',
  s5_j1: 'Test Squat', s5_j2: 'Test Bench', s5_j3: 'Test Deadlift',
  s6_test_lun: 'PR Squat/DL', s6_test_mer: 'PR Bench', s6_test_ven: 'PR Deadlift',
  s6_dec_lun: 'Bas (Décharge)', s6_dec_mer: 'Haut (Décharge)', s6_dec_ven: 'Bas (Mobilité)',
};

export default {
  async scheduled(_event: unknown, env: Env, _ctx: unknown): Promise<void> {
    const vapidDetails = {
      subject: 'mailto:admin@programme-candito.pages.dev',
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    };

    // 1. Lister tous les abonnés
    const list = await env.CANDITO_SUBS.list({ prefix: 'sub:' });
    const dayOfWeek = new Date().getDay();

    // 2. Traiter tous les abonnés en parallèle (O(1) vs O(n) séquentiel)
    await Promise.allSettled(
      list.keys.map(async (key) => {
        const data = await env.CANDITO_SUBS.get(key.name);
        if (!data) return;

        const { subscription, weekId } = JSON.parse(data) as SubscriptionRecord;
        const weekSchedule = WEEK_SCHEDULE_MAP[weekId as WeekId] ?? {};
        const sessionId = weekSchedule[dayOfWeek];

        if (sessionId) {
          const focus = FOCUS_MAP[sessionId] ?? "Séance aujourd'hui";
          const payload = JSON.stringify({
            title: 'CANDITO — Rappel Séance',
            body: `Aujourd'hui : ${focus}. Bonne chance !`,
            url: '/programme'
          });

          try {
            await webpush.sendNotification(subscription, payload, vapidDetails);
          } catch (err) {
            const e = err as { statusCode?: number };
            if (e.statusCode === 410 || e.statusCode === 404) {
              // L'abonnement a expiré ou a été révoqué par l'utilisateur
              await env.CANDITO_SUBS.delete(key.name);
            }
          }
        }
      })
    );
  },
};
