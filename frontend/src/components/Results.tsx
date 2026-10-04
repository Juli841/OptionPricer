import type { PricingParams, PricingResult } from '../types/pricing'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

export default function Results({ params, res }: { params: PricingParams; res: PricingResult }) {
  // first-step hedge; bond follows from the replication V0 = delta*S0 + bond
  const delta = res.delta?.[0][0]
  const bond = delta === undefined ? undefined : res.price - delta * params.s0

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
