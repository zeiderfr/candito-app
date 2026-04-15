import { createContext, useContext, useState, type ReactNode } from 'react'

interface ProfileContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ProfileContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
