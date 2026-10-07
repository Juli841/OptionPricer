import type { HedgeParams, HedgeResult } from '../types/hedging'

type ValidationItem = { loc: (string | number)[]; msg: string }

function errorMessage(detail: string | ValidationItem[]): string {
  return typeof detail === 'string'
    ? detail
    : detail.map((x) => `${x.loc.at(-1)}: ${x.msg}`).join('; ')
}

export async function hedge(params: HedgeParams): Promise<HedgeResult> {
  let r: Response
  try {
    r = await fetch('/api/hedge', {
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
