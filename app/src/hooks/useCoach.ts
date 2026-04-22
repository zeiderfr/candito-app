import { useState, useCallback, useEffect } from 'react'
import { get, set } from 'idb-keyval'
import { useCandito } from '../context/CanditoContext'
import { STORAGE_KEYS } from '../lib/storageKeys'

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string | any[]
  timestamp: number
  toolCalls?: { name: string; result: string }[]
}

const MAX_HISTORY = 30

export function useCoach() {
  const { state, addPR, toggleSession, updateRM } = useCandito()
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger l'historique au montage
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

  const executeTool = useCallback((name: string, input: Record<string, any>): string => {
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
      return `Erreur d'exécution de l'outil : ${err.message}. Demande à l'utilisateur de préciser.`
    }
  }, [addPR, toggleSession, updateRM])

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    setIsLoading(true)
    const userMsg: CoachMessage = { role: 'user', content: userText, timestamp: Date.now() }
    const updatedMsgs = [...messages, userMsg]
    setMessages(updatedMsgs)

    try {
      let continueLoop = true
      let assistantText = ''
      const toolCallsMade: { name: string; result: string }[] = []
      const loopHistory: any[] = updatedMsgs.map(m => ({ role: m.role, content: m.content }))
      let iterations = 0

      while (continueLoop && iterations < 5) {
        iterations++
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: loopHistory, 
            athleteProfile: state.athlete 
          })
        }).then(r => r.json())

        if (response.error) throw new Error(response.error)

        let hasToolUse = false
        
        for (const block of response.content) {
          if (block.type === 'text') {
            assistantText += block.text
          } else if (block.type === 'tool_use') {
            hasToolUse = true
            const result = executeTool(block.name, block.input)
            toolCallsMade.push({ name: block.name, result })

            loopHistory.push({ role: 'assistant', content: response.content })
            loopHistory.push({
              role: 'user',
              content: [{ type: 'tool_result', tool_use_id: block.id, content: result }]
            })
          }
        }

        if (!hasToolUse || response.stop_reason === 'end_turn') {
          continueLoop = false
        }
      }

      const assistantMsg: CoachMessage = {
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        toolCalls: toolCallsMade.length > 0 ? toolCallsMade : undefined,
      } as CoachMessage

      await persistHistory([...updatedMsgs, assistantMsg])
    } catch (err: any) {
      console.error('Coach error:', err)
      const errorMsg: CoachMessage = {
        role: 'assistant',
        content: "Désolé, j'ai rencontré une erreur technique. Peux-tu réessayer ?",
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
