import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProfilInlineTextField({
  value, onSave, placeholder, textClass,
}: {
  value: string; onSave: (v: string) => void; placeholder?: string; textClass?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleBlur = () => {
    onSave(draft)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className={cn(
          'text-left w-full cursor-pointer hover:text-accent transition-colors',
          value ? textClass : 'text-muted/40 text-sm italic',
        )}
      >
        {value || placeholder}
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={e => e.key === 'Enter' && handleBlur()}
      className="w-full bg-accent/5 border-b-2 border-accent/60 px-3 py-2 text-base text-white focus:outline-none transition-all"
    />
  )
}
