/**
 * NavigationContext — Permet à n'importe quel composant de changer d'onglet
 * sans prop drilling. Utilisé par NextSessionHero pour les CTA.
 */
import { createContext, useContext } from 'react'
import { type TabId } from '@/components/layout/BottomNav'

export const NavigationContext = createContext<(tab: TabId) => void>(() => {})

export const useNavigation = () => useContext(NavigationContext)
