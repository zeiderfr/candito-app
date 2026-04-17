import type { ReactNode } from 'react'

export function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{children}</p>
    </div>
  )
}
