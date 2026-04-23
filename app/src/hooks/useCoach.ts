import { useState, useCallback, useEffect } from 'react'
import { get, set } from 'idb-keyval'
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

  const executeTool = useCallback((name: string, input: any): string => {
    try {
      switch (name) {
        case 'add_pr': {
          const { lift, weight, reps } = input
          addPR(lift, weight, reps)
          return `PR enregistré : ${lift} ${weight} kg × ${reps}`
        }
        case 'complete_session': {
          const { sessionId } = input
          toggleSession(sessionId)
          return `Session ${sessionId} complétée`
        }
        case 'update_rm': {
          const rm = input
          updateRM(rm)
          return `1RM mis à jour : ${JSON.stringify(rm)}`
        }
        case 'reschedule_session': {
          const { sessionId, newDate } = input
          return `Report noté : ${sessionId} → ${newDate}`
        }
        default:
          return 'Outil inconnu'
      }
    } catch (err: any) {
      return `Erreur : ${err.message}`
    }
  }, [addPR, toggleSession, updateRM])

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    setIsLoading(true)
    const userMsg: CoachMessage = { role: 'user', content: userText, timestamp: Date.now() }
    const updatedMsgs = [...messages, userMsg]
    setMessages(updatedMsgs)

    try {
      // Proxy call to Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages, // On envoie l'historique (sans le dernier message qui est userText)
          userText: userText,
          athleteProfile: state.athlete
        })
      }).then(r => r.json())

      if (response.error) throw new Error(response.error)

      let assistantText = response.text
      const toolCallsMade: { name: string; result: string }[] = []

      // Handle function calls if any
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          const result = executeTool(fc.name, fc.args)
          toolCallsMade.push({ name: fc.name, result })
        }
        // Pour Gemini via proxy, on s'arrête ici pour simplifier (pas de multi-tour complexe pour l'instant)
        // L'IA aura déjà généré son texte de réponse parallèlement aux calls.
      }

      const assistantMsg: CoachMessage = {
        role: 'assistant',
        content: assistantText || '…',
        timestamp: Date.now(),
        toolCalls: toolCallsMade.length > 0 ? toolCallsMade : undefined,
      }

      await persistHistory([...updatedMsgs, assistantMsg])
    } catch (err: any) {
      console.error('Coach error:', err)
      const errorMsg: CoachMessage = {
        role: 'assistant',
        content: `Erreur : ${err.message}`,
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
