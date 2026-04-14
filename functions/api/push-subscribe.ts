interface Env {
  CANDITO_SUBS: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const subscription = await context.request.json();

    if (!subscription || !subscription.endpoint) {
      return new Response("Invalid subscription object", { status: 400 });
    }

    // On utilise l'endpoint comme clé unique (hashée ou brute)
    // Pour simplifier, on stocke l'objet JSON complet
    const key = `sub:${subscription.endpoint}`;
    
    // On expire les abonnements après 90 jours d'inactivité pour nettoyer la KV
    await context.env.CANDITO_SUBS.put(key, JSON.stringify(subscription), {
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
