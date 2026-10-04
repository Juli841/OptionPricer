import { useCallback, useEffect, useState } from 'react'
import { priceMultiPeriod } from '../api/pricing'
import type { PricingFormValues, PricingParams, PricingResult } from '../types/pricing'

const DEFAULTS: PricingFormValues = { s0: '100', k: '100', u: '1.1', d: '0.9', r: '0.05', n: '3', kind: 'call' }

export function usePricing() {
  const [form, setForm] = useState(DEFAULTS)
  // keep the inputs that produced the result, so the tree doesn't change while typing
  const [result, setResult] = useState<{ params: PricingParams; res: PricingResult } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: PricingFormValues) => {
    const params: PricingParams = {
      s0: +f.s0, k: +f.k, u: +f.u, d: +f.d, r: +f.r, n: +f.n, kind: f.kind,
    }
    try {
      const res = await priceMultiPeriod(params)
      setError('')
      setResult({ params, res })
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'unknown error')
    }
  }, [])

  // show the default example right away (fetch on mount; the rule can't see the setState runs after the await)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(DEFAULTS)
  }, [run])

  return { form, setForm, result, error, submit: () => run(form) }
}
