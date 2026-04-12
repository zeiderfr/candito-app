import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Warmup } from '@/pages/Warmup'
import { Programme } from '@/pages/Programme'
import { Nutrition } from '@/pages/Nutrition'
import { Progres } from '@/pages/Progres'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'
import { type TabId } from '@/components/layout/BottomNav'

/**
 * Main App Component — Candito 6-Week React Migration.
 * Phase 2: All 5 modules fully wired.
 */
function App() {
  const [activeTab, setActiveTab] = useState<TabId>('accueil')

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
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <UpdatePrompt />
      {renderContent()}
    </AppLayout>
  )
}

export default App
