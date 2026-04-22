---
name: ai-agent-app-integration
description: "Design and implement a production-ready AI agent with tool use inside a client application, including optimized database architecture for conversation history, embeddings, and knowledge retrieval."
category: engineering
risk: safe
source: self
source_type: self
date_added: "2026-04-22"
author: theodiez
tags: [ai-agent, tool-use, claude-api, rag, vector-db, react, pwa, database, embeddings]
tools: [claude]
license: "MIT"
---

# AI Agent App Integration

## Overview

This skill guides the complete design and implementation of an AI agent embedded inside a client application — from API architecture to database schema. It covers Claude API tool use (function calling), real-time app state injection into the system prompt, conversation persistence, and an optimized multi-tier database strategy for hybrid search (vector + keyword). Use this when you want an agent that can read and mutate application state through natural language, not just answer questions.

---

## When to Use This Skill

- When the user wants an AI assistant that can perform actions inside the app (log data, update state, trigger UI)
- When building a chat interface that needs persistent memory across sessions
- When designing a RAG pipeline over heterogeneous sources (PDF, web, YouTube transcripts)
- When the user asks how to connect a knowledge base (NotebookLM, Notion, Drive) to a custom app
- When architecting the database layer for an AI-powered feature (embeddings, conversation logs, tool call history)
- When the user asks how to expose app functions to an LLM safely

---

## How It Works

### Step 1: Define the Agent's Scope (Before Writing Any Code)

Answer these four questions before touching the API:

1. **What can the agent READ?** (app state, user history, program data)
2. **What can the agent WRITE?** (which mutations are allowed — be minimal)
3. **What knowledge does it need?** (curated system prompt vs. full RAG)
4. **Where does state live?** (client-only, hybrid, or server-side)

Document the tool surface as a contract:

```typescript
// tools.ts — Single source of truth for agent capabilities
export const AGENT_TOOLS = [
  {
    name: "add_pr",
    description: "Record a new personal record for a lift.",
    input_schema: {
      type: "object",
      properties: {
        lift: { type: "string", enum: ["squat", "bench", "deadlift"] },
        weight: { type: "number", description: "Weight in kg" },
        reps: { type: "number", description: "Number of reps performed" }
      },
      required: ["lift", "weight", "reps"]
    }
  },
  {
    name: "reschedule_session",
    description: "Mark a training session as rescheduled to a different date.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        newDate: { type: "string", description: "ISO date string YYYY-MM-DD" },
        reason: { type: "string", description: "Optional reason for rescheduling" }
      },
      required: ["sessionId", "newDate"]
    }
  },
  {
    name: "complete_session",
    description: "Mark a training session as completed.",
    input_schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" }
      },
      required: ["sessionId"]
    }
  },
  {
    name: "update_rm",
    description: "Update the athlete's 1-rep max values.",
    input_schema: {
      type: "object",
      properties: {
        squat: { type: "number" },
        bench: { type: "number" },
        deadlift: { type: "number" }
      }
    }
  }
] as const
```

**Rule:** Never expose destructive or irreversible tools without a confirmation step in the tool description.

---

### Step 2: Build the System Prompt with Live State Injection

The system prompt is your agent's brain. Inject app state at call time — not hardcoded.

```typescript
// lib/agentPrompt.ts
import type { CanditoState } from '../types'
import { PROGRAM_DATA } from '../data/program'

export function buildSystemPrompt(state: CanditoState): string {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const currentWeek = PROGRAM_DATA[state.currentWeekId]
  const pendingSessions = currentWeek?.sessions
    .filter(s => !state.progress.completedSessions.includes(s.id))
    .map(s => `  - ${s.id}: ${s.focus}`)
    .join('\n') ?? 'Aucune'

  const recentPRs = state.progress.prs
    .slice(-3)
    .map(p => `  - ${p.lift} ${p.weight}kg × ${p.reps} (${p.date})`)
    .join('\n') || '  Aucun récent'

  return `Tu es le coach personnel de ${state.athlete.name}, un assistant IA intégré dans l'application Programme Candito.

## Profil athlète
- Nom : ${state.athlete.name}
- 1RM Squat : ${state.athlete.rm.squat} kg
- 1RM Bench : ${state.athlete.rm.bench} kg
- 1RM Deadlift : ${state.athlete.rm.deadlift} kg
- Total : ${state.athlete.rm.squat + state.athlete.rm.bench + state.athlete.rm.deadlift} kg
- Cycle actuel : #${state.cycleNumber} (démarré le ${state.cycleStartDate})

