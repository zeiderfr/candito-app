import { GoogleGenerativeAI } from '@google/generative-ai';
import { KNOWLEDGE_BASE } from '../../app/src/data/knowledgeBase';
import { COACH_FUNCTION_DECLARATIONS } from '../../app/src/lib/coachTools';

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

  const apiKey = env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing Gemini API key" }), { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { messages, athleteProfile, userText } = await request.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `Tu es le coach personnel de ${athleteProfile.name || 'l\'athlète'}, intégré dans l'application Programme Candito 6 semaines.

## Profil Athlète
- Nom : ${athleteProfile.name || 'Inconnu'}
- 1RM Squat : ${athleteProfile.rm?.squat || 0} kg | Bench : ${athleteProfile.rm?.bench || 0} kg | Deadlift : ${athleteProfile.rm?.deadlift || 0} kg

## Instructions
- Réponds en français, tutoiement.
- 1 à 3 phrases maximum. 
- Utilise tes outils pour modifier l'app (PR, séances, RM).
- Base-toi UNIQUEMENT sur la base de connaissances ci-dessous pour les conseils techniques et médicaux.

--- BASE DE CONNAISSANCES ---
${KNOWLEDGE_BASE}
--- FIN BASE DE CONNAISSANCES ---`,
      tools: [{ functionDeclarations: COACH_FUNCTION_DECLARATIONS }],
    });

    // Convertir l'historique au format Gemini
    const chatHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userText);
    const response = await result.response;

    return new Response(JSON.stringify({
      text: response.text(),
      functionCalls: response.functionCalls(),
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err: any) {
    console.error("Gemini Proxy Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
};
