import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { theme, toggle } = useTheme()

  return (
    <main>
      <header>
        <h1>Option Pricer <small>binomial model</small></h1>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>
      <nav>
        <NavLink to="/european">European</NavLink>
        <NavLink to="/american">American</NavLink>
      </nav>
      <Outlet />
    </main>
  )
}
