import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { UpdatePrompt } from '@/components/common/UpdatePrompt'
import { type TabId } from '@/components/layout/BottomNav'

/**
 * Main App Component — Candito 6-Week React Migration.
 * Orchesrates tabs and global layout.
 */
function App() {
  const [activeTab, setActiveTab] = useState<TabId>('accueil')

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':
        return <Dashboard />
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
            <h2 className="text-2xl font-display text-white opacity-40">
              Module en cours de migration...
            </h2>
            <p className="text-muted text-sm max-w-[280px]">
              L'écran <span className="text-accent font-bold uppercase">{activeTab}</span> sera disponible dans la Phase 2.
            </p>
          </div>
        )
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
