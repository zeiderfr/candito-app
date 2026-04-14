interface Env {
  CANDITO_SUBS: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json() as { 
      subscription: PushSubscription, 
      weekId?: string, 
      name?: string 
    };
    const { subscription, weekId, name } = data;

    if (!subscription || !subscription.endpoint) {
      return new Response("Invalid subscription object", { status: 400 });
    }

    if (!context.env.CANDITO_SUBS) {
      return new Response(JSON.stringify({ 
        error: "Configuration requise : Le namespace Cloudflare KV 'CANDITO_SUBS' n'est pas lié à votre projet Pages.",
        help: "Allez dans Dashboard > Pages > Votre Projet > Settings > Functions > KV namespace bindings."
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const key = `sub:${subscription.endpoint}`;
    
    // On stocke les infos enrichies
    const record = {
      subscription,
      weekId: weekId || 's1',
      name: name || '',
      lastSync: new Date().toISOString()
    };

    // On expire les abonnements après 90 jours d'inactivité pour nettoyer la KV
    await context.env.CANDITO_SUBS.put(key, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90 
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
