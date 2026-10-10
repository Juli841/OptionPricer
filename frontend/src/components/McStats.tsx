import type { McResult } from '../types/montecarlo'

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export default function McStats({ res, reference }: { res: McResult; reference: number | null }) {
  const inside = reference !== null && reference >= res.ci_low && reference <= res.ci_high

  return (
    <div className="card">
      <div className="stats">
        <Stat label="Monte Carlo price" value={res.price.toFixed(4)} sub="e^(−rT) · mean payoff" />
        <Stat label="Standard error" value={res.std_error.toFixed(4)} sub="sample std / √M" />
        <Stat
          label="95% confidence interval"
          value={`${res.ci_low.toFixed(3)} – ${res.ci_high.toFixed(3)}`}
          sub="price ± 1.96 · standard error"
        />
        <Stat label="Simulations" value={res.paths.toLocaleString()} />
        {reference !== null && (
          <Stat
            label="CRR tree (n = 1000)"
            value={reference.toFixed(4)}
            sub={inside ? 'inside the interval' : 'outside the interval (expected in about 1 run of 20)'}
          />
        )}
      </div>
    </div>
  )
}