## Semaine en cours
- Semaine : ${state.currentWeekId} — ${currentWeek?.title ?? 'Inconnue'}
- Sessions restantes :
${pendingSessions}

## PRs récents
${recentPRs}

## Date et contexte
- Aujourd'hui : ${today}

## Tes capacités
Tu peux appeler des outils pour modifier l'application directement :
- Enregistrer un nouveau PR
- Marquer une session comme complétée
- Reporter une session à une autre date
- Mettre à jour les 1RM

## Règles importantes
- Sois concis : 1 à 3 phrases max dans tes réponses texte
- Confirme toujours avant d'utiliser un outil destructif (mise à jour RM)
- Si tu n'es pas sûr d'une valeur (poids, date), demande confirmation
- Ne génère jamais de données fictives dans les outils
- Si l'athlète exprime une douleur ou blessure, priorise la récupération sur la performance`
}
```

**Key principle:** State injection happens at every API call, not once at initialization. The agent always has fresh context.

---

### Step 3: Implement the Agent Hook (React)

```typescript
// hooks/useAgent.ts
import { useState, useCallback, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '../lib/agentPrompt'
import { AGENT_TOOLS } from '../lib/tools'
import { useCandito } from '../context/CanditoContext'
import { useConversationDB } from './useConversationDB'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
}

interface ToolCall {
  name: string
  input: Record<string, unknown>
  result: string
}

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true  // Replace with a proxy for production
})

export function useAgent() {
  const { state, addPR, toggleSession, updateRM, logSession } = useCandito()
  const { messages, appendMessage, clearHistory } = useConversationDB()
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  // Map tool names to actual app functions
  const executeTool = useCallback(async (
    toolName: string,
    toolInput: Record<string, unknown>
  ): Promise<string> => {
    switch (toolName) {
      case 'add_pr': {
        const { lift, weight, reps } = toolInput as { lift: 'squat'|'bench'|'deadlift', weight: number, reps: number }
        addPR(lift, weight, reps)
        return `PR enregistré : ${lift} ${weight}kg × ${reps} reps`
      }
      case 'complete_session': {
        const { sessionId } = toolInput as { sessionId: string }
        toggleSession(sessionId)
        return `Session ${sessionId} marquée comme complétée`
      }
      case 'update_rm': {
        const rm = toolInput as Partial<{ squat: number; bench: number; deadlift: number }>
        updateRM(rm)
        return `1RM mis à jour : ${JSON.stringify(rm)}`
      }
      case 'reschedule_session': {
        const { sessionId, newDate, reason } = toolInput as { sessionId: string; newDate: string; reason?: string }
        logSession({ sessionId, date: newDate, notes: reason ?? 'Reporté', rpe: null })
        return `Session ${sessionId} reportée au ${newDate}`
      }
      default:
        return `Outil inconnu: ${toolName}`
    }
  }, [addPR, toggleSession, updateRM, logSession])

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    abortRef.current = new AbortController()
    setIsLoading(true)
    setStreamingContent('')

    const userMsg: Message = { role: 'user', content: userText, timestamp: Date.now() }
    await appendMessage(userMsg)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }))

      // Agentic loop: keep calling until no more tool_use blocks
      let continueLoop = true
      let assistantText = ''
      const toolCallsMade: ToolCall[] = []

      while (continueLoop) {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: buildSystemPrompt(state),
          tools: AGENT_TOOLS,
          messages: history,
        })

        let hasToolUse = false

        for (const block of response.content) {
          if (block.type === 'text') {
            assistantText += block.text
            setStreamingContent(assistantText)
          } else if (block.type === 'tool_use') {
            hasToolUse = true
            const toolResult = await executeTool(block.name, block.input as Record<string, unknown>)

            toolCallsMade.push({
              name: block.name,
              input: block.input as Record<string, unknown>,
              result: toolResult
            })

            // Add assistant + tool result to history for next loop iteration
            history.push({ role: 'assistant', content: response.content })
            history.push({
              role: 'user',
              content: [{
                type: 'tool_result',
                tool_use_id: block.id,
                content: toolResult
              }]
            })
          }
        }

        if (!hasToolUse || response.stop_reason === 'end_turn') {
          continueLoop = false
        }
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        toolCalls: toolCallsMade.length > 0 ? toolCallsMade : undefined
      }
      await appendMessage(assistantMsg)

    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Agent error:', err)
      }
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }, [isLoading, messages, state, appendMessage, executeTool])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
    setStreamingContent('')
  }, [])

  return { messages, sendMessage, isLoading, streamingContent, abort, clearHistory }
}
```

---

### Step 4: Design the Database Layer

Use a **multi-tier strategy** based on access pattern and data type.

#### Tier 1 — App State (IndexedDB via idb-keyval)
Already exists in most React/PWA apps. Stores structured JSON (user profile, progress, settings). Not for AI-specific data.

```typescript
// Existing pattern — no changes needed
import { get, set } from 'idb-keyval'
await set('candito_state', state)
```

#### Tier 2 — Conversation History (IndexedDB, custom store)
Separate store from app state. Enables long-term memory without polluting the main state tree.

```typescript
// hooks/useConversationDB.ts
import { openDB, type IDBPDatabase } from 'idb'
import type { Message } from './useAgent'

