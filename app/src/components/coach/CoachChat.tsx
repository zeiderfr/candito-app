import { useState, useRef, useEffect } from 'react'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { useCoach } from '../../hooks/useCoach'
import type { CoachMessage } from '../../hooks/useCoach'
import { cn } from '../../lib/utils'

const TOOL_LABELS: Record<string, string> = {
  add_pr: '✓ PR enregistré',
  complete_session: '✓ Séance validée',
  update_rm: '✓ 1RM mis à jour',
  reschedule_session: '↻ Report confirmé',
}

function ToolCallBadge({ name }: { name: string }) {
  return (
    <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5 mt-1 self-start">
      {TOOL_LABELS[name] ?? `✓ ${name}`}
    </span>
  )
}

function MessageBubble({ message }: { message: CoachMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] px-4 py-2.5 text-sm",
          isUser
            ? "bg-accent text-background rounded-2xl rounded-tr-sm"
            : "bg-white/5 border border-white/10 text-white rounded-2xl rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
      {!isUser && message.toolCalls?.map((tc, i) => (
        <ToolCallBadge key={i} name={tc.name} />
      ))}
    </div>
  )
}

export function CoachChat({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, isLoading, clearHistory } = useCoach()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 border-b border-white/5"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: '1rem' }}>
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-muted active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display italic text-xl text-white flex-1">Coach Candito</h2>
        <button
          onClick={clearHistory}
          className="text-[10px] uppercase tracking-widest text-muted hover:text-white transition-colors"
        >
          Effacer
        </button>
      </div>

      {/* Messages — scrollbar masquée */}
      <div className={cn(
        "flex-1 overflow-y-auto px-4 py-6 space-y-4",
        "[&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      )}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center gap-4 pt-12 text-center px-8">
            <div className="size-16 rounded-3xl bg-accent/10 flex items-center justify-center text-accent/40">
              <MessageCircle size={32} />
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Comment s'est passé ton entraînement ?<br />
              Pose-moi une question sur tes PRs, tes séances ou tes douleurs.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm w-fit">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="size-1.5 rounded-full bg-accent/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input — collé en bas, visible au-dessus du clavier grâce à h-dvh */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-background">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 pl-4 focus-within:border-accent/30 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            onFocus={scrollToBottom}
            placeholder="Écris ton message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-muted py-2"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="size-10 rounded-xl bg-accent flex items-center justify-center text-background disabled:opacity-20 disabled:grayscale transition-all active:scale-90 shadow-lg shadow-accent/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
