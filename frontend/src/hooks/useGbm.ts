import { useCallback, useEffect, useState } from 'react'
import { priceCrr, simulateGbm } from '../api/gbm'
import type { CrrRow, GbmFormValues, GbmParams, GbmResult } from '../types/gbm'

const DEFAULTS: GbmFormValues = {
  s0: '100', mu: '0.1', sigma: '0.2', T: '1', n: '100', paths: '5000', seed: '42',
  k: '100', r: '0.05', kind: 'call',
}

// tree sizes shown in the convergence table
const TREE_SIZES = [5, 10, 25, 50, 100, 250, 500, 1000]

export function useGbm() {
  const [form, setForm] = useState(DEFAULTS)
  // keep the inputs that produced the result, so the charts don't change while typing
  const [result, setResult] = useState<{ params: GbmParams; res: GbmResult; crr: CrrRow[]; kind: GbmFormValues['kind'] } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: GbmFormValues) => {
    const params: GbmParams = {
      s0: +f.s0, mu: +f.mu, sigma: +f.sigma, T: +f.T, n: +f.n, paths: +f.paths,
      seed: f.seed.trim() === '' ? null : +f.seed,
    }
    try {
      const [res, crr] = await Promise.all([
        simulateGbm(params),
        Promise.all(
          TREE_SIZES.map(async (n): Promise<CrrRow> => {
            try {
              const r = await priceCrr({ s0: params.s0, k: +f.k, sigma: params.sigma, r: +f.r, T: params.T, n, kind: f.kind })
              return { n, res: r, error: '' }
            } catch (e) {
              return { n, res: null, error: e instanceof Error ? e.message : 'unknown error' }
            }
          }),
        ),
      ])
      setError('')
      setResult({ params, res, crr, kind: f.kind })
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'unknown error')
    }
  }, [])

  // show the default example right away (fetch on mount; the setState runs after the await)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(DEFAULTS)
  }, [run])

  return { form, setForm, result, error, submit: () => run(form) }
}