const DB_NAME = 'agent-conversations'
const DB_VERSION = 1

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('by_timestamp', 'timestamp')
        store.createIndex('by_session', 'sessionId')
      }
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'id' })
      }
    }
  })
}

export function useConversationDB() {
  const appendMessage = useCallback(async (msg: Message) => {
    const db = await getDB()
    await db.add('messages', {
      ...msg,
      sessionId: getCurrentSessionId(),   // group messages by conversation session
    })
  }, [])

  const messages = /* load from IDB with React state */ []

  const clearHistory = useCallback(async () => {
    const db = await getDB()
    await db.clear('messages')
  }, [])

  return { messages, appendMessage, clearHistory }
}
```

**Schema design for messages:**
```
messages store:
  id          : autoIncrement (primary key)
  sessionId   : string        (groups a conversation session)
  role        : 'user' | 'assistant'
  content     : string
  timestamp   : number        (Date.now())
  toolCalls   : JSON | null   (tool calls made in this turn)

sessions store:
  id          : string        (uuid)
  startedAt   : number
  label       : string        (auto-generated from first user message)
```

#### Tier 3 — Knowledge Base / RAG (Vector + Keyword)
For embedding and retrieving heterogeneous sources (PDF, web, YouTube). Use only when you need semantic search over external documents.

**Option A — Local (no backend, WASM):**
```typescript
// Using transformers.js for in-browser embeddings
import { pipeline } from '@xenova/transformers'

const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

async function embedText(text: string): Promise<number[]> {
  const output = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// Store in IndexedDB with HNSW index (via hnswlib-wasm or usearch-wasm)
```

**Option B — Serverless backend (recommended for 300+ sources):**
```typescript
// Backend: Vercel/Netlify function + Supabase pgvector
// Table schema (SQL):
/*
CREATE TABLE knowledge_chunks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url  TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'web', 'youtube')),
  title       TEXT,
  content     TEXT NOT NULL,
  embedding   vector(384),        -- dimension matches your embedding model
  chunk_index INTEGER,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Also enable full-text search
CREATE INDEX ON knowledge_chunks USING gin(to_tsvector('french', content));
*/

// Hybrid search function (vector + keyword)
async function hybridSearch(query: string, topK = 5): Promise<Chunk[]> {
  const queryEmbedding = await embedText(query)
  const { data } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: queryEmbedding,
    match_count: topK,
    vector_weight: 0.7,   // tune based on source diversity
    keyword_weight: 0.3
  })
  return data
}
```

#### Tier 4 — Source Ingestion Pipeline
Each source type requires a dedicated ingestion step. Run offline or via a background job.

```typescript
// ingestion/pipeline.ts

// PDF: extract text by page, chunk by ~512 tokens with overlap
async function ingestPDF(buffer: ArrayBuffer, sourceUrl: string) {
  const pdf = await pdfjsLib.getDocument(buffer).promise
  const chunks: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const text = await page.getTextContent()
    const pageText = text.items.map((item: any) => item.str).join(' ')
    chunks.push(...chunkText(pageText, 512, 64))  // 512 tokens, 64 overlap
  }
  return embedAndStore(chunks, sourceUrl, 'pdf')
}

