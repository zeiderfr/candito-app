import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  onUndo?: () => void
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(({ message, type = 'info', onUndo, duration = 4000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, onUndo, duration }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-6 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto flex items-center gap-4 px-4 py-3 rounded-2xl glass shadow-2xl min-w-[300px] max-w-full",
                "border border-white/10"
              )}
            >
              <div className="flex-1">
                <p className="text-xs font-bold text-white tracking-wide">{toast.message}</p>
              </div>

              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.()
                    removeToast(toast.id)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest hover:bg-accent/30 transition-colors"
                >
                  <Undo2 size={12} />
                  Annuler
                </button>
              )}

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-muted hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToasts = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToasts must be used within ToastProvider')
  return context
}
