/**
 * NotificationSettings — Panneau de gestion des notifications dans les Paramètres du Profil.
 *
 * Deux types de rappels :
 * 1. Rappels locaux (Notification API) — quand l'app est ouverte le jour d'entraînement
 * 2. Push persistants (Web Push / Service Worker) — même app fermée, via Cloudflare CRON
 */
import { useState, useEffect } from 'react'
import { Check, Bell, BellOff, CloudLightning, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanditoState } from '@/hooks/useCanditoState'

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

export function NotificationSettings() {
  const { state } = useCanditoState()
  const [localStatus, setLocalStatus] = useState<RowStatus>('checking')
  const [pushStatus, setPushStatus]   = useState<RowStatus>('checking')

  // ── Vérification initiale des statuts ─────────────────────────────
  useEffect(() => {
    // Statut local
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setLocalStatus('unsupported')
    } else {
      setLocalStatus(
        Notification.permission === 'granted' ? 'on' :
        Notification.permission === 'denied'  ? 'denied' : 'off'
      )
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
    const result = await Notification.requestPermission()
    setLocalStatus(result === 'granted' ? 'on' : result === 'denied' ? 'denied' : 'off')
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

  return (
    <div className="space-y-3">
      <NotifRow
        icon={<Bell size={18} />}
        title="Rappels d'entraînement"
        description="Notification quand l'app est ouverte le jour J"
        status={localStatus}
        onActivate={enableLocal}
      />
      <NotifRow
        icon={<CloudLightning size={18} />}
        title="Rappels persistants"
        description="Push à 8h même application fermée (requiert PWA)"
        status={pushStatus}
        onActivate={enablePush}
        isIOS={/iPhone|iPad|iPod/.test(navigator.userAgent)}
      />
    </div>
  )
}

// ── Ligne de statut ───────────────────────────────────────────────────
function NotifRow({
  icon, title, description, status, onActivate, isIOS = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: RowStatus
  onActivate: () => void
  isIOS?: boolean
}) {
  const isOn      = status === 'on'
  const isDenied  = status === 'denied'
  const isLoading = status === 'loading'
  const isChecking = status === 'checking'
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
        <p className={cn(
          'text-sm font-bold',
          isOn ? 'text-white' : isDenied ? 'text-danger' : 'text-white'
        )}>
          {title}
        </p>
        <p className="text-[10px] text-muted leading-snug mt-0.5">
          {isDenied
            ? 'Bloqué — Autorise dans les réglages du navigateur'
            : isIOS && !isOn
            ? description + ' · App sur l\'écran d\'accueil requise'
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 text-accent">
            <Check size={12} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Activé</span>
          </div>
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
