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
  const [localStatus, setLocalStatus] = useState<RowStatus>('checking')
  const [pushStatus, setPushStatus]   = useState<RowStatus>('checking')
  const [confirm, setConfirm]         = useState<ConfirmTarget | null>(null)

  // ── Vérification initiale des statuts ─────────────────────────────
  useEffect(() => {
    // Statut local — soft-disable via flag localStorage
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setLocalStatus('unsupported')
    } else if (Notification.permission === 'denied') {
      setLocalStatus('denied')
    } else if (
      Notification.permission === 'granted' &&
      !localStorage.getItem(STORAGE_KEYS.LOCAL_NOTIF_DISABLED)
    ) {
      setLocalStatus('on')
    } else {
      setLocalStatus('off')
    }

    // Statut push
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported')
      return
    }
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => {
      setPushStatus(sub ? 'on' : Notification.permission === 'denied' ? 'denied' : 'off')
    }).catch(() => setPushStatus('unsupported'))
  }, [])

  // ── Activer rappels locaux ─────────────────────────────────────────
  const enableLocal = async () => {
    setLocalStatus('loading')
    localStorage.removeItem(STORAGE_KEYS.LOCAL_NOTIF_DISABLED)
    const result = await Notification.requestPermission()
    setLocalStatus(result === 'granted' ? 'on' : result === 'denied' ? 'denied' : 'off')
  }

  // ── Désactiver rappels locaux (soft-disable) ───────────────────────
  const disableLocal = () => {
    localStorage.setItem(STORAGE_KEYS.LOCAL_NOTIF_DISABLED, '1')
    setLocalStatus('off')
  }

  // ── Activer push persistants ───────────────────────────────────────
  const enablePush = async () => {
    setPushStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, weekId: state.currentWeekId }),
      })
      setPushStatus('on')
    } catch {
      setPushStatus('off')
    }
  }

  // ── Désactiver push persistants ────────────────────────────────────
  const disablePush = async () => {
    setPushStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/push-unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {/* silencieux si l'endpoint n'existe pas côté serveur */})
      }
      setPushStatus('off')
    } catch {
      setPushStatus('off')
    }
  }

  // ── Confirmation handler ───────────────────────────────────────────
  const handleConfirm = () => {
    if (confirm === 'local') disableLocal()
    if (confirm === 'push') void disablePush()
    setConfirm(null)
  }

  return (
    <div className="space-y-3">
      <NotifRow
        icon={<Bell size={18} />}
        title="Rappels d'entraînement"
        description="Notification quand l'app est ouverte le jour J"
        status={localStatus}
        onActivate={enableLocal}
        onDeactivate={() => setConfirm('local')}
      />
      <NotifRow
        icon={<CloudLightning size={18} />}
        title="Rappels persistants"
        description="Push à 8h même application fermée (requiert PWA)"
        status={pushStatus}
        onActivate={enablePush}
        onDeactivate={() => setConfirm('push')}
        isIOS={/iPhone|iPad|iPod/.test(navigator.userAgent)}
      />

      {/* Dialog de confirmation désactivation */}
      <AnimatePresence>
        {confirm !== null && (
          <ConfirmDialog
            type={confirm}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Dialog de confirmation ─────────────────────────────────────────────
function ConfirmDialog({
  type, onConfirm, onCancel
}: {
  type: ConfirmTarget
  onConfirm: () => void
  onCancel: () => void
}) {
  const label = type === 'local' ? "les rappels d'entraînement" : 'les rappels persistants'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        className="relative z-10 w-full max-w-sm mx-4 glass rounded-3xl border border-border p-6 space-y-5"
      >
        {/* Icône */}
        <div className="flex justify-center">
          <div className="size-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
            <BellOff size={20} />
          </div>
        </div>

        {/* Texte */}
        <div className="text-center space-y-1.5">
          <p className="text-base font-bold text-white">Désactiver les rappels ?</p>
          <p className="text-[12px] text-muted leading-relaxed">
            Tu es sur le point de désactiver {label}.
            Tu pourras les réactiver à tout moment.
          </p>
        </div>

        {/* Boutons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 rounded-2xl bg-white/5 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="py-3 rounded-2xl bg-danger/20 text-danger text-[11px] font-bold uppercase tracking-widest hover:bg-danger/30 transition-colors cursor-pointer"
          >
            Désactiver
          </button>
        </div>
      </motion.div>
    </motion.div>
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
