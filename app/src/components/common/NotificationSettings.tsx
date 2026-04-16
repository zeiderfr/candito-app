/**
 * NotificationSettings — Panneau de gestion des notifications dans les Paramètres du Profil.
 *
 * Deux types de rappels :
 * 1. Rappels locaux (Notification API) — quand l'app est ouverte le jour d'entraînement
 *    → soft-disable via localStorage (la permission navigateur ne peut pas être révoquée)
 * 2. Push persistants (Web Push / Service Worker) — même app fermée, via Cloudflare CRON
 *    → désabonnement réel via pushManager.unsubscribe()
 */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Bell, BellOff, CloudLightning, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'
import { STORAGE_KEYS } from '@/lib/storageKeys'

const VAPID_PUBLIC_KEY = 'BDudDlJbtu4YN-BHT9pkn0cCRUVSD_3BeocMK3mCDcYsE2frcq1C_zh5oG_sNc6ylt7rv7xVwdi-T2iu-Zm69dE'

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

type RowStatus = 'checking' | 'off' | 'on' | 'loading' | 'denied' | 'unsupported'
type ConfirmTarget = 'local' | 'push'

export function NotificationSettings() {
  const { state } = useCanditoState()
  const [status, setStatus]   = useState<RowStatus>('checking')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }

    const checkStatus = async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      
      if (Notification.permission === 'denied') {
        setStatus('denied')
      } else if (sub && localStorage.getItem(STORAGE_KEYS.NOTIFS_ENABLED) === 'true') {
        setStatus('on')
      } else {
        setStatus('off')
      }
    }

    checkStatus()
  }, [])

  // ── Activer les rappels (Unifié) ───────────────────────────────────
  const enableNotifications = async () => {
    setStatus('loading')
    try {
      // 1. Demander permission
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setStatus('denied')
        return
      }

      // 2. Inscription Push
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // 3. Sync Serveur
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, weekId: state.currentWeekId }),
      })

      // 4. Source de vérité locale
      localStorage.setItem(STORAGE_KEYS.NOTIFS_ENABLED, 'true')
      setStatus('on')
    } catch (err) {
      console.error('Failed to enable notifications:', err)
      setStatus('off')
    }
  }

  // ── Désactiver les rappels (Unifié) ─────────────────────────────────
  const disableNotifications = async () => {
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/push-unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
      }
      localStorage.setItem(STORAGE_KEYS.NOTIFS_ENABLED, 'false')
      setStatus('off')
    } catch (err) {
      console.error('Failed to disable notifications:', err)
      setStatus('off')
    }
    setShowConfirm(false)
  }

  return (
    <div className="space-y-3">
      <NotifRow
        icon={<CloudLightning size={18} />}
        title="Rappels d'entraînement"
        description="Push à 8h même app fermée + alertes intelligentes"
        status={status}
        onActivate={enableNotifications}
        onDeactivate={() => setShowConfirm(true)}
        isIOS={/iPhone|iPad|iPod/.test(navigator.userAgent)}
      />

      {/* Dialog de confirmation désactivation */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmDialog
            onConfirm={disableNotifications}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Dialog de confirmation ─────────────────────────────────────────────
function ConfirmDialog({
  onConfirm, onCancel
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const label = "les rappels d'entraînement"

  // On utilise un Portal pour détacher le modal du flux DOM local
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
      {/* Backdrop — Plus sombre pour bien isoler le modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Card — Fond solide pour éviter la transparence confuse */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-sm bg-[#111111] rounded-[32px] border border-white/10 p-8 space-y-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
      >
        {/* Icône */}
        <div className="flex justify-center">
          <div className="size-14 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
            <BellOff size={24} />
          </div>
        </div>

        {/* Texte */}
        <div className="text-center space-y-2">
          <p className="text-xl font-display text-white italic">Désactiver ?</p>
          <p className="text-sm text-dim leading-relaxed px-4">
            Tu es sur le point de désactiver {label}. Le progrès demande de la régularité.
          </p>
        </div>

        {/* Boutons */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl bg-danger text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-danger/80 transition-colors cursor-pointer"
          >
            Confirmer la désactivation
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 rounded-2xl bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-colors cursor-pointer"
          >
            Garder les rappels
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// ── Ligne de statut ───────────────────────────────────────────────────
function NotifRow({
  icon, title, description, status, onActivate, onDeactivate, isIOS = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: RowStatus
  onActivate: () => void
  onDeactivate: () => void
  isIOS?: boolean
}) {
  const isOn          = status === 'on'
  const isDenied      = status === 'denied'
  const isLoading     = status === 'loading'
  const isChecking    = status === 'checking'
  const isUnsupported = status === 'unsupported'

  return (
    <div className={cn(
      'rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300',
      isOn     ? 'bg-accent/5 border-accent/30'     :
      isDenied ? 'bg-danger/5 border-danger/20'     :
                 'glass border-border'
    )}>
      {/* Icône */}
      <div className={cn(
        'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300',
        isOn     ? 'bg-accent/15 text-accent'   :
        isDenied ? 'bg-danger/10 text-danger'   :
                   'bg-white/5 text-muted'
      )}>
        {isDenied ? <BellOff size={18} /> : icon}
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-[10px] text-muted leading-snug mt-0.5">
          {isDenied
            ? 'Bloqué — Autorise dans les réglages du navigateur'
            : isIOS && !isOn
            ? description + " · App sur l'écran d'accueil requise"
            : description}
        </p>
      </div>

      {/* Statut / Bouton */}
      <div className="shrink-0">
        {isChecking || isUnsupported ? (
          <span className="text-[10px] text-muted/50 font-bold uppercase tracking-widest">
            {isUnsupported ? 'N/A' : '…'}
          </span>
        ) : isOn ? (
          <button
            onClick={onDeactivate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 text-accent hover:bg-danger/15 hover:text-danger transition-all duration-200 cursor-pointer group"
          >
            <Check size={12} strokeWidth={3} className="group-hover:hidden" />
            <BellOff size={12} className="hidden group-hover:block" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              <span className="group-hover:hidden">Activé</span>
              <span className="hidden group-hover:inline">Désactiver</span>
            </span>
          </button>
        ) : isDenied ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/10 text-danger">
            <AlertTriangle size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Bloqué</span>
          </div>
        ) : (
          <button
            onClick={onActivate}
            disabled={isLoading}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer',
              isLoading
                ? 'bg-white/5 text-muted cursor-not-allowed'
                : 'bg-accent text-background hover:bg-accent-hover'
            )}
          >
            {isLoading ? '...' : 'Activer'}
          </button>
        )}
      </div>
    </div>
  )
}
