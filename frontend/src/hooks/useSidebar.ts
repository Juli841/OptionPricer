import { useEffect, useState } from 'react'

export function useSidebar() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('sidebar') !== 'closed'
    } catch {
      return true // storage blocked: default to open
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sidebar', open ? 'open' : 'closed')
    } catch {
      // not persisted, still works for this visit
    }
  }, [open])

  return { open, toggle: () => setOpen((o) => !o) }
}