// Web: use a readability extractor, strip nav/footer/ads
async function ingestWebPage(url: string) {
  const html = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`).then(r => r.text())
  const { content, title } = extractReadableContent(html)  // mozilla/readability
  const chunks = chunkText(content, 512, 64)
  return embedAndStore(chunks, url, 'web', { title })
}

// YouTube: use youtube-transcript or whisper for transcription
async function ingestYouTube(videoId: string) {
  const transcript = await fetchYouTubeTranscript(videoId)  // youtube-transcript npm
  const fullText = transcript.map(t => t.text).join(' ')
  const chunks = chunkText(fullText, 512, 64)
  return embedAndStore(chunks, `https://youtu.be/${videoId}`, 'youtube')
}

// Chunking utility: split by tokens with sliding window overlap
function chunkText(text: string, maxTokens: number, overlapTokens: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  let start = 0
  while (start < words.length) {
    const end = Math.min(start + maxTokens, words.length)
    chunks.push(words.slice(start, end).join(' '))
    start += maxTokens - overlapTokens
  }
  return chunks.filter(c => c.trim().length > 50)
}
```

---

### Step 5: Inject Retrieved Knowledge into the Agent

When the user sends a message, retrieve relevant chunks and append them to the system prompt:

```typescript
async function buildEnrichedSystemPrompt(
  state: CanditoState,
  userMessage: string
): Promise<string> {
  const base = buildSystemPrompt(state)

  // Only do RAG if knowledge base is configured
  if (!hasKnowledgeBase()) return base

  const chunks = await hybridSearch(userMessage, 5)
  if (chunks.length === 0) return base

  const context = chunks
    .map(c => `[${c.source_type.toUpperCase()} — ${c.title ?? c.source_url}]\n${c.content}`)
    .join('\n\n---\n\n')

  return `${base}

## Base de connaissances (extraits pertinents)
Utilise ces extraits pour informer ta réponse si pertinent. Ne les cite pas directement.

${context}`
}
```

---

### Step 6: Secure the API Key

**For personal/local use — Vite env var:**
```bash
# .env.local (never commit)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

```typescript
// Acceptable for personal PWA
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
})
```

**For shared/production — Serverless proxy:**
```typescript
// api/chat.ts (Vercel/Netlify function)
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()  // uses ANTHROPIC_API_KEY from server env

export default async function handler(req: Request) {
  const { messages, systemPrompt, tools } = await req.json()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  })

  return Response.json(response)
}
```

The client never sees the API key. All requests go through `/api/chat`.

---

## Examples

### Example 1: PR Recording via Natural Language

```
User:  "J'ai claqué 147.5kg au squat ce matin, c'est un nouveau PR !"
Agent: [calls add_pr({ lift: "squat", weight: 147.5, reps: 1 })]
       "Nouveau PR squat enregistré : 147.5 kg ! Tu dépasses ton ancien record de 7.5 kg."
```

### Example 2: Session Rescheduling

```
User:  "Je peux pas m'entraîner aujourd'hui, je déplace ma séance à jeudi"
Agent: [calls reschedule_session({ sessionId: "s3_lun", newDate: "2026-04-24" })]
       "Noté. Ta séance du lundi est reportée à jeudi 24 avril."
```

### Example 3: Multi-tool Turn

```
User:  "J'ai fini ma séance et j'ai fait 102.5 au bench, PR !"
Agent: [calls complete_session({ sessionId: "s3_lun" })]
       [calls add_pr({ lift: "bench", weight: 102.5, reps: 1 })]
       "Séance validée et PR bench enregistré : 102.5 kg. Belle progression !"
```

### Example 4: Knowledge Retrieval (with RAG)

```
User:  "Comment optimiser ma récupération entre les séances ?"
Agent: [retrieves 3 chunks from knowledge base about recovery]
       "Basé sur les protocoles que tu as chargés : priorité au sommeil 8h+,
        protéines dans l'heure post-séance, et évite les entraînements à haute
        intensité consécutifs sur les mêmes groupes musculaires."
```

### Example 5: Database Schema Quick Reference

```sql
-- Minimal schema for a production AI agent app (PostgreSQL + pgvector)

-- Conversation history
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  started_at  TIMESTAMPTZ DEFAULT now(),
  label       TEXT
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  tool_calls      JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Knowledge base
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url  TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'web', 'youtube')),
  title       TEXT,
  content     TEXT NOT NULL,
  embedding   vector(384),
  chunk_index INTEGER,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX ON knowledge_chunks USING gin(to_tsvector('french', content));

-- Tool call audit log (optional but recommended)
CREATE TABLE tool_calls (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID REFERENCES messages(id),
  tool_name       TEXT NOT NULL,
  tool_input      JSONB NOT NULL,
  tool_result     TEXT,
  executed_at     TIMESTAMPTZ DEFAULT now()
);
```

