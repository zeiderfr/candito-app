import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  sessionKey: string | null
  savedSets: number
}

/**
 * SessionErrorBoundary — Filet de sécurité pour FocusMode.
 *
 * Un crash React pendant une séance affiche un panneau de récupération
 * contextuel au lieu d'un écran blanc. Lit les données sauvées dans
 * localStorage (candito_session_*) pour informer l'athlète.
 *
 * Class component obligatoire : seul moyen de catcher les erreurs de rendu React.
 */
export class SessionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, sessionKey: null, savedSets: 0 }
  }

  static getDerivedStateFromError(): Partial<State> {
    // Cherche une session en cours dans localStorage
    const key = Object.keys(localStorage).find(k => k.startsWith('candito_session_'))
    if (!key) return { hasError: true, sessionKey: null, savedSets: 0 }

    try {
      const data = JSON.parse(localStorage.getItem(key) ?? '{}')
      const totalSets = Object.values(data.setLogs ?? {}).flat().length
      return { hasError: true, sessionKey: key, savedSets: totalSets }
    } catch {
      return { hasError: true, sessionKey: key, savedSets: 0 }
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SessionErrorBoundary] Crash FocusMode:', error, info.componentStack)
  }

  handleRecover = () => {
    // Reload → ResumeBanner détectera la session sauvegardée
    window.location.reload()
  }

  handleDiscard = () => {
    if (this.state.sessionKey) {
      localStorage.removeItem(this.state.sessionKey)
    }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const { savedSets } = this.state

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-xl"
        style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top))' }}
      >
        <div className="glass w-full max-w-[340px] p-8 rounded-[32px] border border-white/10 shadow-3xl text-center space-y-6 animate-slam">
          {/* Icon */}
          <div className="mx-auto size-16 rounded-3xl bg-accent/10 flex items-center justify-center text-accent">
            <AlertTriangle size={32} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-display text-white italic">Interruption inattendue</h2>
            <p className="text-muted text-sm leading-relaxed">
              {savedSets > 0
                ? `${savedSets} série${savedSets > 1 ? 's' : ''} enregistrée${savedSets > 1 ? 's' : ''} avant l'arrêt. Tes données sont intactes.`
                : "Un problème est survenu pendant la séance."
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleRecover}
              className="w-full py-5 bg-accent hover:bg-accent-hover active:scale-95 text-background text-[12px] font-bold uppercase tracking-widest rounded-pill transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={14} />
              Reprendre la séance
            </button>

            <button
              onClick={this.handleDiscard}
              className="w-full py-4 bg-white/5 hover:bg-white/10 active:scale-95 text-muted hover:text-white text-[11px] font-bold uppercase tracking-widest rounded-pill transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 size={12} />
              Abandonner
            </button>
          </div>
        </div>
      </div>
    )
  }
}
