import type { BsPage } from '../hooks/useBlackScholes'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function BsStats({ page }: { page: BsPage }) {
  const { bs, crr, mc } = page
  const inside = mc !== null && bs.price >= mc.ci_low && bs.price <= mc.ci_high

  return (
    <div className="card">
      <div className="stats">
        <Stat label="Black–Scholes price" value={bs.price.toFixed(4)} sub="closed form" />
        <Stat label="d₁" value={bs.d1.toFixed(4)} sub="[ln(S₀/K) + (r + σ²/2)T] / (σ√T)" />
        <Stat label="d₂" value={bs.d2.toFixed(4)} sub="d₁ − σ√T" />
        <Stat label="N(d₁)" value={bs.nd1.toFixed(4)} sub="call hedge ratio (delta)" />
        <Stat label="N(d₂)" value={bs.nd2.toFixed(4)} sub="risk-neutral probability of finishing in the money" />
      </div>
      <h2>Convergence check</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>Method</th><th>Price</th><th>Difference from BS</th></tr>
          </thead>
          <tbody>
            <tr><td>Black–Scholes</td><td>{bs.price.toFixed(4)}</td><td>—</td></tr>
            {crr !== null && (
              <tr><td>CRR tree (n = 1000)</td><td>{crr.toFixed(4)}</td><td>{(crr - bs.price).toFixed(4)}</td></tr>
            )}
            {mc !== null && (
              <tr>
                <td>Monte Carlo (M = {mc.paths.toLocaleString()})</td>
                <td>{mc.price.toFixed(4)} ± {(1.96 * mc.std_error).toFixed(4)}</td>
                <td>
                  {(mc.price - bs.price).toFixed(4)} ({inside ? 'BS inside the interval' : 'BS outside the interval'})
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
