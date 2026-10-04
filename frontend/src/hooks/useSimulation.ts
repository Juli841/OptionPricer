import { useCallback, useEffect, useState } from 'react'
import { simulate } from '../api/simulation'
import type { SimulationFormValues, SimulationParams, SimulationResult } from '../types/simulation'

const DEFAULTS: SimulationFormValues = {
  s0: '100', u: '1.02', d: '0.98', n: '50', paths: '5000',
  measure: 'real_world', p: '0.55', r: '0.001', seed: '42',
}

export function useSimulation() {
  const [form, setForm] = useState(DEFAULTS)
  // keep the inputs that produced the result, so the charts don't change while typing
  const [result, setResult] = useState<{ params: SimulationParams; res: SimulationResult } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: SimulationFormValues) => {
    const params: SimulationParams = {
      s0: +f.s0, u: +f.u, d: +f.d, n: +f.n, paths: +f.paths, measure: f.measure,
      p: f.measure === 'real_world' ? +f.p : null,
      r: +f.r,
      seed: f.seed.trim() === '' ? null : +f.seed,
    }
    try {
      const res = await simulate(params)
      setError('')
      setResult({ params, res })
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
