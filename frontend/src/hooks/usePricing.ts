import { useCallback, useEffect, useState } from 'react'
import type { PricingFormValues, PricingParams } from '../types/pricing'

const DEFAULTS: PricingFormValues = { s0: '100', k: '100', u: '1.1', d: '0.9', r: '0.05', n: '3', kind: 'call' }

const NO_INITIAL: Partial<PricingFormValues> = {} // module-level so its identity never changes

// `price` must be a stable function (module-level), `initial` a stable object
// (a fresh `{}` per render would re-run the mount effect after every render)
export function usePricing<R>(
  price: (p: PricingParams) => Promise<R>,
  initial: Partial<PricingFormValues> = NO_INITIAL,
) {
  const [form, setForm] = useState<PricingFormValues>({ ...DEFAULTS, ...initial })
  // keep the inputs that produced the result, so the tree doesn't change while typing
  const [result, setResult] = useState<{ params: PricingParams; res: R } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(
    async (f: PricingFormValues) => {
      const params: PricingParams = {
        s0: +f.s0, k: +f.k, u: +f.u, d: +f.d, r: +f.r, n: +f.n, kind: f.kind,
      }
      try {
        const res = await price(params)
        setError('')
        setResult({ params, res })
      } catch (e) {
        setResult(null)
        setError(e instanceof Error ? e.message : 'unknown error')
      }
    },
    [price],
  )

  // show the default example right away (fetch on mount; the rule can't see the setState runs after the await)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run({ ...DEFAULTS, ...initial })
  }, [run, initial])

  return { form, setForm, result, error, submit: () => run(form) }
}
