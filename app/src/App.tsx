import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Warmup } from '@/pages/Warmup'
import { Programme } from '@/pages/Programme'
import { Nutrition } from '@/pages/Nutrition'
import { Progres } from '@/pages/Progres'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'
import { type TabId } from '@/components/layout/BottomNav'
import { NavigationContext } from '@/context/NavigationContext'
import { CanditoProvider, useCandito } from '@/context/CanditoContext'
import { ToastProvider } from '@/context/ToastContext'

const TAB_ORDER: TabId[] = ['accueil', 'warmup', 'programme', 'nutrition', 'progres']

const pageVariants = {
  enter: (d: number) => ({ x: d * 24, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('accueil')
  const [direction, setDirection] = useState(0)
  const { isLoading } = useCandito()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const handleTabChange = (id: TabId) => {
    const d = TAB_ORDER.indexOf(id) > TAB_ORDER.indexOf(activeTab) ? 1 : -1
    setDirection(d)
    setActiveTab(id)
  }

  if (showSplash) {
    return (
      <div
        className="min-h-dvh bg-background flex flex-col p-6 animate-in fade-in duration-500"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
      >
        <div className="animate-shimmer h-11 w-44 rounded-xl mb-2" />
        <div className="animate-shimmer h-3 w-28 rounded-lg mb-8" />
        <div className="animate-shimmer h-28 rounded-2xl mb-4" />
        <div className="animate-shimmer h-20 rounded-2xl mb-4" />
        <div className="animate-shimmer h-40 rounded-2xl mb-4" />
        <div className="animate-shimmer h-24 rounded-2xl" />
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
    <NavigationContext.Provider value={handleTabChange}>
      <AppLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <UpdatePrompt />
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </AppLayout>
    </NavigationContext.Provider>
  )
}

function App() {
  return (
    <CanditoProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </CanditoProvider>
  )
}

export default App
