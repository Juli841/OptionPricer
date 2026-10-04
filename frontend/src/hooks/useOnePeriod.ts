import { useState } from 'react'
import { priceOnePeriod } from '../api/pricing'
import type { OnePeriodFormValues, OnePeriodParams, OnePeriodResult } from '../types/pricing'

const DEFAULTS: OnePeriodFormValues = { s0: '100', k: '100', u: '1.1', d: '0.9', r: '0.05', kind: 'call' }

export function useOnePeriod() {
  const [form, setForm] = useState(DEFAULTS)
  // keep the inputs that produced the result, so the tree doesn't change while typing
  const [result, setResult] = useState<{ params: OnePeriodParams; res: OnePeriodResult } | null>(null)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    const params: OnePeriodParams = {
      s0: +form.s0, k: +form.k, u: +form.u, d: +form.d, r: +form.r, kind: form.kind,
    }
    try {
      setResult({ params, res: await priceOnePeriod(params) })
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'unknown error')
    }
  }

  return { form, setForm, result, error, submit }
}
