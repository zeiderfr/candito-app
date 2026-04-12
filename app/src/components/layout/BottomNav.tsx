import { cn } from '@/lib/utils'
import { Home, Zap, Calendar, Leaf, Activity } from 'lucide-react'

export type TabId = 'accueil' | 'warmup' | 'programme' | 'nutrition' | 'progres'

interface NavItem {
  id: TabId
  label: string
  icon: typeof Home
}

const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'warmup', label: 'Warm up', icon: Zap },
  { id: 'programme', label: 'Programme', icon: Calendar },
  { id: 'nutrition', label: 'Nutrition', icon: Leaf },
  { id: 'progres', label: 'Progrès', icon: Activity },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-30",
      "glass border-t border-border bg-background/80 backdrop-blur-xl",
      "pb-[env(safe-area-inset-bottom)] px-4"
    )}>
      <div className="max-w-[680px] mx-auto flex justify-between items-center h-20">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5",
                "min-w-16 h-full transition-all duration-200 cursor-pointer",
                isActive ? "text-accent" : "text-muted hover:text-white"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center size-11">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-transform duration-300",
                    isActive ? "scale-110" : "scale-100"
                  )}
                />
                {isActive && (
                    <div className="absolute -bottom-1 size-1 bg-accent rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-wider",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
