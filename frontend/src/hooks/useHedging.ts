import { useCallback, useEffect, useState } from 'react'
import { hedge } from '../api/hedging'
import type { HedgeFormValues, HedgeParams, HedgeResult } from '../types/hedging'

export const MAX_STEPS = 12 // same as the backend's FULL_TREE_MAX_N

const DEFAULTS: HedgeFormValues = { s0: '100', k: '100', u: '1.1', d: '0.9', r: '0.05', kind: 'call' }
const DEFAULT_MOVES = [true, false, true, true, false] // true = up

export function useHedging() {
  const [form, setForm] = useState(DEFAULTS)
  const [moves, setMoves] = useState(DEFAULT_MOVES)
  const [result, setResult] = useState<{ params: HedgeParams; res: HedgeResult } | null>(null)
  const [error, setError] = useState('')

  const run = useCallback(async (f: HedgeFormValues, m: boolean[]) => {
    const params: HedgeParams = { s0: +f.s0, k: +f.k, u: +f.u, d: +f.d, r: +f.r, kind: f.kind, moves: m }
    try {
      const res = await hedge(params)
      setError('')
      setResult({ params, res })
    } catch (e) {
      setResult(null)
      setError(e instanceof Error ? e.message : 'unknown error')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run(DEFAULTS, DEFAULT_MOVES)
  }, [run])

  // changing the path re-runs right away (that is the point of clicking); the other inputs wait for the button
  const changePath = (m: boolean[]) => {
    setMoves(m)
    void run(form, m)
  }
  const setLength = (n: number) => {
    const len = Math.min(MAX_STEPS, Math.max(1, Math.round(n)))
    changePath(Array.from({ length: len }, (_, i) => moves[i] ?? true))
  }
  const flip = (i: number) => changePath(moves.map((m, j) => (j === i ? !m : m)))
  const randomise = () => changePath(moves.map(() => Math.random() < 0.5))

  return { form, setForm, moves, result, error, submit: () => run(form, moves), setLength, flip, randomise }
}
