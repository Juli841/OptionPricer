import type { SimulationParams, SimulationResult } from '../types/simulation'

type ValidationItem = { loc: (string | number)[]; msg: string }

export function errorMessage(detail: string | ValidationItem[]): string {
  return typeof detail === 'string'
    ? detail
    : detail.map((x) => `${x.loc.at(-1)}: ${x.msg}`).join('; ')
}

export async function simulate(params: SimulationParams): Promise<SimulationResult> {
  let r: Response
  try {
    r = await fetch('/api/simulate', {
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
