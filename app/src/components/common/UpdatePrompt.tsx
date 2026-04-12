import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCcw } from 'lucide-react'

const VERSION_URL = '/version.json'

export function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)

  useEffect(() => {
    // Variable locale pour éviter les problèmes de closure avec le setInterval
    let activeVersion: string | null = null

    const fetchVersion = async () => {
      try {
        const res = await fetch(VERSION_URL + '?t=' + Date.now(), {
          cache: 'no-store', // Force le navigateur à ignorer le cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        const data = await res.json()
        return data.version
      } catch (e) {
        return null
      }
    }


    const checkUpdate = async () => {
      const latestV = await fetchVersion()
      if (!latestV) return // Si erreur réseau, on ignore ce cycle

      if (!activeVersion) {
        console.log("🚀 Candito App Version Loaded:", latestV)
        activeVersion = latestV
        setCurrentVersion(latestV)
      } else if (latestV !== activeVersion) {
        console.log("✨ Nouvelle version détectée !", latestV)
        setShow(true)
      }
    }

    // 1. Première vérification immédiate
    checkUpdate()

    // 2. Vérification toutes les 10 secondes (ne meurt jamais)
    const interval = setInterval(checkUpdate, 10000)

    // 3. Vérification à la sortie de veille de l'application
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkUpdate()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Dépendance vide : l'effet se lance une seule fois au montage

  const handleUpdate = () => {
    // Force un rechargement complet de l'index.html pour contourner le cache PWA iOS
    window.location.href = window.location.pathname + '?update=' + Date.now()
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
