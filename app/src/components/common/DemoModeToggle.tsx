import { motion } from 'framer-motion'
import { Beaker, ShieldAlert } from 'lucide-react'
import { useCanditoState } from '@/hooks/useCanditoState'
import { cn } from '@/lib/utils'

export function DemoModeToggle() {
  const { state, toggleDemoMode } = useCanditoState()
  const isDemo = state.isDemoMode

  return (
    <motion.button
      onClick={toggleDemoMode}
      initial={false}
      animate={{
        backgroundColor: isDemo ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 255, 255, 0.03)',
        borderColor: isDemo ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 255, 255, 0.08)',
      }}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl border transition-colors duration-500",
        "group cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "size-10 rounded-xl flex items-center justify-center transition-colors duration-500",
          isDemo ? "bg-danger text-white" : "bg-white/5 text-muted group-hover:text-white"
        )}>
          {isDemo ? <ShieldAlert size={20} /> : <Beaker size={20} />}
        </div>
        <div className="text-left">
          <p className={cn(
            "text-xs font-bold uppercase tracking-wider",
            isDemo ? "text-danger" : "text-white"
          )}>
            {isDemo ? "Mode Démonstration Actif" : "Mode Démonstration"}
          </p>
          <p className="text-[10px] text-muted font-medium mt-0.5">
            {isDemo 
              ? "Données fictives — Vos données réelles sont en sécurité." 
              : "Tester l'application sans impacter vos données."}
          </p>
        </div>
      </div>

      <div className={cn(
        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-500",
        isDemo 
          ? "bg-danger text-white shadow-lg shadow-danger/20" 
          : "bg-white/5 text-muted group-hover:bg-white/10 group-hover:text-white"
      )}>
        {isDemo ? "Désactiver" : "Essayer"}
      </div>
    </motion.button>
  )
}
