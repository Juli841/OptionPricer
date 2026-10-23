import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth'
import { useSidebar } from '../hooks/useSidebar'
import { useTheme } from '../hooks/useTheme'
import Avatar from './Avatar'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { theme, toggle } = useTheme()
  const sidebar = useSidebar()
  const { user, avatarUrl } = useAuth()
  // login and register stand alone: no navigation menu
  const bare = ['/login', '/register'].includes(useLocation().pathname)
  const showSidebar = sidebar.open && !bare

  return (
    <>
      <header className="topbar">
        {!bare && (
          <button
            type="button"
            className="ghost menu"
            onClick={sidebar.toggle}
            aria-label={sidebar.open ? 'Hide sidebar' : 'Show sidebar'}
            aria-expanded={sidebar.open}
          >
            ☰
          </button>
        )}
        <NavLink to="/" end className="topbar-home" aria-label="Home" title="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 11 12 3.5 20.5 11" />
            <path d="M5.5 9.5V20h13V9.5" />
            <path d="M10 20v-5.5h4V20" />
          </svg>
        </NavLink>
        <h1>
          <Link to="/" className="brand-link">Option Pricer</Link>
        </h1>
        <div className="topbar-right">
          <ThemeToggle theme={theme} onToggle={toggle} />
          <Link
            className={user ? 'topbar-user signed-in' : 'topbar-user'}
            to={user ? '/account' : '/login'}
            aria-label={user ? `Account (${user.username ?? user.email})` : 'Log in'}
            title={user ? (user.username ?? user.email) : 'Log in'}
          >
            {user && avatarUrl ? (
              <Avatar src={avatarUrl} name={user.username ?? user.email} size={30} />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="9.5" r="3.2" />
                <path d="M5.8 18.6c1.4-2.4 3.7-3.6 6.2-3.6s4.8 1.2 6.2 3.6" strokeLinecap="round" />
              </svg>
            )}
          </Link>
        </div>
      </header>
      <div className={showSidebar ? 'app' : 'app collapsed'}>
        {showSidebar && (
          <aside className="sidebar">
            <nav>
              <span className="nav-heading">Pricing</span>
              <NavLink to="/european">European</NavLink>
              <NavLink to="/american">American</NavLink>
              <span className="nav-heading">Simulation</span>
              <NavLink to="/paths">Paths</NavLink>
              <NavLink to="/hedging">Hedging</NavLink>
              <span className="nav-heading">Continuous time</span>
              <NavLink to="/continuous">GBM</NavLink>
              <span className="nav-heading">Monte Carlo</span>
              <NavLink to="/montecarlo">Pricing</NavLink>
              <span className="nav-heading">Closed form</span>
              <NavLink to="/blackscholes">Black–Scholes</NavLink>
            </nav>
          </aside>
        )}
        <main>
          <Outlet />
        </main>
      </div>
    </>
  )
}
