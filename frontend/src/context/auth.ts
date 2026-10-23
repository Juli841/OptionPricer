import { createContext, useContext } from 'react'
import type { Credentials, RegisterData, User } from '../types/auth'

export type AuthState = {
  user: User | null
  loading: boolean // true until the first /me answer, so a guard doesn't redirect too early
  avatarUrl: string | null // null = no photo; the ?v= changes on every upload so the browser refetches
  login: (c: Credentials) => Promise<void>
  register: (c: RegisterData) => Promise<void>
  logout: () => Promise<void>
  setAvatar: (file: File) => Promise<void>
  clearAvatar: () => Promise<void>
  setUsername: (username: string) => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
