import { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, ChevronRight, Maximize2, Minimize2, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Session, type SessionLog, type SetLog } from '@/types'
import { calcWeight, epley } from '@/lib/weightCalc'
import { useCandito } from '@/context/CanditoContext'

interface FocusModeProps {
  session: Session
  rm: { squat: number; bench: number; deadlift: number }
  onClose: () => void
  onComplete: (log: SessionLog) => void
}

// ── Nexus Pulse Timer (Fluid & Modern) ────────────────────────────────
function NexusPulse({
  remaining, total, size = 180,
}: {
  remaining: number; total: number; size?: number
}) {
  const pct = Math.max(0, remaining) / total
  const isDanger = remaining <= 15 && remaining > 0

  const getColor = () => {
    if (remaining === 0) return "#34C759"
    if (remaining <= 15) return "#FF3B30"
    if (remaining <= 30) return "#FF9500"
    return "#FF3B30"
  }

  const radius = 42
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - pct)

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <AnimatePresence>
        {remaining > 0 && [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute inset-0 rounded-full border border-white/10",
              isDanger ? "bg-accent/5" : "bg-accent-success/5"
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.15, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          className="blur-md opacity-30"
          transition={{ duration: 1, ease: "linear" }}
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
        />
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </svg>

      <motion.div
        className="relative z-10 w-[70%] h-[70%] rounded-full flex flex-col items-center justify-center bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[inner_0_2px_10px_rgba(255,255,255,0.05)]"
        animate={isDanger ? { boxShadow: ["0 0 0px rgba(255,59,48,0)", "0 0 20px rgba(255,59,48,0.2)", "0 0 0px rgba(255,59,48,0)"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.span
          key={remaining}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            'font-display tabular-nums leading-none tracking-tighter text-white',
            size >= 180 ? 'text-6xl' : 'text-4xl',
          )}
        >
          {Math.max(0, remaining)}
        </motion.span>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">
          {remaining > 0 ? 'Recovery' : 'Ready'}
        </p>
      </motion.div>
    </div>
  )
}

// ── FocusMode ─────────────────────────────────────────────────────────
export function FocusMode({ session, rm, onClose, onComplete }: FocusModeProps) {
  const { updateRM, state } = useCandito()
  const [exIdx, setExIdx] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
  const [setLogs, setSetLogs] = useState<Record<number, SetLog[]>>({})
  const [pendingSet, setPendingSet] = useState<{
    weight: string
    reps: string
    rpe: number | null
  } | null>(null)
  const [lastModifiedWeight, setLastModifiedWeight] = useState<string | null>(null)
  const [pendingRM, setPendingRM] = useState<{
    lift: 'squat' | 'bench' | 'deadlift'
    value: number
  } | null>(null)

  // ── S6: Nouveaux state ──────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0)
  const [progressionHint, setProgressionHint] = useState<string | null>(null)

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const startedAtRef = useRef(new Date().toISOString())

  // ── Rest Timer ──────────────────────────────────────────────────────
  const [restDuration, setRestDuration] = useState(120)
  const [restRemaining, setRestRemaining] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [restJustDone, setRestJustDone] = useState(false)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const justDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── S6: Nouveaux refs ───────────────────────────────────────────────
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Companion Mode ──────────────────────────────────────────────────
  const [companionMode, setCompanionMode] = useState(false)

  // ── Persistence ─────────────────────────────────────────────────────
  const PERSIST_KEY = `candito_session_${session.id}`

  useEffect(() => {
    const saved = localStorage.getItem(PERSIST_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setExIdx(data.exIdx || 0)
        setSetsDone(data.setsDone || 0)
        setSetLogs(data.setLogs || {})
        if (data.startedAt) startedAtRef.current = data.startedAt
      } catch (e) {
        console.error("Failed to restore session", e)
      }
    }
  }, [PERSIST_KEY])

  useEffect(() => {
    const data = { exIdx, setsDone, setLogs, startedAt: startedAtRef.current }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(data))
  }, [PERSIST_KEY, exIdx, setsDone, setLogs])

  // ── Screen Wake Lock ────────────────────────────────────────────────
  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch { /* non-critique */ }
    }
    acquire()
    const handleVisibility = () => { if (document.visibilityState === 'visible') acquire() }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      wakeLockRef.current?.release()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // ── Timer countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (!restActive) return
    restIntervalRef.current = setInterval(() => {
      setRestRemaining(prev => {
        if (prev <= 1) {
          setRestActive(false)
          setRestJustDone(true)
          navigator.vibrate?.([200, 100, 200])
          justDoneTimerRef.current = setTimeout(() => setRestJustDone(false), 2200)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [restActive])

  // ── S6: Chrono de séance ────────────────────────────────────────────
  useEffect(() => {
    const start = new Date(startedAtRef.current).getTime()
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => () => {
    if (restIntervalRef.current)    clearInterval(restIntervalRef.current)
    if (justDoneTimerRef.current)   clearTimeout(justDoneTimerRef.current)
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
    if (progressionTimerRef.current) clearTimeout(progressionTimerRef.current)
  }, [])

  // ── S6: Performance de la session précédente ────────────────────────
  const lastSessionData = useMemo(() => {
    const name = session.exercises[exIdx]?.name
    if (!name || !state?.progress.sessionLogs.length) return null

    const match = [...state.progress.sessionLogs]
      .sort((a, b) =>
        new Date(b.startedAt ?? b.date).getTime() -
        new Date(a.startedAt ?? a.date).getTime()
      )
      .flatMap(log => log.exercises.filter(ex => ex.exerciseName === name))
      .find(ex => ex.sets.some(s => s.weight != null && s.weight > 0))

    if (!match) return null

    const best = match.sets
      .filter(s => s.weight != null)
      .reduce((b, s) => (s.weight! > b.weight! ? s : b))

    return { weight: best.weight!, reps: best.reps, rpe: best.rpe }
  }, [exIdx, session.exercises, state?.progress.sessionLogs])

  // ── S6: Helpers ─────────────────────────────────────────────────────
  const formatElapsed = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const adjustWeight = (delta: number) => {
    setPendingSet(prev => {
      if (!prev) return prev
      const current = parseFloat(String(prev.weight)) || 0
      const next = Math.max(0, Math.round((current + delta) * 10) / 10)
      return { ...prev, weight: String(next) }
    })
  }

  // ── Derived values ──────────────────────────────────────────────────
  const exercise = session.exercises[exIdx]
  const parsedSets = /\d+/.exec(exercise.sets)
  const totalSets = Math.max(1, parsedSets ? parseInt(parsedSets[0], 10) : 1)
  const allSetsDone = setsDone >= totalSets
  const isLastExercise = exIdx === session.exercises.length - 1
  const isCompleting = allSetsDone && isLastExercise

  const weight = exercise.lift && exercise.percentage
    ? calcWeight(rm[exercise.lift], exercise.percentage.hi)
    : null

  const getDefaultReps = (s: string | undefined): string => {
    if (!s) return '0'
    const matches = s.match(/\d+/g)
    if (matches && matches.length > 0) return matches[matches.length - 1]
    return '0'
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  const stopTimer = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestActive(false)
    setRestJustDone(false)
    setRestRemaining(0)
  }

  const changeRestDuration = (newDuration: number) => {
    if (restActive) {
      const elapsedRest = restDuration - restRemaining
      const newRemaining = Math.max(0, newDuration - elapsedRest)
      setRestRemaining(newRemaining)
    }
    setRestDuration(newDuration)
  }

  const maybeStartRest = (nextSetsDone: number) => {
    const willFinish = nextSetsDone >= totalSets && isLastExercise
    if (!willFinish) {
      setRestRemaining(restDuration)
      setRestActive(true)
    }
  }

  const logSet = (entry: SetLog) => {
    setSetLogs(prev => ({
      ...prev,
      [exIdx]: [...(prev[exIdx] ?? []), entry],
    }))
  }

  // ── S6: Pre-fill poids (priorité : même session → session précédente → programme) ──
  const getDefaultWeight = (): string => {
    if (setsDone > 0 && lastModifiedWeight) return lastModifiedWeight
    return lastModifiedWeight
      ?? lastSessionData?.weight?.toString()
      ?? (weight && weight > 0 ? String(weight) : '')
  }

  // ── Actions ─────────────────────────────────────────────────────────
  const handleAction = () => {
    if (restActive) return
    if (!allSetsDone) {
      setPendingSet({
        weight: getDefaultWeight(),
        reps: getDefaultReps(exercise.reps),
        rpe: null,
      })
    } else if (!isLastExercise) {
      stopTimer()
      setExIdx(i => i + 1)
      setSetsDone(0)
      setLastModifiedWeight(null)
      setProgressionHint(null)
    } else {
      stopTimer()
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
      if (progressionTimerRef.current) clearTimeout(progressionTimerRef.current)
      const log: SessionLog = {
        sessionId: session.id,
        sessionFocus: session.focus,
        startedAt: startedAtRef.current,
        date: new Date().toISOString().split('T')[0],
        exercises: session.exercises.map((ex, i) => ({
          exerciseName: ex.name,
          lift: ex.lift,
          sets: setLogs[i] ?? [],
        })),
      }
      localStorage.removeItem(PERSIST_KEY)
      onComplete(log)
    }
  }

  const handleClose = () => {
    stopTimer()
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
    if (progressionTimerRef.current) clearTimeout(progressionTimerRef.current)
    setSetLogs({})
    setPendingSet(null)
    setPendingRM(null)
    setProgressionHint(null)
    onClose()
  }

  const handleSkip = () => {
    logSet({ weight: null, reps: parseInt(getDefaultReps(exercise.reps), 10), rpe: null })
    const next = setsDone + 1
    setSetsDone(next)
    setPendingSet(null)
    maybeStartRest(next)
  }

  const handleConfirm = () => {
    if (!pendingSet) return
    const w = parseFloat(pendingSet.weight) || null
    const r = parseInt(pendingSet.reps, 10) || 0
    const rpe = pendingSet.rpe
    const loggedEntry: SetLog = { weight: w, reps: r, rpe }

    logSet(loggedEntry)
    if (w) setLastModifiedWeight(String(w))

    const next = setsDone + 1
    setSetsDone(next)
    setPendingSet(null)
    maybeStartRest(next)

    // ── S6: Hint de progression après la dernière série de l'exercice ─
    if (next >= totalSets) {
      const allSets = [...(setLogs[exIdx] ?? []), loggedEntry]
      const rpeValues = allSets.map(s => s.rpe).filter((rv): rv is number => rv != null)
      if (rpeValues.length > 0) {
        const avg = rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
        const hint =
          avg < 7   ? 'Séries légères — envisage +2.5 kg la prochaine fois' :
          avg > 8.5 ? 'Effort intense — maintiens ce poids la prochaine fois' :
                      'Charge optimale ✓'
        setProgressionHint(hint)
        progressionTimerRef.current = setTimeout(() => setProgressionHint(null), 3500)
      }
    }

    // ── Suggestion 1RM si RPE ≥ 8 ──────────────────────────────────
    if (w && w > 0 && rpe && rpe >= 8 && exercise.lift) {
      const repsMatch = /\d+/.exec(exercise.reps ?? '')
      const reps = repsMatch ? parseInt(repsMatch[0]) : 0
      if (reps > 0) {
        const rir = Math.max(0, 10 - rpe)
        const estimated = Math.round(epley(w, reps + rir) / 2.5) * 2.5
        if (estimated > rm[exercise.lift]) {
          setPendingRM({ lift: exercise.lift, value: estimated })
        }
      }
    }
  }

  const showTimer = restActive || restJustDone

  // ── Companion Mode ───────────────────────────────────────────────────
  if (companionMode) {
    return (
      <motion.div
        data-no-swipe
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-8 gap-6 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Exit companion */}
        <button
          onClick={() => setCompanionMode(false)}
          className="absolute top-safe right-6 size-10 rounded-full bg-white/5 flex items-center justify-center text-muted cursor-pointer"
          style={{ top: 'max(3.5rem, env(safe-area-inset-top))' }}
          aria-label="Quitter le mode simplifié"
        >
          <Minimize2 size={18} />
        </button>

        {/* Exercise info */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Exercice {exIdx + 1} / {session.exercises.length}
          </p>
          <h2 className="text-6xl font-display text-white italic tracking-tight leading-[1.05]">
            {exercise.name}
          </h2>

          {/* S6: Perf précédente en companion */}
          {lastSessionData && (
            <p className="text-[11px] text-muted/50 tabular-nums">
              Dernière fois : {lastSessionData.weight} kg × {lastSessionData.reps}
              {lastSessionData.rpe != null && <> @{lastSessionData.rpe}</>}
            </p>
          )}

          {weight !== null && weight > 0 && (
            <div className="inline-flex items-baseline gap-2 tabular-nums">
              <span className="text-7xl font-display text-accent tracking-tighter">{weight}</span>
              <span className="text-3xl font-display text-accent/60">kg</span>
            </div>
          )}
          <p className="text-2xl text-muted font-display">
            {allSetsDone ? 'Toutes les séries ✓' : `Série ${setsDone + 1} / ${totalSets}`}
          </p>
        </div>

        {/* Timer Nexus Pulse (grand) */}
        {showTimer && (
          <div className="flex flex-col items-center gap-3">
            <NexusPulse remaining={restRemaining} total={restDuration} size={240} />
            {restJustDone && (
              <p className="text-sm font-bold text-accent-success uppercase tracking-widest animate-pulse">
                Récupération terminée ✓
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        <AnimatePresence mode="wait">
          {!restActive && (
            <motion.button
              key="cta"
              onClick={() => {
                setCompanionMode(false)
                if (!allSetsDone) {
                  setPendingSet({
                    weight: getDefaultWeight(),
                    reps: getDefaultReps(exercise.reps),
                    rpe: null,
                  })
                }
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'w-full py-7 rounded-pill font-bold uppercase tracking-widest text-[15px]',
                'flex items-center justify-center gap-3 shadow-lg',
                isCompleting
                  ? 'bg-accent text-background shadow-accent/20 cursor-pointer'
                  : allSetsDone
                  ? 'bg-white text-background shadow-white/10 cursor-pointer'
                  : 'bg-accent text-background shadow-accent/20 cursor-pointer',
              )}
            >
              {isCompleting ? (
                <>Terminer la séance <CheckCircle2 size={20} /></>
              ) : allSetsDone ? (
                <>Exercice suivant <ChevronRight size={20} /></>
              ) : (
                <>Série faite <CheckCircle2 size={20} /></>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── Mode Normal ──────────────────────────────────────────────────────
  return (
    <motion.div
      data-no-swipe
      className="fixed inset-0 z-50 bg-background flex flex-col select-none"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div
        className="flex items-start justify-between px-6 pb-6"
        style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}
      >
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">
            Mode Séance
          </span>
          <p className="text-sm text-white/50 mt-0.5 font-display italic">{session.focus}</p>
        </div>
        {/* S6: Chrono + boutons */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-bold tabular-nums text-muted mr-1">
            {formatElapsed(elapsed)}
          </span>
          <button
            onClick={() => setCompanionMode(true)}
            className="size-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors cursor-pointer"
            aria-label="Mode simplifié"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={handleClose}
            className="size-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors duration-200 cursor-pointer"
            aria-label="Quitter le mode séance"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Barre de progression exercices ───────────────────────── */}
      <div className="flex gap-1 px-6 pb-8">
        {session.exercises.map((_, i) => (
          <div key={i} className={cn(
            "h-0.5 flex-1 rounded-full transition-all duration-500",
            i < exIdx ? "bg-accent" : i === exIdx ? "bg-white/40" : "bg-white/10"
          )} />
        ))}
      </div>

      {/* ── Exercice actif ────────────────────────────────────────── */}
      <div key={exIdx} className="flex-1 flex flex-col justify-center px-6 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted tabular-nums">
            Exercice {exIdx + 1} / {session.exercises.length}
          </p>
          <h2 className="text-5xl font-display text-white italic tracking-tight leading-[1.1]">
            {exercise.name}
          </h2>
          {/* S6: Performance précédente */}
          {lastSessionData && (
            <p className="text-[10px] text-muted/60 tabular-nums">
              Dernière fois : {lastSessionData.weight} kg × {lastSessionData.reps}
              {lastSessionData.rpe != null && <> @{lastSessionData.rpe}</>}
            </p>
          )}
          <p className="text-xl text-white/40 font-display tabular-nums">
            {exercise.sets} séries × {exercise.reps} reps
          </p>
        </div>

        {/* Affichage du poids */}
        {(lastModifiedWeight || (weight && weight > 0)) && (
          <div className="inline-flex items-baseline gap-2 tabular-nums px-6 py-4 rounded-2xl bg-white/5 border border-white/5 self-start">
            <span className="text-6xl font-display text-white tracking-tighter">
              {lastModifiedWeight ?? weight}
            </span>
            <span className="text-2xl font-display text-accent pt-1">kg</span>
          </div>
        )}

        {/* Compteur de séries */}
        <div className="space-y-2.5">
          <div className="flex gap-2">
            {Array.from({ length: totalSets }).map((_, i) => (
              <motion.div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                animate={{
                  backgroundColor: i < setsDone
                    ? 'var(--color-accent)'
                    : i === setsDone && !allSetsDone
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  scaleY: i === setsDone - 1 ? [1, 2.5, 1] : 1,
                  scaleX: i === setsDone - 1 ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  backgroundColor: { duration: 0.2 },
                  scaleY: { type: 'spring', stiffness: 500, damping: 15 },
                  scaleX: { type: 'spring', stiffness: 500, damping: 20 },
                }}
              />
            ))}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            {allSetsDone ? 'Toutes les séries terminées' : `Série ${setsDone + 1} / ${totalSets}`}
          </p>
        </div>

        {/* S6: Hint de progression post-exercice */}
        <AnimatePresence>
          {progressionHint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <p className="text-[11px] text-muted font-bold">{progressionHint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Rest Timer ───────────────────────────────────────────── */}
        <AnimatePresence>
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex flex-col items-center gap-4 py-2"
            >
              {restActive ? (
                <>
                  <NexusPulse remaining={restRemaining} total={restDuration} size={180} />
                  <div className="flex gap-2">
                    {[90, 120, 180, 300].map(d => (
                      <button
                        key={d}
                        onClick={() => changeRestDuration(d)}
                        className={cn(
                          'px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border',
                          restDuration === d
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : 'bg-white/5 border-white/5 text-muted hover:text-white',
                        )}
                      >
                        {d >= 60 ? `${Math.floor(d / 60)}:${(d % 60).toString().padStart(2, '0')}` : `${d}s`}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={stopTimer}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Prêt →
                  </button>
                </>
              ) : (
                <p className="text-sm font-bold text-accent-success uppercase tracking-widest py-2 animate-pulse">
                  Récupération terminée ✓
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="px-6 space-y-3" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {!restActive && (
            <motion.button
              key="main-cta"
              onClick={handleAction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "w-full py-6 rounded-pill font-bold uppercase tracking-widest text-[13px]",
                "flex items-center justify-center gap-3 shadow-lg",
                isCompleting
                  ? "bg-accent text-background shadow-accent/20 cursor-pointer"
                  : allSetsDone
                  ? "bg-white text-background shadow-white/10 cursor-pointer"
                  : "bg-accent text-background shadow-accent/20 cursor-pointer"
              )}
            >
              {isCompleting ? (
                <>Terminer la séance <CheckCircle2 size={18} /></>
              ) : allSetsDone ? (
                <>Exercice suivant <ChevronRight size={18} /></>
              ) : (
                <>Série faite <CheckCircle2 size={18} /></>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {setsDone > 0 && !allSetsDone && !restActive && (
          <button
            onClick={() => setSetsDone(s => s - 1)}
            className="w-full text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors duration-200 cursor-pointer py-2"
          >
            ← Annuler la dernière série
          </button>
        )}
      </div>

      {/* ── Suggestion 1RM ───────────────────────────────────────── */}
      <AnimatePresence>
        {pendingRM && !pendingSet && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-[60] px-6 pt-5 pb-safe bg-surface/95 backdrop-blur-xl rounded-t-[24px] border-t border-accent/20"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                <TrendingUp size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  Nouveau 1RM estimé — {pendingRM.lift.toUpperCase()}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Ton set suggère{' '}
                  <span className="text-accent font-bold tabular-nums">{pendingRM.value} kg</span>
                  {' '}(ton actuel : <span className="tabular-nums">{rm[pendingRM.lift]} kg</span>)
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setPendingRM(null)}
                className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors cursor-pointer"
              >
                Ignorer
              </button>
              <button
                onClick={() => {
                  updateRM({ [pendingRM.lift]: pendingRM.value })
                  setPendingRM(null)
                }}
                className="flex-[2] bg-accent text-background py-3 rounded-pill text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20 cursor-pointer hover:bg-accent-hover transition-colors"
              >
                Mettre à jour ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal poids + RPE ─────────────────────────────────────── */}
      {pendingSet && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] px-6 pt-6 bg-surface/95 backdrop-blur-xl rounded-t-[24px] animate-in slide-in-from-bottom-4 duration-300"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="text-center space-y-6">
            <h3 className="text-lg font-display italic text-white">Série {setsDone + 1} terminée</h3>

            <div className="space-y-4">
              {/* S6: Steppers ±2.5 + input poids */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted font-bold">Poids (kg)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustWeight(-2.5)}
                    className="size-12 rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    −2.5
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={pendingSet.weight}
                    onChange={e => setPendingSet(p => p ? { ...p, weight: e.target.value } : null)}
                    placeholder="—"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-display text-white tabular-nums focus:outline-none focus:border-accent transition-colors shadow-inner"
                  />
                  <button
                    onClick={() => adjustWeight(2.5)}
                    className="size-12 rounded-xl bg-white/5 text-muted hover:text-white hover:bg-white/10 text-sm font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  >
                    +2.5
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted font-bold">RPE (optionnel)</label>
                <div className="flex items-center justify-between gap-1">
                  {[6, 7, 7.5, 8, 8.5, 9, 10].map(r => (
                    <button
                      key={r}
                      onClick={() => setPendingSet(p => p ? { ...p, rpe: p.rpe === r ? null : r } : null)}
                      className={cn(
                        "flex-1 h-10 rounded-full text-[11px] font-bold font-display flex items-center justify-center transition-colors cursor-pointer",
                        pendingSet.rpe === r ? "bg-accent text-background" : "bg-white/5 text-muted hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-white transition-colors cursor-pointer"
              >
                Passer
              </button>
              <motion.button
                onClick={handleConfirm}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="flex-[2] bg-accent hover:bg-accent-hover py-3 rounded-pill text-background text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-accent/20 cursor-pointer"
              >
                OK ✓
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
