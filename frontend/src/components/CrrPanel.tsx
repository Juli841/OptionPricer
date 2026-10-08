import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CrrRow, Kind } from '../types/gbm'

export default function CrrPanel({ rows, kind }: { rows: CrrRow[]; kind: Kind }) {
  const ok = rows.filter((r) => r.res)
  const data = ok.map((r) => ({ n: r.n, price: r.res!.price }))
  const last = ok.at(-1)

  return (
    <div className="card">
      <h2>CRR tree: the binomial model approaching GBM</h2>
      <p className="note">
        With Δt = T/n, u = e^(σ√Δt), d = 1/u and a per-step rate e^(rΔt) − 1, the binomial tree converges to geometric
        Brownian motion as n grows. The European {kind} price below is the existing tree engine run on these parameters,
        so it should settle to a single value. Small trees can be rejected when the drift beats the volatility.
      </p>
      {last?.res && (
        <p>
          Price at n = {last.n}: <strong>{last.res.price.toFixed(4)}</strong>
        </p>
      )}
      <div className="chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="n"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              label={{ value: 'Tree steps n', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              width={52}
            />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">n = {(payload[0].payload as { n: number }).n}</div>
                    <div>Price: {(payload[0].payload as { price: number }).price.toFixed(4)}</div>
                  </div>
                ) : null
              }
              cursor={{ stroke: 'var(--muted)' }}
            />
            <Line
              dataKey="price"
              stroke="var(--series-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--series-1)', stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>Table view</summary>
        <div className="table-scroll tall">
          <table>
            <thead>
              <tr><th>n</th><th>u</th><th>d</th><th>q</th><th>Price</th></tr>
            </thead>
            <tbody>
              {rows.map((r) =>
                r.res ? (
                  <tr key={r.n}>
                    <td>{r.n}</td>
                    <td>{r.res.params.u.toFixed(5)}</td>
                    <td>{r.res.params.d.toFixed(5)}</td>
                    <td>{r.res.params.q.toFixed(4)}</td>
                    <td>{r.res.price.toFixed(4)}</td>
                  </tr>
                ) : (
                  <tr key={r.n}>
                    <td>{r.n}</td>
                    <td colSpan={4}>{r.error}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
