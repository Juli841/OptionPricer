import { useEffect, useState, type ReactNode } from 'react'
import * as api from '../api/auth'
import { AuthContext } from '../context/auth'
import type { Credentials, RegisterData, User } from '../types/auth'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(() => Date.now())

  useEffect(() => {
    api
      .fetchMe()
      .then(setUser)
      .catch(() => setUser(null)) // backend down: treat as logged out
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    avatarUrl: user?.has_avatar ? `/api/auth/avatar?v=${version}` : null,
    login: async (c: Credentials) => setUser(await api.login(c)),
    register: async (c: RegisterData) => setUser(await api.register(c)),
    logout: async () => {
      await api.logout()
      setUser(null)
    },
    setAvatar: async (file: File) => {
      setUser(await api.uploadAvatar(file))
      setVersion(Date.now())
    },
    clearAvatar: async () => setUser(await api.removeAvatar()),
    setUsername: async (username: string) => setUser(await api.updateUsername(username)),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
