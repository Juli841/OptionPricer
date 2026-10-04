import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SimulationParams, SimulationResult } from '../types/simulation'

type Mode = 'centered' | 'price'

// one row per step. `mean` is always the expected PRICE s0 * m^t, m = p*u + (1-p)*d.
// `expected` and p0..pK are what gets drawn: price - mean in centered mode, the price itself otherwise.
type Row = Record<string, number>

const signed = (v: number, digits = 2) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`

function buildRows(params: SimulationParams, res: SimulationResult, mode: Mode): Row[] {
  const { s0, u, d, n } = params
  const m = res.p * u + (1 - res.p) * d
  return Array.from({ length: n + 1 }, (_, t) => {
    const mean = s0 * m ** t
    const shift = mode === 'centered' ? mean : 0
    const row: Row = { step: t, mean, expected: mean - shift }
    res.sample_paths.forEach((path, i) => {
      row[`p${i}`] = path[t] - shift
    })
    return row
  })
}

// min / median / max of the sample PRICES at one step, whatever the mode
function summarise(row: Row, mode: Mode) {
  const offset = mode === 'centered' ? row.mean : 0
  const prices = Object.entries(row)
    .filter(([k]) => k.startsWith('p'))
    .map(([, v]) => v + offset)
    .sort((a, b) => a - b)
  return { min: prices[0], median: prices[Math.floor(prices.length / 2)], max: prices[prices.length - 1] }
}

// diverging colour by where the path ENDS relative to the mean: blue above, red below, gray near it
function pathColour(finalGap: number, maxGap: number): string {
  const share = Math.min(Math.abs(finalGap) / maxGap, 1) * 100
  return `color-mix(in srgb, var(${finalGap >= 0 ? '--div-pos' : '--div-neg'}) ${share}%, var(--div-mid))`
}

type TooltipProps = {
  active?: boolean
  payload?: { payload: Row }[]
  label?: number
  mode?: Mode
  selected?: number | null
}

function PathsTooltip({ active, payload, label, mode, selected }: TooltipProps) {
  if (!active || !payload?.length || !mode) return null
  const row = payload[0].payload
  const s = summarise(row, mode)
  const offset = mode === 'centered' ? row.mean : 0
  const vs = (price: number) => (mode === 'centered' ? ` (${signed(price - row.mean)})` : '')
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">Step {label}</div>
      <div>Expected (mean): {row.mean.toFixed(2)}</div>
      <div>Min {s.min.toFixed(2)}{vs(s.min)}</div>
      <div>Median {s.median.toFixed(2)}{vs(s.median)}</div>
      <div>Max {s.max.toFixed(2)}{vs(s.max)}</div>
      {selected != null && (
        <div className="chart-tooltip-title">
          Path {selected + 1}: {(row[`p${selected}`] + offset).toFixed(2)}{vs(row[`p${selected}`] + offset)}
        </div>
      )}
    </div>
  )
}

export default function PathsChart({ params, res }: { params: SimulationParams; res: SimulationResult }) {
  const [mode, setMode] = useState<Mode>('centered')
  const [selected, setSelected] = useState<number | null>(null)
  const rows = buildRows(params, res, mode)
  const last = rows[rows.length - 1]

  // how far each path ends from the mean price (colour) and the biggest drift either way (axis)
  const finalGaps = res.sample_paths.map((path) => path[params.n] - last.mean)
  const maxGap = Math.max(...finalGaps.map(Math.abs), 1e-9)
  const bound = Math.max(
    1,
    Math.ceil(Math.max(...rows.flatMap((r) => res.sample_paths.map((_, i) => Math.abs(r[`p${i}`]))))),
  )

  // the selected path is drawn last among the paths so it sits on top
  const order = res.sample_paths.map((_, i) => i).filter((i) => i !== selected)
  if (selected !== null) order.push(selected)

  return (
    <div className="card">
      <h2>Sample paths</h2>
      <p className="note">
        {res.sample_paths.length} of the {params.paths.toLocaleString()} simulated paths, coloured by where they end
        relative to the mean. {mode === 'centered'
          ? 'Each path is drawn as its distance from the expected path S₀·(p·u + (1−p)·d)ᵗ, so the mean is the flat line at 0.'
          : 'Actual prices, with the expected path S₀·(p·u + (1−p)·d)ᵗ drawn through them.'}{' '}
        Click a path, or pick one below, to highlight it.
      </p>
      <div className="controls">
        <div className="segmented" role="group" aria-label="Chart view">
          <button type="button" className={mode === 'centered' ? 'on' : ''} onClick={() => setMode('centered')}>
            Centered on the mean
          </button>
          <button type="button" className={mode === 'price' ? 'on' : ''} onClick={() => setMode('price')}>
            Price
          </button>
        </div>
        <label className="pick">
          <span>Highlight</span>
          <select
            value={selected ?? ''}
            onChange={(e) => setSelected(e.target.value === '' ? null : +e.target.value)}
          >
            <option value="">None</option>
            {res.sample_paths.map((path, i) => (
              <option key={i} value={i}>
                Path {i + 1} (ends at {path[params.n].toFixed(2)})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="legend">
        <span><i className="key key-pos" /> Ends above the mean</span>
        <span><i className="key key-mid" /> Ends near it</span>
        <span><i className="key key-neg" /> Ends below the mean</span>
        <span><i className="key key-ink" /> Expected path (mean)</span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis
              dataKey="step"
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              label={{ value: 'Step', position: 'insideBottom', offset: -2, fill: 'var(--muted)', fontSize: 12 }}
              height={36}
            />
            <YAxis
              domain={mode === 'centered' ? [-bound, bound] : ['auto', 'auto']}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (mode === 'centered' ? signed(v, 0) : v.toFixed(0))}
              width={48}
            />
            <Tooltip content={<PathsTooltip mode={mode} selected={selected} />} cursor={{ stroke: 'var(--muted)' }} />
            {order.map((i) => {
              const picked = i === selected
              const dimmed = selected !== null && !picked
              return (
                <Line
                  key={i}
                  dataKey={`p${i}`}
                  dot={false}
                  activeDot={false}
                  stroke={pathColour(finalGaps[i], maxGap)}
                  strokeOpacity={picked ? 1 : dimmed ? 0.15 : 0.65}
                  strokeWidth={picked ? 3 : 1.5}
                  isAnimationActive={false}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(picked ? null : i)}
                />
              )
            })}
            <Line
              dataKey="expected"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--text)', stroke: 'var(--card)', strokeWidth: 2 }}
              stroke="var(--text)"
              strokeWidth={2.5}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details>
        <summary>Table view (prices)</summary>
        <div className="table-scroll tall">
          <table>
            <thead>
              <tr><th>Step</th><th>Expected</th><th>Min</th><th>Median</th><th>Max</th>{selected !== null && <th>Path {selected + 1}</th>}</tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const s = summarise(row, mode)
                const offset = mode === 'centered' ? row.mean : 0
                return (
                  <tr key={row.step}>
                    <td>{row.step}</td>
                    <td>{row.mean.toFixed(2)}</td>
                    <td>{s.min.toFixed(2)}</td>
                    <td>{s.median.toFixed(2)}</td>
                    <td>{s.max.toFixed(2)}</td>
                    {selected !== null && <td>{(row[`p${selected}`] + offset).toFixed(2)}</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
