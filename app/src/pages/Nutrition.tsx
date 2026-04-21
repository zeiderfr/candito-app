import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCandito } from '@/context/CanditoContext'
import { WEEK_SCHEDULE_MAP } from '../data/program'
import { Clock, Droplets, Zap, RefreshCw, Pill } from 'lucide-react'

// ── MacroCard ───────────────────────────────────────────────────────
function MacroCard({ label, value, unit, protocol, color }: {
  label: string; value: number; unit: string; protocol: string; color: string
}) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2">
      <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-display italic tabular-nums" style={{ color }}>
          {value}
        </span>
        <span className="text-[11px] text-muted font-bold">{unit}</span>
      </div>
      <span className="text-[9px] text-muted/60 leading-relaxed">{protocol}</span>
    </div>
  )
}

// ── Timing Data ─────────────────────────────────────────────────────
const TIMING = [
  { step: '1', label: 'Pré-séance', timing: '1–2h avant', foods: 'Glucides complexes + Protéines', goal: 'Énergie & substrat', icon: Clock },
  { step: '2', label: 'Intra',      timing: 'Optionnel',  foods: 'Glucides rapides',               goal: 'Maintien glycémique', icon: Zap },
  { step: '3', label: 'Post-séance', timing: '< 1h après', foods: 'Whey + Glucides rapides',       goal: 'Récupération', icon: RefreshCw },
]

// ── Supplements Data ────────────────────────────────────────────────
const SUPPLEMENTS = [
  { name: 'Créatine monohydrate', dose: '5 g', timing: 'N\'importe quel moment' },
  { name: 'Caféine (optionnel)',   dose: '3-5 mg/kg', timing: '30 min avant séance' },
  { name: 'Vitamine D',           dose: '2000–4000 UI', timing: 'Avec un repas gras' },
  { name: 'Magnésium',            dose: '300–400 mg', timing: 'Le soir' },
]

// ── Main Export ─────────────────────────────────────────────────────
export function Nutrition() {
  const { state } = useCandito()

  // ── Poids de corps (localStorage) ──
  const [weight, setWeight] = useState<number>(() => {
    const saved = localStorage.getItem('candito_weight')
    return saved ? parseInt(saved) : 70
  })

  const adjustWeight = (delta: number) => {
    const next = Math.max(40, Math.min(150, weight + delta))
    setWeight(next)
    localStorage.setItem('candito_weight', String(next))
  }

  // ── Toggle Entraînement / Repos (auto-detect) ──
  const [isTraining, setIsTraining] = useState(() => {
    const schedule = WEEK_SCHEDULE_MAP[state.currentWeekId] ?? {}
    const today = new Date().getDay()
    return schedule[today] !== null && schedule[today] !== undefined
  })

  // ── Calcul macros dynamiques ──
  const macros = useMemo(() => {
    const p = Math.round(weight * (isTraining ? 2.2 : 2.0))
    const l = Math.round(weight * (isTraining ? 1.0 : 1.1))
    const g = Math.round(weight * (isTraining ? 4.8 : 3.2))
    const kcal = p * 4 + g * 4 + l * 9
    return { p, l, g, kcal }
  }, [weight, isTraining])

  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-2 duration-300"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Nutrition
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
          Protocole nutritionnel dynamique
        </p>
      </div>

      {/* Sélecteur de poids (inline, compact) */}
      <div className="flex items-center justify-between px-4 py-3 glass rounded-xl">
        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Poids de corps</span>
        <div className="flex items-center gap-3">
          <button onClick={() => adjustWeight(-1)} aria-label="Diminuer le poids" className="size-7 rounded-lg bg-white/5 text-muted hover:text-white text-sm font-bold transition-colors cursor-pointer">−</button>
          <span className="text-sm font-bold text-white tabular-nums w-12 text-center">{weight} kg</span>
          <button onClick={() => adjustWeight(+1)} aria-label="Augmenter le poids" className="size-7 rounded-lg bg-white/5 text-muted hover:text-white text-sm font-bold transition-colors cursor-pointer">+</button>
        </div>
      </div>

      {/* Toggle Entraînement / Repos */}
      <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-border">
        {['Entraînement', 'Repos'].map((label, i) => (
          <button
            key={label}
            onClick={() => setIsTraining(i === 0)}
            className={cn(
              "flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer",
              isTraining === (i === 0)
                ? "bg-accent text-background shadow-lg"
                : "text-muted hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Macro grid 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        <MacroCard label="Protéines" value={macros.p} unit="g" protocol={isTraining ? '2.2 g/kg — training' : '2.0 g/kg — maintien'} color="var(--color-accent)" />
        <MacroCard label="Glucides"  value={macros.g} unit="g" protocol="Variable / charge" color="rgba(255,255,255,0.8)" />
        <MacroCard label="Lipides"   value={macros.l} unit="g" protocol="~1 g/kg — hormonal" color="rgba(255,255,255,0.5)" />
        <MacroCard label="Calories"  value={macros.kcal} unit="kcal" protocol={isTraining ? 'Surplus S1-4' : 'Maintien S5-6'} color="rgba(255,255,255,0.3)" />
      </div>

      {/* Timing séance — Timeline verticale */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Clock size={15} className="text-accent" />
          </div>
          <h3 className="text-base font-display text-white italic">Timing séance</h3>
        </div>
        <div className="relative px-4 py-2">
          {/* Ligne verticale */}
          <div className="absolute left-[38px] top-6 bottom-6 w-px bg-border" />
          <div className="space-y-0 divide-y divide-border/40">
            {TIMING.map(t => (
              <div key={t.step} className="flex gap-4 py-4 pl-1">
                {/* Numéro */}
                <div className="size-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 z-10">
                  <span className="text-[11px] font-bold text-accent">{t.step}</span>
                </div>
                {/* Contenu */}
                <div className="flex-1 pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-white">{t.label}</span>
                    <span className="text-[10px] text-muted">{t.timing}</span>
                  </div>
                  <p className="text-[12px] text-white/70 mt-1">{t.foods}</p>
                  <p className="text-[10px] text-muted/60 mt-0.5">→ {t.goal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hydratation — Card simple */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={14} className="text-accent" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Hydratation</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-accent/5 border border-accent/10 p-3 text-center">
            <p className="text-2xl font-display italic text-accent">3–4<span className="text-base font-sans not-italic"> L</span></p>
            <p className="text-[9px] text-muted uppercase tracking-widest mt-1">Entraînement</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-border p-3 text-center">
            <p className="text-2xl font-display italic text-white/60">2.5–3<span className="text-base font-sans not-italic text-muted"> L</span></p>
            <p className="text-[9px] text-muted uppercase tracking-widest mt-1">Repos</p>
          </div>
        </div>
      </div>

      {/* Suppléments — Liste avec badges */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Pill size={15} className="text-accent" />
          </div>
          <h3 className="text-base font-display text-white italic">Suppléments</h3>
        </div>
        <div className="px-4">
          {SUPPLEMENTS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
              <div className="size-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Pill size={13} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{s.name}</p>
                <p className="text-[10px] text-muted mt-0.5">{s.timing}</p>
              </div>
              <span className="text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-pill shrink-0 tabular-nums">
                {s.dose}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
