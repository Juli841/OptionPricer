import type { Credentials, RegisterData, User } from '../types/auth'
import { post } from './gbm'
import { errorMessage } from './simulation'

export const register = (c: RegisterData) => post<User>('/api/auth/register', c)
export const login = (c: Credentials) => post<User>('/api/auth/login', c)

// null = not logged in (401); any other failure is a real error
export async function fetchMe(): Promise<User | null> {
  const r = await fetch('/api/auth/me')
  if (r.status === 401) return null
  if (!r.ok) throw new Error('could not check the session')
  return r.json()
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' })
}

// no Content-Type header: the browser sets the multipart boundary itself
export async function uploadAvatar(file: File): Promise<User> {
  const body = new FormData()
  body.append('file', file)
  let r: Response
  try {
    r = await fetch('/api/auth/avatar', { method: 'POST', body })
  } catch {
    throw new Error('backend unreachable')
  }
  const data = await r.json()
  if (!r.ok) throw new Error(errorMessage(data.detail))
  return data
}

export async function updateUsername(username: string): Promise<User> {
  let r: Response
  try {
    r = await fetch('/api/auth/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
  } catch {
    throw new Error('backend unreachable')
  }
  const data = await r.json()
  if (!r.ok) throw new Error(errorMessage(data.detail))
  return data
}

export async function removeAvatar(): Promise<User> {
  const r = await fetch('/api/auth/avatar', { method: 'DELETE' })
  if (!r.ok) throw new Error('could not remove the photo')
  return r.json()
}
