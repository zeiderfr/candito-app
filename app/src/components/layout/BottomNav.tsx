import { cn } from '@/lib/utils'
import { Home, Zap, Calendar, Leaf, User } from 'lucide-react'
import { motion } from 'framer-motion'

export type TabId = 'accueil' | 'warmup' | 'programme' | 'nutrition' | 'profil'

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
  { id: 'profil', label: 'Profil', icon: User },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (id: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-30",
      "border-t border-border bg-background/90 backdrop-blur-xl",
      "pb-[env(safe-area-inset-bottom)] px-4"
    )}>
      <div className="max-w-[680px] mx-auto flex justify-between items-center h-20">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5",
                "min-w-16 h-full transition-colors duration-200 cursor-pointer",
                isActive ? "text-accent" : "text-muted hover:text-white"
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center size-11">
                <Icon
                  size={24}
                  strokeWidth={2}
                  className="transition-colors duration-200"
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
