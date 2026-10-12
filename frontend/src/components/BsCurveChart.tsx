import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BsPage } from '../hooks/useBlackScholes'

export default function BsCurveChart({ page }: { page: BsPage }) {
  const { curve, params } = page

  return (
    <div className="card">
      <h2>Option value against the stock price</h2>
      <p className="note">
        The Black–Scholes {params.kind} price today (solid) against its payoff at maturity (dashed). The gap between
        them is the time value; it is largest near the strike and shrinks deep in or out of the money.
      </p>
      <div className="chart">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={curve} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="s0"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(0)}
              label={{ value: 'Stock price S₀', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(0)}
              width={44}
            />
            <ReferenceLine x={params.k} stroke="var(--muted)" strokeDasharray="2 4" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as { s0: number; price: number; payoff: number }
                return (
                  <div className="chart-tooltip">
                    <div className="chart-tooltip-title">S₀ = {d.s0.toFixed(2)}</div>
                    <div>Price: {d.price.toFixed(4)}</div>
                    <div>Payoff: {d.payoff.toFixed(4)}</div>
                  </div>
                )
              }}
              cursor={{ stroke: 'var(--muted)' }}
            />
            <Line dataKey="payoff" stroke="var(--muted)" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            <Line dataKey="price" stroke="var(--series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
