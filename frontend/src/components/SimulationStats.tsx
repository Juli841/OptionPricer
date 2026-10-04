import type { SimulationParams, SimulationResult } from '../types/simulation'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function SimulationStats({ params, res }: { params: SimulationParams; res: SimulationResult }) {
  // how far the sample mean is from theory, in standard errors of the mean (sigma / sqrt(paths))
  const se = res.theoretical_std / Math.sqrt(params.paths)
  const gap = se > 0 ? Math.abs(res.terminal_mean - res.theoretical_mean) / se : 0

  return (
    <div className="card">
      <div className="stats">
        <Stat
          label={params.measure === 'risk_neutral' ? 'Up probability (risk-neutral q)' : 'Up probability p'}
          value={res.p.toFixed(4)}
        />
        <Stat
          label="Mean of Sₙ"
          value={res.terminal_mean.toFixed(2)}
          sub={`theory ${res.theoretical_mean.toFixed(2)} · ${gap.toFixed(2)} standard errors apart`}
        />
        <Stat
          label="Std of Sₙ"
          value={res.terminal_std.toFixed(2)}
          sub={`theory ${res.theoretical_std.toFixed(2)}`}
        />
        <Stat label="Paths × steps" value={`${params.paths.toLocaleString()} × ${params.n}`} />
      </div>
    </div>
  )
}
