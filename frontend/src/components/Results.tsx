import type { OnePeriodResult } from '../types/pricing'

export default function Results({ res }: { res: OnePeriodResult }) {
  return (
    <ul>
      <li>Option price: {res.price.toFixed(4)}</li>
      <li>Delta (shares): {res.delta.toFixed(4)}</li>
      <li>Bond / cash: {res.bond.toFixed(4)}</li>
      <li>Risk-neutral q: {res.q.toFixed(4)}</li>
    </ul>
  )
}
