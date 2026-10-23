import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth'

const TOOLS = [
  { to: '/european', title: 'European', text: 'Price on a binomial tree, step by step.' },
  { to: '/american', title: 'American', text: 'The same tree, with early exercise.' },
  { to: '/paths', title: 'Paths', text: 'Simulate sample paths and see where they end.' },
  { to: '/hedging', title: 'Hedging', text: 'The replicating portfolio along a path.' },
  { to: '/continuous', title: 'GBM', text: 'The continuous-time limit of the tree.' },
  { to: '/montecarlo', title: 'Monte Carlo', text: 'Price by simulation and watch it converge.' },
  { to: '/blackscholes', title: 'Black–Scholes', text: 'The closed form, checked against the other methods.' },
]

export default function WelcomePage() {
  const { user, loading } = useAuth()

  return (
    <>
      <section className="hero">
        <h1>{user ? `Welcome back, ${user.username ?? user.email}` : 'Option Pricer'}</h1>
        <p className="hero-sub">
          Price an option with a binomial tree, a simulation or the Black–Scholes formula, and see how the answers agree.
        </p>
        {!loading && (
          <div className="hero-actions">
            {user ? (
              <Link to="/european" className="button primary">Open the pricer</Link>
            ) : (
              <>
                <Link to="/register" className="button primary">Create account</Link>
                <Link to="/login" className="button">Log in</Link>
              </>
            )}
          </div>
        )}
      </section>
      <section className="tools" aria-label="Pricing tools">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="card tool">
            <h2>{t.title}</h2>
            <p className="note">{t.text}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
