import { useCallback, useEffect, useState } from 'react'
import { priceBs } from '../api/blackscholes'
import { priceCrr } from '../api/gbm'
import { priceMc } from '../api/montecarlo'
import type { BsFormValues, BsParams, BsResult } from '../types/blackscholes'
import type { McResult } from '../types/montecarlo'

const DEFAULTS: BsFormValues = { s0: '100', k: '100', sigma: '0.2', r: '0.05', T: '1', kind: 'call' }

const CRR_STEPS = 1000
const MC_PATHS = 200000
const CURVE_POINTS = 41 // S0 from 0.5 K to 1.5 K

export type BsPage = {
  params: BsParams
  bs: BsResult
  crr: number | null
  mc: McResult | null
  curve: { s0: number; price: number; payoff: number }[]
}

export function useBlackScholes() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<BsPage | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: BsFormValues) => {
    const p: BsParams = { s0: +f.s0, k: +f.k, sigma: +f.sigma, r: +f.r, T: +f.T, kind: f.kind }
    const payoff = (s: number) => Math.max(f.kind === 'call' ? s - p.k : p.k - s, 0)
    const grid = Array.from({ length: CURVE_POINTS }, (_, i) => p.k * (0.5 + i / (CURVE_POINTS - 1)))
    try {
      const [bs, crr, mc, prices] = await Promise.all([
        priceBs(p),
        priceCrr({ ...p, n: CRR_STEPS }).then((c) => c.price).catch(() => null),
        priceMc({ ...p, paths: MC_PATHS, seed: 42 }).catch(() => null),
        Promise.all(grid.map((s0) => priceBs({ ...p, s0 }).then((b) => b.price))),
      ])
      const curve = grid.map((s0, i) => ({ s0, price: prices[i], payoff: payoff(s0) }))
      setError('')
      setResult({ params: p, bs, crr, mc, curve })
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'unknown error')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(DEFAULTS)
  }, [run])

  return { form, setForm, result, error, submit: () => run(form) }
}
