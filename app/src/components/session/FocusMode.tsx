import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, ChevronRight } from 'lucide-react'
import { type Session } from '@/types'
import { calcWeight } from '@/lib/weightCalc'

interface FocusModeProps {
  session: Session
  rm: { squat: number; bench: number; deadlift: number }
  onClose: () => void
  onComplete: () => void
}

export function FocusMode({ session, rm, onClose, onComplete }: FocusModeProps) {
  const [exIdx, setExIdx] = useState(0)
  const [setsDone, setSetsDone] = useState(0)
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
  const totalSets = Math.max(1, parseInt(exercise.sets) || 1)
  const allSetsDone = setsDone >= totalSets
  const isLastExercise = exIdx === session.exercises.length - 1

  const weight = exercise.lift && exercise.percentage
    ? calcWeight(rm[exercise.lift], exercise.percentage.hi)
    : null

  const handleAction = () => {
    if (!allSetsDone) {
      // Incrémenter le compteur de séries
      setSetsDone(s => s + 1)
    } else if (!isLastExercise) {
      // Passer à l'exercice suivant
      setExIdx(i => i + 1)
      setSetsDone(0)
    } else {
      // Toute la séance est terminée
      onComplete()
    }
  }

  const isCompleting = allSetsDone && isLastExercise

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background flex flex-col select-none",
      "animate-in fade-in duration-200"
    )}>
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-6 pt-14 pb-6">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent">
            Mode Séance
          </span>
          <p className="text-sm text-white/50 mt-0.5 font-display italic">{session.focus}</p>
        </div>
        <button
          onClick={onClose}
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
      <div className="flex-1 flex flex-col justify-center px-6 gap-8">
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
              <div key={i} className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < setsDone ? "bg-accent" : i === setsDone && !allSetsDone ? "bg-white/30" : "bg-white/10"
              )} />
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
      <div className="px-6 pb-12 space-y-3">
        <button
          onClick={handleAction}
          className={cn(
            "w-full py-6 rounded-pill font-bold uppercase tracking-widest text-[13px]",
            "flex items-center justify-center gap-3",
            "transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-lg"
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
        </button>

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
    </div>
  )
}
