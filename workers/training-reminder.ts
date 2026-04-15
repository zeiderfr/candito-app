import webpush from 'web-push';

export interface Env {
  CANDITO_SUBS: KVNamespace;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
}

type WeekId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6_test' | 's6_dec'

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
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
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
