import type { Kind } from './gbm'

// strings so the inputs can be edited freely; blank seed = random
export type McFormValues = {
  s0: string
  k: string
  sigma: string
  r: string
  T: string
  paths: string
  seed: string
  kind: Kind
}

export type McParams = {
  s0: number
  k: number
  sigma: number
  r: number
  T: number
  paths: number
  kind: Kind
  seed: number | null
}

export type McResult = {
  price: number
  std_error: number
  ci_low: number
  ci_high: number
  paths: number
  checkpoints: number[]
  running_price: number[]
  running_std_error: number[]
}
