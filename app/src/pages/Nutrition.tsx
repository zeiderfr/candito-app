import { cn } from '@/lib/utils'
import { Utensils, Clock, Droplets } from 'lucide-react'

function SectionCard({ icon: Icon, title, children }: {
  icon: typeof Utensils
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="glass rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          <Icon size={16} />
        </div>
        <h3 className="text-lg font-display text-white italic">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

function DataTable({ headers, rows, highlightCol }: {
  headers: string[]
  rows: string[][]
  highlightCol?: number
}) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-left text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-muted whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "py-3 pr-4 whitespace-nowrap",
                    j === 0 ? "text-white font-medium" : "text-white/70",
                    highlightCol !== undefined && j === highlightCol && "text-accent font-medium tabular-nums"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Nutrition() {
  return (
    <div className={cn(
      "flex flex-col gap-6",
      "animate-in fade-in slide-in-from-bottom-4 duration-500"
    )}>
      {/* Editorial Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display text-white italic tracking-tight">
          Nutrition
        </h1>
        <p className="text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
          Protocole nutritionnel — Base 66 kg
        </p>
      </div>

      {/* Macros */}
      <SectionCard icon={Utensils} title="Macronutriments">
        <DataTable
          headers={['Nutriment', 'Jour entraînement', 'Jour repos', 'Protocole']}
          rows={[
            ['Protéines', '132–145 g', '132–145 g', '2–2.2 g/kg — constant'],
            ['Lipides', '60–70 g', '65–75 g', '~1 g/kg — hormonal'],
            ['Glucides', '300–350 g', '200–250 g', 'Variable selon charge'],
            ['Calories', '~2500–2700', '~2200–2400', 'Surplus S1-4, maintien S5-6'],
          ]}
        />
      </SectionCard>

      {/* Timing */}
      <SectionCard icon={Clock} title="Timing des repas">
        <DataTable
          headers={['Moment', 'Aliments', 'Objectif']}
          rows={[
            ['Pré (1-2h avant)', 'Glucides complexes + Protéines', 'Énergie & substrat'],
            ['Intra (optionnel)', 'Glucides rapides', 'Maintien glycémique'],
            ['Post (< 1h)', 'Whey + Glucides rapides', 'Récupération'],
          ]}
        />
      </SectionCard>

      {/* Hydratation & Suppléments */}
      <SectionCard icon={Droplets} title="Hydratation & Suppléments">
        <div className="mb-4 px-4 py-3 rounded-lg bg-accent/5 border border-accent/10">
          <p className="text-sm text-white/80">
            <span className="text-accent font-bold">3-4 L</span> jours d'entraînement
            <span className="text-muted mx-2">•</span>
            <span className="text-accent font-bold">2.5-3 L</span> jours de repos
          </p>
        </div>
        <DataTable
          headers={['Supplément', 'Dose', 'Timing']}
          rows={[
            ['Créatine monohydrate', '5 g/jour', 'N\'importe quel moment'],
            ['Caféine (optionnel)', '3-5 mg/kg', '30 min avant'],
            ['Vitamine D', '2000-4000 UI', 'Avec repas gras'],
            ['Magnésium', '300-400 mg', 'Le soir'],
          ]}
        />
      </SectionCard>

      <footer className="pt-4 pb-4 text-center">
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-40 italic">
          Adapte les quantités à ton poids de corps et tes objectifs
        </p>
      </footer>
    </div>
  )
}
