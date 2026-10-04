import type { AmericanResult, PricingParams, PricingResult } from '../types/pricing'

type ValidationItem = { loc: (string | number)[]; msg: string }

// engine errors: detail is a string; validation errors: a list of {loc, msg}
function errorMessage(detail: string | ValidationItem[]): string {
  return typeof detail === 'string'
    ? detail
    : detail.map((x) => `${x.loc.at(-1)}: ${x.msg}`).join('; ')
}

async function post<T>(url: string, params: PricingParams): Promise<T> {
  let r: Response
  try {
    r = await fetch(url, {
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

export const priceMultiPeriod = (p: PricingParams) => post<PricingResult>('/api/price/multi-period', p)
export const priceAmerican = (p: PricingParams) => post<AmericanResult>('/api/price/american', p)
