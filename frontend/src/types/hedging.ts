import type { OptionKind } from './pricing'

// strings so the inputs can be edited freely; the path (moves) lives next to them, its length is n
export type HedgeFormValues = { s0: string; k: string; u: string; d: string; r: string; kind: OptionKind }

export type HedgeParams = {
  s0: number
  k: number
  u: number
  d: number
  r: number
  kind: OptionKind
  moves: boolean[] // true = up
}

export type HedgeStep = {
  t: number
  stock: number
  option: number // V_t from the tree
  portfolio: number // X_t before rebalancing
  delta: number | null // shares held from t to t+1
  cash: number | null // X_t - delta * S_t
}

export type HedgeResult = {
  price: number
  q: number
  steps: HedgeStep[]
  payoff: number
  final_portfolio: number
  max_gap: number
}
