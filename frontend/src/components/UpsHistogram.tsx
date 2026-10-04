import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SimulationParams, SimulationResult } from '../types/simulation'
import { binomialPmf } from '../utils/binomial'

type Row = { ups: number; price: number; empirical: number; theoretical: number; paths: number }

const pct = (x: number) => `${(x * 100).toFixed(2)}%`

function UpsTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{r.ups} ups → Sₙ = {r.price.toFixed(2)}</div>
      <div>Simulated: {pct(r.empirical)} ({r.paths.toLocaleString()} paths)</div>
      <div>Binomial theory: {pct(r.theoretical)}</div>
    </div>
  )
}

export default function UpsHistogram({ params, res }: { params: SimulationParams; res: SimulationResult }) {
  const { s0, u, d, n, paths } = params
  const pmf = binomialPmf(n, res.p)
  const rows: Row[] = res.ups_counts.map((count, j) => ({
    ups: j,
    price: s0 * u ** j * d ** (n - j),
    empirical: count / paths,
    theoretical: pmf[j],
    paths: count,
  }))

  return (
    <div className="card">
      <h2>Distribution of the number of up-moves</h2>
      <p className="note">
        Sₙ depends only on the number of ups j, so the histogram of j is the distribution of the final price. The
        orange curve is the exact Binomial({n}, {res.p.toFixed(3)}) probability of each j.
      </p>
      <div className="legend">
        <span><i className="key key-1" /> Simulated share of paths</span>
        <span><i className="key key-2" /> Binomial probability</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="ups"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              interval="preserveStartEnd"
              label={{ value: 'Number of up-moves j', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              width={44}
            />
            <Tooltip content={<UpsTooltip />} cursor={{ fill: 'var(--band)' }} />
            <Bar
              dataKey="empirical"
              fill="var(--series-1)"
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Line
              dataKey="theoretical"
              stroke="var(--series-2)"
              strokeWidth={2}
              dot={n <= 20 ? { r: 4, fill: 'var(--series-2)', stroke: 'var(--card)', strokeWidth: 2 } : false}
              activeDot={{ r: 4, fill: 'var(--series-2)', stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>Table view</summary>
        <div className="table-scroll tall">
          <table>
            <thead>
              <tr><th>Ups j</th><th>Sₙ</th><th>Paths</th><th>Simulated</th><th>Binomial</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ups}>
                  <td>{r.ups}</td>
                  <td>{r.price.toFixed(2)}</td>
                  <td>{r.paths.toLocaleString()}</td>
                  <td>{pct(r.empirical)}</td>
                  <td>{pct(r.theoretical)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