---

## Best Practices

- ✅ Always inject fresh app state into the system prompt at call time — never cache it
- ✅ Define tools with minimal surface area: only expose what the agent genuinely needs
- ✅ Keep tool descriptions precise — ambiguous descriptions cause wrong tool selection
- ✅ Use an agentic loop (while stop_reason !== 'end_turn') for multi-tool turns
- ✅ Log every tool call to an audit table or store — essential for debugging agent behavior
- ✅ Chunk text with overlap (10-15% of chunk size) to avoid splitting semantic units
- ✅ Use hybrid search (vector + keyword) — pure vector search degrades on specific terms (names, numbers, codes)
- ✅ Keep conversation history bounded: send last N messages, not full history, to stay within context limits
- ✅ For PWA/client-only apps, use IndexedDB (idb library) for conversation persistence
- ❌ Don't expose tools that delete data without a two-step confirmation in the conversation
- ❌ Don't store raw API keys in client-side code for shared/production apps
- ❌ Don't chunk text at fixed character boundaries — split at sentence or paragraph boundaries
- ❌ Don't send the entire knowledge base as context — retrieve and inject only relevant chunks
- ❌ Don't assume one tool call per turn — always implement the agentic loop
- ❌ Don't mix app state and conversation history in the same store

---

## Limitations

- This skill does not cover streaming responses (SSE/ReadableStream) — the agentic loop pattern shown is non-streaming
- The in-browser embedding approach (Option A, Tier 3) is CPU-intensive and unsuitable for large knowledge bases (>1000 chunks)
- YouTube ingestion requires either the `youtube-transcript` npm package (works only for videos with captions) or Whisper API for transcription (paid, async)
- The proxy pattern for API key security requires a serverless hosting environment (Vercel, Netlify, Cloudflare Workers)
- Tool execution is synchronous in the example — add optimistic UI updates and error rollback for production use
- Stop and ask for clarification if the required app state shape, tool capabilities, or hosting environment is unclear

---

## Security & Safety Notes

- Never expose `ANTHROPIC_API_KEY` in client-side bundles for apps with multiple users
- Validate all tool inputs server-side (or in the executor function) before executing — do not trust the LLM's parameter values blindly
- Implement rate limiting on the `/api/chat` proxy endpoint to prevent abuse
- The `dangerouslyAllowBrowser: true` flag is acceptable ONLY for personal/local apps where you control who accesses the key
- Always audit tool calls: log `tool_name`, `tool_input`, and `tool_result` with timestamps

---

## Common Pitfalls

- **Problem:** Agent calls a tool but the UI doesn't update
  **Solution:** Tool executor functions must call the real state mutation (React context, Zustand, etc.), not just return a string. The string return is only for the LLM's `tool_result` block.

- **Problem:** Agent hallucinates tool parameter values (invents weights, dates, session IDs)
  **Solution:** Add enum constraints and explicit format descriptions in the tool `input_schema`. Include a rule in the system prompt: "If you are not certain of a value, ask the user before calling a tool."

- **Problem:** Conversation history grows too large, hitting context limits
  **Solution:** Truncate history to the last 20 messages before sending. Optionally summarize older turns with a separate Claude call and prepend the summary.

- **Problem:** RAG retrieves irrelevant chunks, polluting the context
  **Solution:** Add a similarity score threshold (e.g., cosine similarity > 0.75). If no chunks pass the threshold, skip RAG injection entirely.

- **Problem:** Embedding model dimensions don't match the database column
  **Solution:** Fix the `vector(N)` column dimension at schema creation time. Changing it later requires re-embedding all chunks.

- **Problem:** Tool loop runs indefinitely
  **Solution:** Add a hard limit on loop iterations (e.g., `maxIterations = 5`) and break with an error message if exceeded.

---

## Related Skills

- `@claude-api` — For Claude API integration, prompt caching, and model selection details
- `@writing-plans` — Use before implementing the agent to design the tool surface and state contract
- `@systematic-debugging` — When agent tool calls produce unexpected results or the loop misbehaves
