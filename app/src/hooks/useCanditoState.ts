import { useCandito, type CanditoContextType } from '../context/CanditoContext'

/**
 * useCanditoState — Legacy wrapper for the global CanditoContext.
 * Permet de conserver la compatibilité avec les imports existants.
 */
export function useCanditoState(): CanditoContextType {
  return useCandito()
}
