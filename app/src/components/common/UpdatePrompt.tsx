import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCcw } from 'lucide-react'

const VERSION_URL = '/version.json'

export function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await fetch(VERSION_URL + '?t=' + Date.now())
        const data = await res.json()
        return data.version
      } catch (e) {
        return null
      }
    }

    // 1. Détection immédiate de la version au démarrage
    const init = async () => {
      const v = await fetchVersion()
      if (v) {
        console.log("🚀 Candito App Version Loaded:", v)
        setCurrentVersion(v)
      }
    }
    init()

    // 2. Vérification périodique toutes les 10 secondes
    const interval = setInterval(async () => {
      const latestV = await fetchVersion()
      if (latestV && currentVersion && latestV !== currentVersion) {
        console.log("✨ Nouvelle version détectée !", latestV)
        setShow(true)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [currentVersion])

  const handleUpdate = () => {
    // Clear cache and reload
    window.location.reload()
  }

  if (!show) return null

  return (
    <div className={cn(
      "fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md",
      "animate-in fade-in duration-500"
    )}>
      <div className={cn(
        "glass w-full max-w-[320px] p-8 rounded-[32px] border border-white/10 shadow-3xl text-center space-y-6",
        "animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
      )}>
        <div className="mx-auto size-16 rounded-3xl bg-accent/10 flex items-center justify-center text-accent">
          <RefreshCcw size={32} className="animate-spin-slow" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-display text-white italic">Mise à jour</h2>
          <p className="text-muted text-sm leading-relaxed">
            Une nouvelle version du programme est disponible pour ton entraînement.
          </p>
        </div>

        <div className="flex flex-col gap-3">
           <button 
             onClick={handleUpdate}
             className={cn(
               "w-full py-5 bg-accent hover:bg-[#77cc7b] active:scale-95 text-background",
               "text-[12px] font-bold uppercase tracking-widest rounded-pill transition-all",
               "shadow-lg shadow-accent/20"
             )}
           >
             INSTALLER MAINTENANT
           </button>
           
           <button 
             onClick={() => setShow(false)}
             className="text-[10px] text-muted font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
           >
             PLUS TARD
           </button>
        </div>
      </div>
    </div>
  )
}

