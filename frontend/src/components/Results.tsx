import type { PricingParams, PricingResult } from '../types/pricing'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

// American results carry their own bond (after consumption); for European V0 = delta*S0 + bond
export default function Results({ params, res }: { params: PricingParams; res: PricingResult & { bond?: number[][] | null } }) {
  const delta = res.delta?.[0][0]
  const bond = res.bond?.[0][0] ?? (delta === undefined ? undefined : res.price - delta * params.s0)

  return (
    <div className="card">
      <div className="stats">
        <Stat label="Option price" value={res.price.toFixed(4)} />
        <Stat label="Risk-neutral q" value={res.q.toFixed(4)} />
        {delta !== undefined && <Stat label="Delta (shares)" value={delta.toFixed(4)} />}
        {bond !== undefined && <Stat label="Bond / cash" value={bond.toFixed(4)} />}
      </div>
      {res.stock === null && (
        <p className="note">Tree hidden for n = {params.n} (too large to draw); showing the price only.</p>
      )}
    </div>
  )
}
