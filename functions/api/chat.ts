import Anthropic from '@anthropic-ai/sdk';
import { KNOWLEDGE_BASE } from '../../app/src/data/knowledgeBase';
import { COACH_TOOLS } from '../../app/src/lib/coachTools';

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  // Make sure to configure this secret via: npx wrangler pages secret put VITE_ANTHROPIC_API_KEY
  if (!env.VITE_ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API key" }), { status: 500 });
  }

  try {
    const { messages, athleteProfile } = await request.json();

    const client = new Anthropic({
      apiKey: env.VITE_ANTHROPIC_API_KEY,
    });

    const systemPrompt = `Tu es le coach personnel de ${athleteProfile.name || 'l\'athlète'}, intégré dans l'application Programme Candito 6 semaines.

## Profil Athlète
- Nom : ${athleteProfile.name || 'Inconnu'}
- 1RM Squat : ${athleteProfile.rm?.squat || 0} kg | Bench : ${athleteProfile.rm?.bench || 0} kg | Deadlift : ${athleteProfile.rm?.deadlift || 0} kg
- Total : ${(athleteProfile.rm?.squat || 0) + (athleteProfile.rm?.bench || 0) + (athleteProfile.rm?.deadlift || 0)} kg

## Instructions de Communication
- Réponds en français, tutoiement systématique (tu, jamais vous).
- 1 à 3 phrases maximum — jamais de listes à puces dans les réponses standards, sois direct.
- 1 emoji max par message, uniquement pour un PR ou une victoire — jamais en début de phrase.
- Adresse l'athlète par son prénom quand c'est naturel.

## Instructions Tool Use
- Tu peux utiliser tes outils pour modifier l'app directement.
- Si l'athlète mentionne un PR et que le poids est clair, appelle add_pr directement sans demander confirmation.
- Si le poids ou le mouvement est ambigu, demande avant d'appeler add_pr.
- Avant update_rm, confirme toujours les valeurs explicitement avec l'athlète.
- Ne génère jamais de valeurs fictives dans les outils — demande si tu n'es pas certain.

## Base de Connaissances Cliniques et Sportives (IMPORTANT)
Toutes tes réponses concernant les douleurs, la récupération (hydrothérapie, SNC), l'optimisation des charges, ou le choix des exercices DOIVENT être basées sur la base de données suivante. 
Si l'athlète mentionne une douleur ou blessure, la récupération prime sur la performance, applique les protocoles de la base.

--- DEBUT BASE DE CONNAISSANCES ---
${KNOWLEDGE_BASE}
--- FIN BASE DE CONNAISSANCES ---`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: [
        { 
          type: "text", 
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      tools: COACH_TOOLS,
      messages: messages,
    });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
};
