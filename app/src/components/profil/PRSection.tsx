import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { epley } from '@/lib/weightCalc'
import { type PR } from '@/types'
import { Trophy, Plus, Trash2 } from 'lucide-react'
import { SectionLabel } from './SectionLabel'

export function PRSection({
  prs, onAdd, onRemove,
}: {
  prs: PR[]
  onAdd: (lift: 'squat' | 'bench' | 'deadlift', weight: number, reps: number) => void
  onRemove: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [formLift, setFormLift] = useState<'squat' | 'bench' | 'deadlift'>('squat')
  const [formWeight, setFormWeight] = useState('')
  const [formReps, setFormReps] = useState('')

  const lastPRPerLift = (['squat', 'bench', 'deadlift'] as const).map(lift => ({
    lift,
    pr: [...prs]
      .filter(p => p.lift === lift)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null,
  }))

  const w = parseFloat(formWeight)
  const r = parseInt(formReps)
  const estimated = !isNaN(w) && !isNaN(r) && w > 0 && r > 0 ? epley(w, r) : null

  const handleSubmit = () => {
    if (estimated !== null) {
      onAdd(formLift, w, r)
      setFormWeight('')
      setFormReps('')
      setShowForm(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon={<Trophy size={14} />}>Records Personnels</SectionLabel>
        <button
          onClick={() => setShowForm(v => !v)}
          className="size-7 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent/20 transition-colors cursor-pointer"
          aria-label="Ajouter un record"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* 3 cartes dernier PR */}
      <div className="grid grid-cols-3 gap-3">
        {lastPRPerLift.map(({ lift, pr }) => (
          <div key={lift} className="glass rounded-2xl p-4 text-center space-y-1 border border-border">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted capitalize">{lift}</p>
            {pr ? (
              <>
                <p className="text-xl font-display italic text-white tabular-nums">{pr.weight}</p>
                <p className="text-[9px] text-muted tabular-nums">{pr.reps} reps</p>
              </>
            ) : (
              <p className="text-xl text-muted/30">—</p>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire ajout PR */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-5 space-y-4 border border-accent/20 overflow-hidden"
          >
            <div className="flex gap-2">
              {(['squat', 'bench', 'deadlift'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setFormLift(l)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer capitalize',
                    formLift === l ? 'bg-accent text-background' : 'bg-white/5 text-muted'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted block mb-1">Poids (kg)</label>
                <input
                  type="number" inputMode="decimal" value={formWeight}
                  onChange={e => setFormWeight(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-base focus:outline-none focus:bg-accent/5"
                  placeholder="140"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted block mb-1">Répétitions</label>
                <input
                  type="number" inputMode="numeric" value={formReps}
                  onChange={e => setFormReps(e.target.value)}
                  className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-white text-base focus:outline-none focus:bg-accent/5"
                  placeholder="3"
                />
              </div>
            </div>
            {estimated !== null && (
              <p className="text-[10px] text-accent/70 text-center">
                1RM estimé : <strong className="tabular-nums">{estimated} kg</strong>
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={estimated === null}
              className="w-full py-3 bg-accent text-background rounded-xl text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enregistrer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste exhaustive */}
      {prs.length > 0 && (
        <div className="space-y-2">
          {[...prs].reverse().map(pr => (
            <div
              key={pr.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-accent capitalize w-14">{pr.lift}</span>
                <span className="text-sm font-bold text-white tabular-nums">{pr.weight} kg × {pr.reps}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted tabular-nums">{pr.date}</span>
                <button
                  onClick={() => onRemove(pr.id)}
                  className="p-1 text-muted hover:text-danger transition-colors cursor-pointer"
                  aria-label="Supprimer ce record"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
