import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCcw, X } from 'lucide-react'

const VERSION_URL = '/version.json'
const CHECK_INTERVAL = 60000 // 1 minute

export function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)

  useEffect(() => {
    // 1. Charger la version initiale au montage
    const fetchInitial = async () => {
      try {
        const res = await fetch(VERSION_URL + '?t=' + Date.now())
        const data = await res.json()
        setCurrentVersion(data.version)
      } catch (e) {
        console.error("UpdatePrompt: Initial fetch failed", e)
      }
    }

    fetchInitial()

    // 2. Polling interval pour détecter les nouvelles versions
    const interval = setInterval(async () => {
      try {
        const res = await fetch(VERSION_URL + '?t=' + Date.now())
        const data = await res.json()
        
        if (currentVersion && data.version !== currentVersion) {
          setShow(true)
        }
      } catch (e) {
        console.warn("UpdatePrompt: Check failed (server might be down/rebuilding)")
      }
    }, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [currentVersion])

  const handleUpdate = () => {
    // Force reload with cache bypass
    window.location.reload()
  }

  if (!show) return null

  return (
    <div className={cn(
      "fixed top-6 left-4 right-4 z-[100]",
      "animate-in fade-in slide-in-from-top-6 duration-700"
    )}>
      <div className={cn(
        "glass p-4 rounded-2xl border border-white/10 shadow-2xl",
        "flex items-center gap-4 bg-surface/90 backdrop-blur-xl"
      )}>
        <div className="size-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <RefreshCcw size={18} className="animate-spin-slow" />
        </div>
        
        <div className="flex-1 space-y-0.5">
          <p className="text-[12px] font-bold text-white uppercase tracking-wider">
            Mise à jour disponible
          </p>
          <p className="text-[10px] text-muted leading-tight">
            De nouvelles fonctionnalités et corrections sont prêtes.
          </p>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={handleUpdate}
             className={cn(
               "px-4 py-2 bg-accent hover:bg-[#77cc7b] text-background",
               "text-[10px] font-bold uppercase tracking-widest rounded-pill transition-all"
             )}
           >
             ACTUALISER
           </button>
           
           <button 
             onClick={() => setShow(false)}
             className="p-2 text-muted hover:text-white transition-colors"
           >
             <X size={16} />
           </button>
        </div>
      </div>
    </div>
  )
}
