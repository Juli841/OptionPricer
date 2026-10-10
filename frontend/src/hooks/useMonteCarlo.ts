import { useCallback, useEffect, useState } from 'react'
import { priceCrr } from '../api/gbm'
import { priceMc } from '../api/montecarlo'
import type { McFormValues, McParams, McResult } from '../types/montecarlo'

const DEFAULTS: McFormValues = {
  s0: '100', k: '100', sigma: '0.2', r: '0.05', T: '1', paths: '100000', seed: '42', kind: 'call',
}

// a fine CRR tree is the independent reference the Monte Carlo estimate is compared with
const REFERENCE_STEPS = 1000

export function useMonteCarlo() {
  const [form, setForm] = useState(DEFAULTS)
  const [result, setResult] = useState<{ params: McParams; res: McResult; reference: number | null } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: McFormValues) => {
    const params: McParams = {
      s0: +f.s0, k: +f.k, sigma: +f.sigma, r: +f.r, T: +f.T, paths: +f.paths, kind: f.kind,
      seed: f.seed.trim() === '' ? null : +f.seed,
    }
    try {
      const [res, reference] = await Promise.all([
        priceMc(params),
        priceCrr({ s0: params.s0, k: params.k, sigma: params.sigma, r: params.r, T: params.T, n: REFERENCE_STEPS, kind: f.kind })
          .then((c) => c.price)
          .catch(() => null), // the reference is optional (the tree can reject the inputs)
      ])
      setError('')
      setResult({ params, res, reference })
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
