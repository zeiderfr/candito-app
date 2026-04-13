import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrainingNotifications } from '@/hooks/useTrainingNotifications'
import { useCanditoState } from '@/hooks/useCanditoState'

export function TrainingNotificationBanner() {
  const { state } = useCanditoState()
  const { 
    permission, 
    isDismissed, 
    requestPermission, 
    dismiss, 
    isSupported 
  } = useTrainingNotifications(state.currentWeekId)

  if (!isSupported || isDismissed || permission !== 'default') return null

  return (
    <div className={cn(
      "glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Bell size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">Actives les rappels</p>
        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
          Sois averti le matin de tes jours d'entraînement.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => void requestPermission()}
          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Activer
        </button>
        <button
          onClick={dismiss}
          className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
