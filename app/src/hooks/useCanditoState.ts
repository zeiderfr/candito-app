import { useCandito } from '../context/CanditoContext'

/**
 * useCanditoState — Legacy wrapper for the global CanditoContext.
 * Permet de conserver la compatibilité avec les imports existants.
 */
export function useCanditoState() {
  return useCandito()
}
