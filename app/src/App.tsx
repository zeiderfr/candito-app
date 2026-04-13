import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Warmup } from '@/pages/Warmup'
import { Programme } from '@/pages/Programme'
import { Nutrition } from '@/pages/Nutrition'
import { Progres } from '@/pages/Progres'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'
import { type TabId } from '@/components/layout/BottomNav'
import { NavigationContext } from '@/context/NavigationContext'

/**
 * Main App Component — Candito 6-Week React Migration.
 * Phase 2: All 5 modules fully wired + NavigationContext for cross-tab CTA.
 */
import { CanditoProvider, useCandito } from '@/context/CanditoContext'

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('accueil')
  const { isLoading } = useCandito()
  const [showSplash, setShowSplash] = useState(true)

  // Double check loading state with a minimum duration for UI smoothness
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (showSplash) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <div className="size-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <h2 className="text-2xl font-display text-white italic">Initialisation...</h2>
        <p className="text-[10px] text-muted uppercase tracking-[0.2em] mt-2">Récupération de tes records</p>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':    return <Dashboard />
      case 'warmup':     return <Warmup />
      case 'programme':  return <Programme />
      case 'nutrition':  return <Nutrition />
      case 'progres':    return <Progres />
    }
  }

  return (
    <NavigationContext.Provider value={setActiveTab}>
      <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <UpdatePrompt />
        {renderContent()}
      </AppLayout>
    </NavigationContext.Provider>
  )
}

function App() {
  return (
    <CanditoProvider>
      <AppContent />
    </CanditoProvider>
  )
}

export default App
