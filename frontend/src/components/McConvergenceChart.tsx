import {
  Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { McResult } from '../types/montecarlo'

export default function McConvergenceChart({ res, reference }: { res: McResult; reference: number | null }) {
  const data = res.checkpoints.map((m, i) => {
    const p = res.running_price[i]
    const half = 1.96 * res.running_std_error[i]
    return { m, price: p, band: [p - half, p + half] as [number, number], half, se: res.running_std_error[i] }
  })

  return (
    <div className="card">
      <h2>Convergence</h2>
      <p className="note">
        The estimate after the first m simulations, with its 95% confidence band. The band narrows like 1/√m: a hundred
        times more simulations buy one more digit of accuracy, not a hundred.
      </p>
      <div className="chart">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="m"
              type="number"
              scale="log"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              tickFormatter={(v: number) => v.toLocaleString()}
              label={{ value: 'Simulations m (log scale)', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
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
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as (typeof data)[number]
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">m = {d.m.toLocaleString()}</div>
                    <div>Price: {d.price.toFixed(4)}</div>
                    <div>± {d.half.toFixed(4)} (95%)</div>
                  </div>
                )
              }}
              cursor={{ stroke: 'var(--muted)' }}
            />
            <Area dataKey="band" stroke="none" fill="var(--series-1)" fillOpacity={0.18} isAnimationActive={false} />
            <Line dataKey="price" stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
            {reference !== null && (
              <ReferenceLine
                y={reference}
                stroke="var(--series-2)"
                strokeDasharray="5 4"
                ifOverflow="extendDomain"
                label={{ value: 'CRR tree n = 1000', position: 'insideTopRight', fill: 'var(--muted)', fontSize: 12 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>Table view</summary>
        <div className="table-scroll tall">
          <table>
            <thead>
              <tr><th>m</th><th>Price</th><th>Std error</th></tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.m}>
                  <td>{d.m.toLocaleString()}</td>
                  <td>{d.price.toFixed(4)}</td>
                  <td>{d.se.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
