import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STORAGE_KEYS } from '@/lib/storageKeys'

const DISMISSED_KEY = STORAGE_KEYS.NOTIF_DISMISSED

export function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Guard : Notification API non supportée (iOS < 16.4, vieux navigateurs)
    if (!('Notification' in window)) {
      setDismissed(true)
      return
    }
    setPermission(Notification.permission)
    if (localStorage.getItem(DISMISSED_KEY)) setDismissed(true)
  }, [])

  // Ne pas rendre si : non supporté, déjà décidé (granted/denied), ou dismissed
  if (dismissed || permission !== 'default') return null

  const handleActivate = async () => {
    // requestPermission() DOIT être appelé dans un onClick (geste utilisateur iOS)
    const result = await Notification.requestPermission()
    setPermission(result)
    setDismissed(true)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className={cn(
      "glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Bell size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">Notifications de mise à jour</p>
        <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
          Reçois une alerte dès qu'une nouvelle version est disponible.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleActivate}
          className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Activer
        </button>
        <button
          onClick={handleDismiss}
          className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
