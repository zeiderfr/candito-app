import { type ReactNode, useRef } from 'react'
import { cn } from '@/lib/utils'
import { BottomNav, type TabId } from './BottomNav'
import { ProfileProvider } from '@/context/ProfileContext'
import { ProfileButton } from '@/components/common/ProfileButton'
import { ProfileSheet } from '@/components/common/ProfileSheet'

const TAB_ORDER: TabId[] = ['accueil', 'warmup', 'programme', 'nutrition', 'progres']

interface AppLayoutProps {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwipeDisabled = useRef(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    
    // Détecte si le touch commence sur un élément scrollable
    const target = e.target as HTMLElement
    isSwipeDisabled.current = !!(target.closest && target.closest('[data-no-swipe]'))
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSwipeDisabled.current) return

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    
    // Sensibilité modérée : minimum 90px pour changer d'onglet
    // Le geste doit être très horizontal (dx > dy * 2.5) pour éviter que le scroll 
    // diagonal ne déclenche un swipe
    if (Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 2.5) return
    const idx = TAB_ORDER.indexOf(activeTab)
    if (dx < 0 && idx < TAB_ORDER.length - 1) onTabChange(TAB_ORDER[idx + 1])
    else if (dx > 0 && idx > 0) onTabChange(TAB_ORDER[idx - 1])
  }

  return (
    <ProfileProvider>
      <div className="relative min-h-dvh flex flex-col bg-background font-sans">
        {/* Profile button — fixed top-right, respects iOS safe area */}
        <div
          className="fixed z-30 right-5"
          style={{ top: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.75rem))' }}
        >
          <ProfileButton />
        </div>

        <main
          className={cn(
            "flex-1 w-full max-w-[680px] mx-auto",
            "px-6 pt-16 pb-32 overflow-y-auto"
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />

        <ProfileSheet />
      </div>
    </ProfileProvider>
  )
}
