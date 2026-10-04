import { NavLink, Outlet } from 'react-router-dom'
import { useSidebar } from '../hooks/useSidebar'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { theme, toggle } = useTheme()
  const sidebar = useSidebar()

  return (
    <div className={sidebar.open ? 'app' : 'app collapsed'}>
      {sidebar.open && (
        <aside className="sidebar">
          <div className="brand">
            <h1>Option Pricer</h1>
            <small>binomial model</small>
          </div>
          <nav>
            <span className="nav-heading">Pricing</span>
            <NavLink to="/european">European</NavLink>
            <NavLink to="/american">American</NavLink>
            <span className="nav-heading">Simulation</span>
            <NavLink to="/paths">Paths</NavLink>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </aside>
      )}
      <main>
        <div className="topbar">
          <button
            type="button"
            className="ghost"
            onClick={sidebar.toggle}
            aria-label={sidebar.open ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebar.open}
          >
            {sidebar.open ? '« Hide menu' : '☰ Menu'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
