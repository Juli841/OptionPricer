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
            <div>
              <h1>Option Pricer</h1>
              <small>binomial model</small>
            </div>
            <button
              type="button"
              className="ghost collapse"
              onClick={sidebar.toggle}
              aria-label="Hide sidebar"
              aria-expanded
            >
              ‹
            </button>
          </div>
          <nav>
            <span className="nav-heading">Pricing</span>
            <NavLink to="/european">European</NavLink>
            <NavLink to="/american">American</NavLink>
            <span className="nav-heading">Simulation</span>
            <NavLink to="/paths">Paths</NavLink>
            <NavLink to="/hedging">Hedging</NavLink>
            <span className="nav-heading">Continuous time</span>
            <NavLink to="/continuous">GBM</NavLink>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </aside>
      )}
      <main>
        {!sidebar.open && (
          <button
            type="button"
            className="ghost edge-tab"
            onClick={sidebar.toggle}
            aria-label="Show sidebar"
            aria-expanded={false}
          >
            ›
          </button>
        )}
        <Outlet />
      </main>
    </div>
  )
}
