import type { CrrParams, CrrResult, GbmParams, GbmResult } from '../types/gbm'
import { errorMessage } from './simulation'

async function post<T>(url: string, body: unknown): Promise<T> {
  let r: Response
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('backend unreachable')
  }
  const data = await r.json()
  if (!r.ok) throw new Error(errorMessage(data.detail))
  return data
}

export const simulateGbm = (params: GbmParams) => post<GbmResult>('/api/gbm/simulate', params)
export const priceCrr = (params: CrrParams) => post<CrrResult>('/api/gbm/crr', params)
