import { useCanditoState } from '@/hooks/useCanditoState'
import { useProfile } from '@/context/ProfileContext'
import { cn } from '@/lib/utils'

export function ProfileButton() {
  const { state } = useCanditoState()
  const { open } = useProfile()

  const initials = state.athlete.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      onClick={open}
      aria-label="Profil et personnalisation du programme"
      className={cn(
        'size-9 rounded-full bg-accent/10 border border-accent/20',
        'flex items-center justify-center shrink-0',
        'text-accent text-[11px] font-bold',
        'hover:bg-accent/20 transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
      )}
    >
      {initials}
    </button>
  )
}
