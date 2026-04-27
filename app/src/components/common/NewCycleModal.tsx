import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type RM } from '@/types'

interface NewCycleModalProps {
  isOpen: boolean
  onClose: () => void
  cycleNumber: number         // Numéro du cycle qui se termine
  suggestedRM: RM             // 1RM calculés via Epley depuis les logs
  currentRM: RM               // 1RM actuels (fallback si pas de logs)
  onConfirm: (rm: RM) => void
}

const LIFTS: Array<{ key: keyof RM; label: string }> = [
  { key: 'squat',    label: 'Squat'    },
  { key: 'bench',    label: 'Bench'    },
  { key: 'deadlift', label: 'Deadlift' },
]

export function NewCycleModal({
  isOpen,
  onClose,
  cycleNumber,
  suggestedRM,
  currentRM,
  onConfirm,
}: NewCycleModalProps) {
  const [rm, setRm] = useState<RM>({
    squat: suggestedRM.squat || currentRM.squat,
    bench: suggestedRM.bench || currentRM.bench,
    deadlift: suggestedRM.deadlift || currentRM.deadlift,
  })

  // Réinitialiser les valeurs à chaque ouverture du modal
  useEffect(() => {
    if (isOpen) {
      setRm({
        squat: suggestedRM.squat || currentRM.squat,
        bench: suggestedRM.bench || currentRM.bench,
        deadlift: suggestedRM.deadlift || currentRM.deadlift,
      })
    }
  }, [isOpen, suggestedRM.squat, suggestedRM.bench, suggestedRM.deadlift, currentRM.squat, currentRM.bench, currentRM.deadlift])

  const handleChange = useCallback((lift: keyof RM, value: string): void => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setRm(prev => ({ ...prev, [lift]: num }))
    }
  }, [])

  const handleConfirm = useCallback((): void => {
    onConfirm(rm)
    onClose()
  }, [rm, onConfirm, onClose])

  const totalNew = rm.squat + rm.bench + rm.deadlift
  const totalOld = currentRM.squat + currentRM.bench + currentRM.deadlift
  const gain = totalNew - totalOld

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet du bas */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 max-w-[680px] mx-auto",
        "glass border border-border rounded-t-2xl px-5 pt-6 pb-10",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <RefreshCw size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-base">
                Cycle {cycleNumber} terminé
              </p>
              <p className="text-muted text-[11px] mt-0.5">
                Configure les 1RM du cycle {cycleNumber + 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors cursor-pointer mt-0.5"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Champs 1RM */}
        <div className="space-y-3 mb-5">
          {LIFTS.map(({ key, label }) => {
            const suggested = suggestedRM[key]
            const current = currentRM[key]
            const isImproved = suggested > current
            return (
              <div
                key={key}
                className="glass rounded-xl px-4 py-3 border border-border flex items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rm[key]}
                      onChange={e => handleChange(key, e.target.value)}
                      step={2.5}
                      min={20}
                      max={500}
                      className={cn(
                        "w-24 bg-transparent text-white font-bold text-xl outline-none",
                        "border-b border-border focus:border-accent transition-colors"
                      )}
                    />
                    <span className="text-muted text-sm">kg</span>
                  </div>
                </div>
                {isImproved && (
                  <div className="flex items-center gap-1 text-accent shrink-0">
                    <TrendingUp size={14} />
                    <span className="text-[11px] font-bold">
                      +{(suggested - current).toFixed(1)} kg
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="glass rounded-xl px-4 py-3 border border-border flex items-center justify-between mb-6">
          <span className="text-muted text-xs uppercase tracking-wider">Total</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{totalNew} kg</span>
            {gain > 0 && (
              <span className="text-accent text-xs font-bold">+{gain.toFixed(1)} kg</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border text-muted text-sm font-medium hover:text-white hover:border-white/20 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              "flex-1 py-3 rounded-xl bg-accent/10 border border-accent/30",
              "text-accent font-bold text-sm uppercase tracking-widest",
              "hover:bg-accent/20 transition-colors cursor-pointer"
            )}
          >
            Lancer le cycle {cycleNumber + 1}
          </button>
        </div>
      </div>
    </>
  )
}
