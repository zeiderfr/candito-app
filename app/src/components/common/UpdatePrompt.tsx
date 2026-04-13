import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCcw } from 'lucide-react'

const VERSION_URL = '/version.json'

export function UpdatePrompt() {
  const [show, setShow] = useState(false)

  const triggerNotification = async () => {
    if (document.visibilityState === 'visible') return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return
    reg.showNotification('Candito — Mise à jour disponible', {
      body: 'Une nouvelle version du programme est prête.',
      icon: '/apple-touch-icon.png',
      tag: 'candito-update',
    })
  }

  useEffect(() => {
    // En mode développement, pas de vérification de mise à jour
    // (la version injectée par Vite ne correspondra jamais à version.json)
    if (import.meta.env.DEV) return

    const fetchVersion = async () => {
      try {
        const res = await fetch(VERSION_URL + '?t=' + Date.now(), {
          cache: 'no-store',
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

    let interval: ReturnType<typeof setInterval>

    const checkUpdate = async () => {
      const latestV = await fetchVersion()
      if (!latestV) return

      // __APP_VERSION__ injected by Vite at build time
      if (latestV !== __APP_VERSION__) {
        setShow(true)
        if (interval) clearInterval(interval)
        triggerNotification()
      }
    }

    // 1. Initialisation + Polling
    interval = setInterval(checkUpdate, 60000)
    checkUpdate()

    // 2. Événements de visibilité (Resumption)
    const handleVisible = () => {
      if (document.visibilityState === 'visible') checkUpdate()
    }
    document.addEventListener('visibilitychange', handleVisible)

    // 3. Liaison avec le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) return
        
        // Détecte si un nouveau SW est en attente
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShow(true)
              }
            })
          }
        })
      })
    }

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [])

  const handleUpdate = () => {
    // Force reload with cache bypass
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
