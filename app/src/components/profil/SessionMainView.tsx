import { motion } from 'framer-motion'
import { useCandito } from '@/context/CanditoContext'
import { useToasts } from '@/context/ToastContext'
import { resolveSession, hasSessionOverride } from '@/lib/programResolver'
import { RotateCcw } from 'lucide-react'
import { ProfilInlineTextField } from './ProfilInlineTextField'

export function SessionMainView({
  weekId, sessionId, onBack,
}: {
  weekId: string; sessionId: string; onBack: () => void
}) {
  const { state, setExerciseOverride, setSessionFocus, resetSessionOverride } = useCandito()
  const { showToast } = useToasts()
  const overrides = state.programOverrides
  const resolved = resolveSession(weekId, sessionId, overrides)

  if (!resolved) return <p className="text-muted text-sm py-4 text-center">Session introuvable.</p>

  const hasOv = hasSessionOverride(weekId, sessionId, overrides)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-6"
    >
      {/* Focus de la session */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">Nom de la séance</p>
        <ProfilInlineTextField
          value={resolved.focus}
          onSave={v => setSessionFocus(weekId, sessionId, v)}
          placeholder="Ex : Bas lourd"
          textClass="text-2xl font-display italic text-white"
        />
      </div>

      {/* Exercices */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Structure des Exercices</p>
        {resolved.exercises.map((ex, i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-4 border border-border hover:border-accent/10 transition-colors">
            <ProfilInlineTextField
              value={ex.name}
              onSave={v => setExerciseOverride(weekId, sessionId, i, { name: v })}
              placeholder="Nom de l'exercice"
              textClass="text-base font-bold text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Séries</label>
                <ProfilInlineTextField
                  value={ex.sets}
                  onSave={v => setExerciseOverride(weekId, sessionId, i, { sets: v })}
                  placeholder="ex: 4x5"
                  textClass="text-sm text-white tabular-nums bg-white/5 rounded-lg px-2 py-1"
                />
              </div>
              {ex.reps && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Reps</label>
                  <ProfilInlineTextField
                    value={ex.reps}
                    onSave={v => setExerciseOverride(weekId, sessionId, i, { reps: v })}
                    placeholder="ex: 6-8"
                    textClass="text-sm text-white tabular-nums bg-white/5 rounded-lg px-2 py-1"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-muted">Note technique</label>
              <ProfilInlineTextField
                value={ex.note ?? ''}
                onSave={v => setExerciseOverride(weekId, sessionId, i, { note: v || undefined })}
                placeholder="Ajouter une consigne…"
                textClass="text-[11px] text-muted italic bg-white/[0.02] rounded-lg px-2 py-1"
              />
            </div>
          </div>
        ))}
      </div>

      {hasOv && (
        <button
          onClick={() => {
            resetSessionOverride(weekId, sessionId)
            showToast({ message: `Séance "${resolved.focus}" réinitialisée.`, duration: 4000 })
            onBack()
          }}
          className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest text-danger/60 hover:text-danger transition-colors cursor-pointer border border-danger/20 rounded-2xl bg-danger/5"
        >
          <RotateCcw size={12} />
          Réinitialiser cette séance
        </button>
      )}
    </motion.div>
  )
}
