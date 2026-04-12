import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BottomNav, type TabId } from './BottomNav'

interface AppLayoutProps {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <div className="relative min-h-dvh flex flex-col bg-background font-sans">
      <main className={cn(
        "flex-1 w-full max-w-[680px] mx-auto",
        "px-6 pt-12 pb-32 overflow-y-auto"
      )}>
        {children}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
