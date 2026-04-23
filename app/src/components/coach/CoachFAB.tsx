import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CoachChat } from './CoachChat'
import { cn } from '../../lib/utils'

export function CoachFAB() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              // safe-area-aware : nav = h-20 (80px) + inset-bottom + 12px gap
              "fixed right-4 z-50",
              "size-14 rounded-full bg-accent shadow-xl shadow-accent/30",
              "flex items-center justify-center text-background",
              "active:scale-95 transition-transform duration-100"
            )}
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            // h-dvh : s'ajuste dynamiquement quand le clavier mobile apparaît
            className="fixed inset-x-0 top-0 z-[100] h-dvh"
          >
            <CoachChat onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
