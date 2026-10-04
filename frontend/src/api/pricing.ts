import type { PricingParams, PricingResult } from '../types/pricing'

type ValidationItem = { loc: (string | number)[]; msg: string }

// engine errors: detail is a string; validation errors: a list of {loc, msg}
function errorMessage(detail: string | ValidationItem[]): string {
  return typeof detail === 'string'
    ? detail
    : detail.map((x) => `${x.loc.at(-1)}: ${x.msg}`).join('; ')
}

export async function priceMultiPeriod(params: PricingParams): Promise<PricingResult> {
  let r: Response
  try {
    r = await fetch('/api/price/multi-period', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch {
    throw new Error('backend unreachable')
  }
  const data = await r.json()
  if (!r.ok) throw new Error(errorMessage(data.detail))
  return data
}
