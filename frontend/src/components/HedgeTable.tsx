import type { HedgeParams, HedgeResult } from '../types/hedging'

const f = (x: number | null, d = 4) => (x === null ? '–' : x.toFixed(d))

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function HedgeTable({ params, res }: { params: HedgeParams; res: HedgeResult }) {
  return (
    <>
      <div className="card">
        <div className="stats">
          <Stat label="Premium received V₀" value={res.price.toFixed(4)} sub="invested in Δ shares + cash" />
          <Stat label="Portfolio at expiry Xₙ" value={res.final_portfolio.toFixed(4)} />
          <Stat label={`${params.kind === 'call' ? 'Call' : 'Put'} payoff owed`} value={res.payoff.toFixed(4)} />
          <Stat
            label="Largest gap |X − V|"
            value={res.max_gap.toExponential(1)}
            sub="rounding only: replication is exact at every step"
          />
        </div>
      </div>
      <div className="card">
        <h2>Replication along the path</h2>
        <p className="note">
          At each time the old shares are worth Δ·S′ and the old cash has grown by (1+r); that sum X is the new
          wealth. Then we rebalance to the tree's new Δ, paying for shares out of cash. Nothing is added or withdrawn.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Move</th>
                <th>Stock S</th>
                <th>Option V</th>
                <th>Portfolio X</th>
                <th>Shares Δ</th>
                <th>Cash</th>
              </tr>
            </thead>
            <tbody>
              {res.steps.map((s) => (
                <tr key={s.t}>
                  <td>{s.t}</td>
                  <td className={s.t === 0 ? '' : params.moves[s.t - 1] ? 'move-up' : 'exercise'}>
                    {s.t === 0 ? '–' : params.moves[s.t - 1] ? '▲' : '▼'}
                  </td>
                  <td>{f(s.stock, 2)}</td>
                  <td>{f(s.option)}</td>
                  <td>{f(s.portfolio)}</td>
                  <td>{f(s.delta)}</td>
                  <td>{f(s.cash)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          Shares equal Δ here because we rebalance at every step; in Step 10 they will differ when we rebalance less often.
        </p>
      </div>
    </>
  )
}
