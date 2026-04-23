import { useState, useCallback, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { get, set } from 'idb-keyval'
import { buildCoachPrompt } from '../lib/coachPrompt'
import { COACH_TOOLS } from '../lib/coachTools'
import { useCandito } from '../context/CanditoContext'
import { STORAGE_KEYS } from '../lib/storageKeys'

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: { name: string; result: string }[]
}

const MAX_HISTORY = 30

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

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

  const executeTool = useCallback((name: string, input: Record<string, unknown>): string => {
    try {
      switch (name) {
        case 'add_pr': {
          const { lift, weight, reps } = input as { lift: 'squat' | 'bench' | 'deadlift'; weight: number; reps: number }
          addPR(lift, weight, reps)
          return `PR enregistré : ${lift} ${weight} kg × ${reps}`
        }
        case 'complete_session': {
          const { sessionId } = input as { sessionId: string }
          toggleSession(sessionId)
          return `Session ${sessionId} complétée`
        }
        case 'update_rm': {
          const rm = input as Partial<{ squat: number; bench: number; deadlift: number }>
          updateRM(rm)
          return `1RM mis à jour : ${JSON.stringify(rm)}`
        }
        case 'reschedule_session': {
          const { sessionId, newDate } = input as { sessionId: string; newDate: string }
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

    try {
      const loopHistory: Anthropic.MessageParam[] = updatedMsgs.map(m => ({
        role: m.role,
        content: m.content,
      }))

      let continueLoop = true
      let assistantText = ''
      const toolCallsMade: { name: string; result: string }[] = []
      let iterations = 0

      while (continueLoop && iterations < 5) {
        iterations++
        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 512,
          system: buildCoachPrompt(state),
          tools: COACH_TOOLS,
          messages: loopHistory,
        })

        let hasToolUse = false

        for (const block of response.content) {
          if (block.type === 'text') {
            assistantText += block.text
          } else if (block.type === 'tool_use') {
            hasToolUse = true
            const result = executeTool(block.name, block.input as Record<string, unknown>)
            toolCallsMade.push({ name: block.name, result })
            loopHistory.push({ role: 'assistant', content: response.content })
            loopHistory.push({
              role: 'user',
              content: [{ type: 'tool_result', tool_use_id: block.id, content: result }],
            })
          }
        }

        if (!hasToolUse || response.stop_reason === 'end_turn' || response.stop_reason === 'max_tokens') {
          continueLoop = false
        }
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
      const errorMsg: CoachMessage = {
        role: 'assistant',
        content: 'Une erreur est survenue. Réessaie dans un moment.',
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
