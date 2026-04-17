import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { STORAGE_KEYS } from '@/lib/storageKeys'

const VAPID_PUBLIC_KEY = 'BDudDlJbtu4YN-BHT9pkn0cCRUVSD_3BeocMK3mCDcYsE2frcq1C_zh5oG_sNc6ylt7rv7xVwdi-T2iu-Zm69dE'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushNotificationManager() {
  const [status, setStatus] = useState<'idle' | 'prompt' | 'loading' | 'success' | 'unsupported'>('idle')
  const [isVisible, setIsVisible] = useState(false)
  const { state } = useCanditoState()
  const weekId = state.currentWeekId

  useEffect(() => {
    const checkStatus = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      
      if (!sub && Notification.permission !== 'denied') {
        const timer = setTimeout(() => setIsVisible(true), 2000)
        return () => clearTimeout(timer)
      }
    }
    checkStatus()
  }, [])

  // Auto-sync la semaine si l'utilisateur est déjà abonné
  useEffect(() => {
    if (status !== 'unsupported') {
      syncSubscription(weekId)
    }
  }, [weekId])

  const subscribeUser = async (weekId: string) => {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Envoyer l'abonnement au backend avec la semaine actuelle
      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          weekId: weekId
        })
      })

      if (!response.ok) throw new Error('Erreur backend')

      localStorage.setItem(STORAGE_KEYS.NOTIFS_ENABLED, 'true')
      setStatus('success')
      setTimeout(() => setIsVisible(false), 2500)
    } catch (err) {
      console.error('Push subscription failed:', err)
      setStatus('idle')
    }
  }

  // Fonction pour mettre à jour la semaine sans redemander permission
  const syncSubscription = async (weekId: string) => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return

      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, weekId })
      })
    } catch (err) {
      console.error('Failed to sync subscription:', err)
    }
  }

  if (status === 'unsupported' || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="overflow-hidden"
      >
        <div className="glass p-5 rounded-3xl border border-white/5 relative overflow-hidden bg-accent/5">
          {/* Subtle Background decoration */}
          <div className="absolute -top-10 -right-10 size-24 bg-accent/10 blur-2xl rounded-full" />
          
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Bell className="text-accent" size={20} />
            </div>
            
            <div className="flex-1 pr-6">
              <h3 className="text-white font-bold text-[13px] uppercase tracking-wider mb-1">
                Rappels d'entraînement
              </h3>
              <p className="text-muted text-[11px] leading-relaxed mb-4">
                Débloque les notifications pour ne jamais manquer une séance, même application fermée.
              </p>

              <div className="flex">
                <button
                  onClick={() => subscribeUser(weekId)}
                  disabled={status === 'loading'}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer",
                    status === 'success' 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-white text-black hover:bg-accent hover:text-white"
                  )}
                >
                  {status === 'loading' ? 'Activation...' : status === 'success' ? 'Activé ✔' : 'Activer maintenant'}
                </button>
              </div>
            </div>
          </div>
          
          {/* iOS Tiny Footer */}
          {/iPhone|iPad|iPod/.test(navigator.userAgent) && status !== 'success' && (
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[9px] text-muted italic">
              <Cloud size={10} className="text-accent/40" />
              <span>Optimum avec l'app sur l'écran d'accueil</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
