import { useState } from 'react'

// ── Champ 1RM ─────────────────────────────────────────────────────────
export function AthleteRMField({
  lift, value, onSave,
}: {
  lift: string; value: number; onSave: (v: number) => void
}) {
  const [draft, setDraft] = useState(String(value))

  const handleBlur = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n > 0) onSave(Math.round(n / 2.5) * 2.5)
    else setDraft(String(value))
  }

  return (
    <div className="glass rounded-[24px] p-4 flex flex-col items-center gap-2 border border-border group hover:border-accent/40 transition-colors">
      <label className="text-[9px] font-bold uppercase tracking-widest text-muted/60 capitalize">{lift}</label>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="w-16 bg-transparent text-xl font-display italic text-white text-center focus:outline-none focus:text-accent transition-colors text-base"
        />
        <span className="text-[10px] text-muted font-bold">KG</span>
      </div>
    </div>
  )
}

// ── Hero athlète ──────────────────────────────────────────────────────
export function AthleteHeroSection({
  name, nameDraft, editingName, total, cycleNumber, currentWeekId,
  onEditName, onNameChange, onNameBlur,
}: {
  name: string; nameDraft: string; editingName: boolean; total: number
  cycleNumber: number; currentWeekId: string
  onEditName: () => void; onNameChange: (v: string) => void; onNameBlur: () => void
}) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
      <div className="flex items-start gap-6">
        <div className="size-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={e => onNameChange(e.target.value)}
              onBlur={onNameBlur}
              onKeyDown={e => e.key === 'Enter' && onNameBlur()}
              className="w-full bg-accent/5 border-b-2 border-accent/60 px-2 py-1 text-2xl font-display italic text-white focus:outline-none text-base"
            />
          ) : (
            <button
              onClick={onEditName}
              className="text-white text-3xl font-display italic hover:text-accent transition-colors cursor-pointer text-left leading-tight"
            >
              {name}
            </button>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full tabular-nums">
              Total {total} kg
            </span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
              Cycle {cycleNumber}
            </span>
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
              {currentWeekId.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
