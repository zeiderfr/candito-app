import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, X } from 'lucide-react'
import { useNavigation } from '@/context/NavigationContext'
import { PROGRAM_DATA } from '@/data/program'

function findSessionFocus(sessionId: string): string {
  for (const week of Object.values(PROGRAM_DATA)) {
    const session = week.sessions.find(s => s.id === sessionId)
    if (session) return session.focus
  }
  return 'Séance en cours'
}

export function ResumeBanner() {
  const navigate = useNavigation()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const key = Object.keys(localStorage).find(k => k.startsWith('candito_session_'))
    if (!key) return
    const id = key.replace('candito_session_', '')
    setSessionId(id)
    setVisible(true)
  }, [])

  const handleResume = () => {
    setVisible(false)
    navigate('programme')
  }

  const focus = sessionId ? findSessionFocus(sessionId) : 'Séance en cours'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
            <PlayCircle size={16} className="text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{focus}</p>
              <p className="text-[10px] text-muted">Séance interrompue — reprendre ?</p>
            </div>
            <button
              onClick={handleResume}
              className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors cursor-pointer shrink-0 px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20"
            >
              Reprendre
            </button>
            <button
              onClick={() => setVisible(false)}
              className="text-muted/40 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Ignorer"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
