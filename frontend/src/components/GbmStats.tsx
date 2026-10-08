import type { GbmParams, GbmResult } from '../types/gbm'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function GbmStats({ params, res }: { params: GbmParams; res: GbmResult }) {
  // how far the sample mean is from theory, in standard errors of the mean (sigma / sqrt(paths))
  const se = res.theoretical_std / Math.sqrt(params.paths)
  const gap = se > 0 ? Math.abs(res.terminal_mean - res.theoretical_mean) / se : 0

  return (
    <div className="card">
      <div className="stats">
        <Stat
          label="Mean of S_T"
          value={res.terminal_mean.toFixed(2)}
          sub={`theory ${res.theoretical_mean.toFixed(2)} · ${gap.toFixed(2)} standard errors apart`}
        />
        <Stat
          label="Std of S_T"
          value={res.terminal_std.toFixed(2)}
          sub={`theory ${res.theoretical_std.toFixed(2)}`}
        />
        <Stat
          label="Mean of ln(S_T/S₀)"
          value={res.log_return_mean.toFixed(4)}
          sub={`theory ${res.theoretical_log_return_mean.toFixed(4)} = (μ − σ²/2)·T`}
        />
        <Stat
          label="Std of ln(S_T/S₀)"
          value={res.log_return_std.toFixed(4)}
          sub={`theory ${res.theoretical_log_return_std.toFixed(4)} = σ·√T`}
        />
        <Stat label="Paths × steps" value={`${params.paths.toLocaleString()} × ${params.n}`} />
      </div>
    </div>
  )
}
