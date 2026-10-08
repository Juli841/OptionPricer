import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { GbmParams, GbmResult } from '../types/gbm'

type Row = Record<string, number>

const MAX_POINTS = 200

export default function GbmPathsChart({ params, res }: { params: GbmParams; res: GbmResult }) {
  const { s0, mu } = params
  // draw at most ~MAX_POINTS time points per line: 50 lines x 1000 points makes the chart crawl
  const stride = Math.ceil(res.times.length / MAX_POINTS)
  const keep = res.times.map((_, k) => k).filter((k) => k % stride === 0 || k === res.times.length - 1)
  // expected path s0 * e^{mu t}
  const rows: Row[] = keep.map((k) => {
    const t = res.times[k]
    const row: Row = { t, mean: s0 * Math.exp(mu * t) }
    res.sample_paths.forEach((path, i) => {
      row[`p${i}`] = path[k]
    })
    return row
  })

  return (
    <div className="card">
      <h2>Sample paths</h2>
      <p className="note">
        {res.sample_paths.length} of the {params.paths.toLocaleString()} simulated paths. They are exact GBM draws,
        S(t+Δt) = S(t)·exp((μ − σ²/2)Δt + σ√Δt·Z), so prices stay positive. The black line is the expected path
        S₀·e^(μt).
      </p>
      <div className="legend">
        <span><i className="key key-1" /> Simulated path</span>
        <span><i className="key key-ink" /> Expected path</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 'dataMax']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(2)}
              label={{ value: 'Time (years)', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(0)}
              width={48}
            />
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">t = {Number(label).toFixed(3)} years</div>
                    <div>Expected: {(payload[0].payload as Row).mean.toFixed(2)}</div>
                  </div>
                ) : null
              }
              cursor={{ stroke: 'var(--muted)' }}
            />
            {res.sample_paths.map((_, i) => (
              <Line
                key={i}
                dataKey={`p${i}`}
                dot={false}
                activeDot={false}
                stroke="var(--series-1)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            ))}
            <Line
              dataKey="mean"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--text)', stroke: 'var(--card)', strokeWidth: 2 }}
              stroke="var(--text)"
              strokeWidth={2.5}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
