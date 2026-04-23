import { useState, useCallback, useEffect } from 'react'
import { GoogleGenerativeAI, FunctionCallingMode } from '@google/generative-ai'
import { get, set } from 'idb-keyval'
import { buildCoachPrompt } from '../lib/coachPrompt'
import { COACH_FUNCTION_DECLARATIONS } from '../lib/coachTools'
import { useCandito } from '../context/CanditoContext'
import { STORAGE_KEYS } from '../lib/storageKeys'

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: { name: string; result: string }[]
}

const MAX_HISTORY = 30

export function useCoach() {
  const { state, addPR, toggleSession, updateRM } = useCandito()
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    get(STORAGE_KEYS.COACH_HISTORY).then((saved: CoachMessage[] | undefined) => {
      if (saved?.length) setMessages(saved)
    })
  }, [])

  const persistHistory = useCallback(async (msgs: CoachMessage[]) => {
    const trimmed = msgs.slice(-MAX_HISTORY)
    await set(STORAGE_KEYS.COACH_HISTORY, trimmed)
    setMessages(trimmed)
  }, [])

  const executeTool = useCallback((name: string, args: Record<string, unknown>): string => {
    try {
      switch (name) {
        case 'add_pr': {
          const { lift, weight, reps } = args as { lift: 'squat' | 'bench' | 'deadlift'; weight: number; reps: number }
          addPR(lift, weight, reps)
          return `PR enregistré : ${lift} ${weight} kg × ${reps}`
        }
        case 'complete_session': {
          const { sessionId } = args as { sessionId: string }
          toggleSession(sessionId)
          return `Session ${sessionId} complétée`
        }
        case 'update_rm': {
          const rm = args as Partial<{ squat: number; bench: number; deadlift: number }>
          updateRM(rm)
          return `1RM mis à jour : ${JSON.stringify(rm)}`
        }
        case 'reschedule_session': {
          const { sessionId, newDate } = args as { sessionId: string; newDate: string }
          return `Report noté : ${sessionId} → ${newDate}`
        }
        default:
          return 'Outil inconnu'
      }
    } catch (err: unknown) {
      return `Erreur : ${err instanceof Error ? err.message : 'inconnue'}`
    }
  }, [addPR, toggleSession, updateRM])

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    setIsLoading(true)
    const userMsg: CoachMessage = { role: 'user', content: userText, timestamp: Date.now() }
    const updatedMsgs = [...messages, userMsg]
    setMessages(updatedMsgs)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      const errMsg: CoachMessage = {
        role: 'assistant',
        content: 'Clé API Gemini manquante — vérifie le fichier .env.local et redémarre le serveur.',
        timestamp: Date.now(),
      }
      await persistHistory([...updatedMsgs, errMsg])
      setIsLoading(false)
      return
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: buildCoachPrompt(state),
        tools: [{ functionDeclarations: COACH_FUNCTION_DECLARATIONS }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
      })

      // Convertir l'historique stocké en format Gemini (exclure le dernier message user)
      const geminiHistory = updatedMsgs.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const chat = model.startChat({ history: geminiHistory })
      let response = await chat.sendMessage(userText)

      let assistantText = ''
      const toolCallsMade: { name: string; result: string }[] = []
      let iterations = 0

      // Agentic loop : tant que Gemini veut appeler des fonctions
      while (iterations < 5) {
        iterations++
        const functionCalls = response.response.functionCalls()

        if (!functionCalls || functionCalls.length === 0) {
          assistantText = response.response.text()
          break
        }

        // Exécuter tous les tools de ce tour et renvoyer les résultats
        const functionResponses = functionCalls.map(fc => {
          const result = executeTool(fc.name, fc.args as Record<string, unknown>)
          toolCallsMade.push({ name: fc.name, result })
          return {
            functionResponse: {
              name: fc.name,
              response: { result },
            },
          }
        })

        response = await chat.sendMessage(functionResponses)
      }

      const assistantMsg: CoachMessage = {
        role: 'assistant',
        content: assistantText || '…',
        timestamp: Date.now(),
        toolCalls: toolCallsMade.length > 0 ? toolCallsMade : undefined,
      }

      await persistHistory([...updatedMsgs, assistantMsg])
    } catch (err) {
      console.error('Coach error:', err)
      const detail = err instanceof Error ? err.message : String(err)
      const errorMsg: CoachMessage = {
        role: 'assistant',
        content: `Erreur : ${detail}`,
        timestamp: Date.now(),
      }
      await persistHistory([...updatedMsgs, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, state, executeTool, persistHistory])

  const clearHistory = useCallback(async () => {
    await set(STORAGE_KEYS.COACH_HISTORY, [])
    setMessages([])
  }, [])

  return { messages, sendMessage, isLoading, clearHistory }
}
