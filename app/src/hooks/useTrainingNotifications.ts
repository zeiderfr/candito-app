/**
 * useTrainingNotifications — Rappels d'entraînement PWA (no-backend)
 *
 * Stratégie : à l'ouverture de l'app, si aujourd'hui est un jour d'entraînement
 * + permission granted + pas déjà notifié aujourd'hui → showNotification via SW.
 *
 * iOS : notification uniquement via reg.showNotification() (jamais new Notification())
 * Geste user obligatoire pour requestPermission() (déclenché depuis onClick)
 */
import { useState, useEffect, useCallback } from 'react'
import { WEEK_SCHEDULE_MAP, PROGRAM_DATA } from '@/data/program'
import { STORAGE_KEYS } from '@/lib/storageKeys'

const NOTIF_DATE_KEY = STORAGE_KEYS.LAST_TRAINING_NOTIF
const DISMISSED_KEY = STORAGE_KEYS.TRAINING_NOTIF_DISMISSED

interface TrainingNotificationsResult {
  permission: NotificationPermission | null
  isDismissed: boolean
  isTodayTrainingDay: boolean
  sessionFocusToday: string | null
  requestPermission: () => Promise<void>
  dismiss: () => void
  isSupported: boolean
}

const isPWANotifSupported = (): boolean =>
  'Notification' in window && 'serviceWorker' in navigator

export function useTrainingNotifications(currentWeekId: string): TrainingNotificationsResult {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isTodayTrainingDay, setIsTodayTrainingDay] = useState(false)
  const [sessionFocusToday, setSessionFocusToday] = useState<string | null>(null)

  // ── Déterminer si aujourd'hui est un jour d'entraînement ──────────────
  useEffect(() => {
    const schedule = WEEK_SCHEDULE_MAP[currentWeekId]
    if (!schedule) return

    const dayOfWeek = new Date().getDay() // 0=Dim, 1=Lun, ..., 6=Sam
    const sessionId = schedule[dayOfWeek]

    if (!sessionId) {
      setIsTodayTrainingDay(false)
      setSessionFocusToday(null)
      return
    }

    setIsTodayTrainingDay(true)

    // Trouver le focus de la session pour le body de la notification
    const week = PROGRAM_DATA[currentWeekId]
    const session = week?.sessions.find(s => s.id === sessionId)
    setSessionFocusToday(session?.focus ?? null)
  }, [currentWeekId])

  // ── Initialiser l'état permission + dismissed ──────────────────────
  useEffect(() => {
    if (!isPWANotifSupported()) {
      setIsDismissed(true)
      return
    }
    setPermission(Notification.permission)
    if (localStorage.getItem(DISMISSED_KEY)) setIsDismissed(true)
  }, [])

  // ── Auto-notifier si conditions réunies ───────────────────────────
  useEffect(() => {
    if (!isPWANotifSupported()) return
    if (Notification.permission !== 'granted') return
    if (!isTodayTrainingDay) return

    const today = new Date().toISOString().split('T')[0]
    if (localStorage.getItem(NOTIF_DATE_KEY) === today) return // déjà notifié

    void showTrainingNotification(sessionFocusToday)
    localStorage.setItem(NOTIF_DATE_KEY, today)
  }, [isTodayTrainingDay, sessionFocusToday])

  // ── Demande de permission (doit être appelé dans un onClick) ───────
  const requestPermission = useCallback(async (): Promise<void> => {
    if (!isPWANotifSupported()) return
    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted' && isTodayTrainingDay) {
      const today = new Date().toISOString().split('T')[0]
      if (localStorage.getItem(NOTIF_DATE_KEY) !== today) {
        void showTrainingNotification(sessionFocusToday)
        localStorage.setItem(NOTIF_DATE_KEY, today)
      }
    }
  }, [isTodayTrainingDay, sessionFocusToday])

  const dismiss = useCallback((): void => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setIsDismissed(true)
  }, [])

  return {
    permission,
    isDismissed,
    isTodayTrainingDay,
    sessionFocusToday,
    requestPermission,
    dismiss,
    isSupported: isPWANotifSupported(),
  }
}

// ── Affichage de la notification via Service Worker ──────────────────
async function showTrainingNotification(sessionFocus: string | null): Promise<void> {
  if (!isPWANotifSupported()) return
  if (Notification.permission !== 'granted') return

  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return

    const body = sessionFocus
      ? `${sessionFocus} — Bonne séance !`
      : "C'est le jour J. En salle !"

    await reg.showNotification('CANDITO — Entraînement aujourd\'hui', {
      body,
      icon: '/apple-touch-icon.png',
      tag: 'training-reminder',
    })
  } catch {
    // SW non disponible (ex: premier chargement) → silencieux
  }
}
