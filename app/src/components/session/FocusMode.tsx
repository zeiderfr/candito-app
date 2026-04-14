import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { type Session, type SessionLog, type SetLog } from '@/types'
import { calcWeight } from '@/lib/weightCalc'

interface FocusModeProps {
  session: Session
  rm: { squat: number; bench: number; deadlift: number }
  onClose: () => void
  onComplete: (log: SessionLog) => void
}

export function FocusMode({ session, rm, onClose, onComplete }: FocusModeProps) {
  const [exIdx, setExIdx] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
  const [setLogs, setSetLogs] = useState<Record<number, SetLog[]>>({})
  const [pendingSet, setPendingSet] = useState<{
    weight: string
    rpe: number | null
  } | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Screen Wake Lock — empêche l'écran de se verrouiller pendant la séance
  useEffect(() => {
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Non-critique — silencieux si refusé
      }
    }
    acquire()

    // Ré-acquérir si l'app revient au premier plan (iOS libère le lock en background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      wakeLockRef.current?.release()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const exercise = session.exercises[exIdx]
  const parsedSets = /\d+/.exec(exercise.sets)
  const totalSets = Math.max(1, parsedSets ? parseInt(parsedSets[0], 10) : 1)
  const allSetsDone = setsDone >= totalSets
  const isLastExercise = exIdx === session.exercises.length - 1

  const weight = exercise.lift && exercise.percentage
    ? calcWeight(rm[exercise.lift], exercise.percentage.hi)
    : null

  const handleAction = () => {
    if (!allSetsDone) {
      setPendingSet({ weight: weight && weight > 0 ? String(weight) : '', rpe: null })
    } else if (!isLastExercise) {
      setExIdx(i => i + 1)
      setSetsDone(0)
    } else {
      const log: SessionLog = {
        sessionId: session.id,
        date: new Date().toISOString().split('T')[0],
        exercises: session.exercises.map((ex, i) => ({
          exerciseName: ex.name,
          lift: ex.lift,
          sets: setLogs[i] ?? []
        }))
      }
      onComplete(log)
    }
  }

  const isCompleting = allSetsDone && isLastExercise

  const handleClose = () => {
    setSetLogs({})
    setPendingSet(null)
    onClose()
  }

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
        <button
          onClick={handleClose}
          className="size-10 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors duration-200 cursor-pointer mt-0.5"
          aria-label="Quitter le mode séance"
        >
          <X size={18} />
        </button>
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
      <div key={exIdx} className="flex-1 flex flex-col justify-center px-6 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted tabular-nums">
            Exercice {exIdx + 1} / {session.exercises.length}
          </p>
          <h2 className="text-5xl font-display text-white italic tracking-tight leading-[1.1]">
            {exercise.name}
          </h2>
          <p className="text-xl text-white/40 font-display tabular-nums">
            {exercise.sets} séries × {exercise.reps} reps
          </p>
        </div>

        {/* Badge poids */}
        {weight !== null && weight > 0 && (
          <div className="inline-flex items-baseline gap-2 tabular-nums px-6 py-4 rounded-2xl bg-white/5 border border-white/5 self-start">
            <span className="text-6xl font-display text-white tracking-tighter">{weight}</span>
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
                    ? '#66bb6a'
                    : i === setsDone && !allSetsDone
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.1)',
                  scaleY: i === setsDone - 1 ? [1.8, 1] : 1,
                }}
                transition={{
                  backgroundColor: { duration: 0.2 },
                  scaleY: { type: 'spring', stiffness: 400, damping: 15 },
                }}
              />
            ))}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            {allSetsDone
              ? "Toutes les séries terminées"
              : `Série ${setsDone + 1} / ${totalSets}`}
          </p>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className="px-6 space-y-3" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <motion.button
          onClick={handleAction}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={cn(
            "w-full py-6 rounded-pill font-bold uppercase tracking-widest text-[13px]",
            "flex items-center justify-center gap-3",
            "cursor-pointer shadow-lg"
          , isCompleting
              ? "bg-accent text-background shadow-accent/20"
              : allSetsDone
              ? "bg-white text-background shadow-white/10"
              : "bg-accent text-background shadow-accent/20"
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

        {/* Annuler la dernière série */}
        {setsDone > 0 && !allSetsDone && (
          <button
            onClick={() => setSetsDone(s => s - 1)}
            className="w-full text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors duration-200 cursor-pointer py-2"
          >
            ← Annuler la dernière série
          </button>
        )}
      </div>

      {pendingSet && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[60] px-6 pt-6 bg-surface/95 backdrop-blur-xl rounded-t-[24px] animate-in slide-in-from-bottom-4 duration-300"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="text-center space-y-6">
            <h3 className="text-lg font-display italic text-white">Série {setsDone + 1} terminée</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-muted font-bold">Poids (kg)</label>
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={pendingSet.weight}
                  onChange={e => setPendingSet(p => p ? { ...p, weight: e.target.value } : null)}
                  placeholder="—"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-2xl font-display text-white tabular-nums focus:outline-none focus:border-accent/50 transition-colors"
                />
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
                onClick={() => {
                  setSetLogs(prev => ({
                    ...prev,
                    [exIdx]: [...(prev[exIdx] ?? []), { weight: null, reps: totalSets, rpe: null }]
                  }))
                  setSetsDone(s => s + 1)
                  setPendingSet(null)
                }}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-white transition-colors cursor-pointer"
              >
                Passer
              </button>
              <motion.button
                onClick={() => {
                  setSetLogs(prev => ({
                    ...prev,
                    [exIdx]: [...(prev[exIdx] ?? []), { weight: parseFloat(pendingSet.weight) || null, reps: totalSets, rpe: pendingSet.rpe }]
                  }))
                  setSetsDone(s => s + 1)
                  setPendingSet(null)
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="flex-[2] bg-accent hover:bg-[#77cc7b] py-3 rounded-pill text-background text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-accent/20 cursor-pointer"
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
