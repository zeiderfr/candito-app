import type { ReactNode } from 'react'

export function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <p className="text-xs font-semibold text-muted">{children}</p>
    </div>
  )
}
