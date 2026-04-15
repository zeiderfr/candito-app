import { useState, useEffect } from 'react'
import { Smartphone, X } from 'lucide-react'
import { STORAGE_KEYS } from '@/lib/storageKeys'

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isAndroid = () => /android/i.test(navigator.userAgent)
const isStandalone = () =>
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
  window.matchMedia('(display-mode: standalone)').matches

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const ShareIcon = () => (
  <span className="inline-block px-1 py-0.5 bg-white/10 rounded text-[10px] leading-tight mx-0.5 align-text-bottom">⎙</span>
)

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('install_dismissed')) {
      setDismissed(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem('install_dismissed', 'true')
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('install_dismissed', 'true')
    setDismissed(true)
  }

  const shouldShow =
    !isStandalone() &&
    (isIOS() || isAndroid() || !!deferredPrompt) &&
    !dismissed

  if (!shouldShow) return null

  return (
    <div className="glass rounded-xl px-5 py-4 flex items-center gap-4 border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Smartphone size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">Installe l'app</p>
        <p className="text-[11px] text-muted mt-0.5 leading-relaxed block">
          {isIOS()
            ? <>Tape <ShareIcon /> puis <strong className="text-white">"Sur l'écran d'accueil"</strong></>
            : "Pour un accès hors-ligne et les notifications"}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {!isIOS() && deferredPrompt && (
          <button onClick={handleInstall}
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-white transition-colors duration-200 cursor-pointer">
            Installer
          </button>
        )}
        <button onClick={handleDismiss}
          className="text-muted hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Fermer">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
