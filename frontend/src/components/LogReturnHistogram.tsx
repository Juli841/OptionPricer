import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GbmParams, GbmResult } from '../types/gbm'

type Row = { x: number; empirical: number; theoretical: number; paths: number }

const normalPdf = (x: number, m: number, s: number) =>
  Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

export default function LogReturnHistogram({ params, res }: { params: GbmParams; res: GbmResult }) {
  const { log_return_edges: edges, log_return_counts: counts } = res
  const m = res.theoretical_log_return_mean
  const s = res.theoretical_log_return_std
  const rows: Row[] = counts.map((c, i) => {
    const width = edges[i + 1] - edges[i]
    const x = (edges[i] + edges[i + 1]) / 2
    return { x, empirical: c / (params.paths * width), theoretical: normalPdf(x, m, s), paths: c }
  })

  return (
    <div className="card">
      <h2>Distribution of the log-return</h2>
      <p className="note">
        ln(S_T/S₀) is normal with mean (μ − σ²/2)·T = {m.toFixed(4)} and standard deviation σ·√T = {s.toFixed(4)}, which
        makes S_T lognormal. The orange curve is that normal density; the bars are the simulated density.
      </p>
      <div className="legend">
        <span><i className="key key-1" /> Simulated density</span>
        <span><i className="key key-2" /> Normal density</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              interval="preserveStartEnd"
              label={{ value: 'ln(S_T / S₀)', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(1)}
              width={44}
            />
            <Tooltip
              cursor={{ fill: 'var(--band)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as Row
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">ln(S_T/S₀) ≈ {r.x.toFixed(3)}</div>
                    <div>Simulated: {r.empirical.toFixed(3)} ({r.paths.toLocaleString()} paths)</div>
                    <div>Normal: {r.theoretical.toFixed(3)}</div>
                  </div>
                )
              }}
            />
            <Bar dataKey="empirical" fill="var(--series-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line
              dataKey="theoretical"
              stroke="var(--series-2)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--series-2)', stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
