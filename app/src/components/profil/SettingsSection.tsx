import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCandito } from '@/context/CanditoContext'
import { useToasts } from '@/context/ToastContext'
import { NotificationSettings } from '@/components/common/NotificationSettings'
import { Settings2, Dumbbell, Database, Bell, ChevronRight, ChevronDown } from 'lucide-react'
import { SectionLabel } from './SectionLabel'

// ── SettingsRow ───────────────────────────────────────────────────────
function SettingsRow({
  icon, label, description, onClick, chevron = false, expanded = false, children,
}: {
  icon: ReactNode; label: string; description: string
  onClick: () => void; chevron?: boolean; expanded?: boolean; children?: ReactNode
}) {
  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group"
      >
        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted group-hover:text-white transition-colors shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[10px] text-muted">{description}</p>
        </div>
        {chevron ? (
          <ChevronRight size={18} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        ) : (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-muted" />
          </motion.div>
        )}
      </button>
      <AnimatePresence>
        {!chevron && expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden px-5 pb-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── SettingsSection ───────────────────────────────────────────────────
export function SettingsSection({ onGoToProgram }: { onGoToProgram: () => void }) {
  const { state, importState } = useCandito()
  const { showToast } = useToasts()
  const [openSection, setOpenSection] = useState<string | null>(null)
  const toggle = (id: string) => setOpenSection(v => v === id ? null : id)

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const filename = `candito-backup-${new Date().toISOString().split('T')[0]}.json`

    const triggerDownload = () => {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    if (navigator.share) {
      navigator.share({ title: 'Candito Backup', files: [new File([blob], filename)] })
        .catch(triggerDownload)
    } else {
      triggerDownload()
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed?.athlete && parsed?.progress) {
          importState(parsed)
          showToast({ message: 'Données importées avec succès.', duration: 5000 })
        } else {
          showToast({ message: 'Fichier invalide.', duration: 4000 })
        }
      } catch {
        showToast({ message: 'Impossible de lire ce fichier.', duration: 4000 })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <section className="space-y-3">
      <SectionLabel icon={<Settings2 size={14} />}>Paramètres</SectionLabel>

      <SettingsRow
        icon={<Dumbbell size={18} />}
        label="Personnaliser le programme"
        description="Modifie exercices, reps et séries de chaque semaine"
        onClick={onGoToProgram}
        chevron
      />

      <SettingsRow
        icon={<Bell size={18} />}
        label="Rappels d'entraînement"
        description="Notifications matinales et alertes de séance"
        onClick={() => toggle('notif')}
        expanded={openSection === 'notif'}
      >
        <div className="pt-2">
          <NotificationSettings />
        </div>
      </SettingsRow>

      <SettingsRow
        icon={<Database size={18} />}
        label="Sauvegarde des données"
        description="Exporter ou importer vos données JSON"
        onClick={() => toggle('backup')}
        expanded={openSection === 'backup'}
      >
        <div className="pt-3 space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 bg-white/5 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer"
          >
            Exporter les données
          </button>
          <label className="w-full py-3 bg-white/5 text-muted rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center justify-center">
            Importer un fichier
            <input type="file" accept=".json" onChange={handleImport} className="sr-only" />
          </label>
        </div>
      </SettingsRow>
    </section>
  )
}
