import { GoogleGenerativeAI } from '@google/generative-ai';
import { KNOWLEDGE_BASE } from './_kb-data';
import { COACH_FUNCTION_DECLARATIONS } from './_coach-tools';

// ── Types ────────────────────────────────────────────────────────────
interface Env {
  GEMINI_API_KEY: string;
  APP_SECRET: string;
}

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  userText: string;
  athleteProfile: {
    name?: string;
    rm?: { squat?: number; bench?: number; deadlift?: number };
  };
}

// ── CORS ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://programme-candito.pages.dev',
  'http://localhost:5173',
  'http://localhost:4173',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ── Rate Limiting (in-memory, per-isolate) ───────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;       // requêtes max
const RATE_WINDOW_MS = 60_000; // par minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP')
    ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    ?? 'unknown';
}

// ── Validation ───────────────────────────────────────────────────────
function validateBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.userText === 'string' &&
    b.userText.trim().length > 0 &&
    b.userText.length <= 2000 &&
    Array.isArray(b.messages) &&
    typeof b.athleteProfile === 'object' &&
    b.athleteProfile !== null
  );
}

// ── CORS Preflight ───────────────────────────────────────────────────
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
};

// ── Main Handler ─────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  // Rate limiting
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de requêtes. Réessaie dans une minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // App secret check — bloque les appels directs hors app
  const appSecret = env.APP_SECRET;
  if (appSecret && request.headers.get('X-App-Secret') !== appSecret) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // API key check
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY non configurée sur le serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Corps de requête invalide (JSON attendu).' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  if (!validateBody(body)) {
    return new Response(
      JSON.stringify({ error: 'Paramètres manquants ou invalides (userText, messages, athleteProfile requis).' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const { messages, userText, athleteProfile } = body;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `Tu es le coach personnel de ${athleteProfile.name || "l'athlète"}, intégré dans l'application Programme Candito 6 semaines.

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
      tools: [{ functionDeclarations: COACH_FUNCTION_DECLARATIONS as any }],
    });

    // Convert history to Gemini format
    const chatHistory = messages.map((m: { role: string; content: string }) => ({
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
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err: any) {
    console.error('Gemini Proxy Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
