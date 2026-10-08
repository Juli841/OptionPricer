export type Kind = 'call' | 'put'

// form values stay strings so the inputs can be edited freely; blank seed = random
export type GbmFormValues = {
  s0: string
  mu: string
  sigma: string
  T: string
  n: string
  paths: string
  seed: string
  k: string
  r: string
  kind: Kind
}

export type GbmParams = {
  s0: number
  mu: number
  sigma: number
  T: number
  n: number
  paths: number
  seed: number | null
}

export type GbmResult = {
  times: number[] // n+1 points in years
  sample_paths: number[][] // each n+1 prices, starting at s0
  terminal_mean: number
  terminal_std: number
  theoretical_mean: number
  theoretical_std: number
  log_return_edges: number[] // bins + 1
  log_return_counts: number[]
  log_return_mean: number
  log_return_std: number
  theoretical_log_return_mean: number
  theoretical_log_return_std: number
}

export type CrrParams = {
  s0: number
  k: number
  sigma: number
  r: number
  T: number
  n: number
  kind: Kind
}

export type CrrResult = {
  price: number
  q: number
  params: { u: number; d: number; r_step: number; q: number }
}

// one row of the convergence table; error is set when the tree was rejected (e.g. arbitrage)
export type CrrRow = { n: number; res: CrrResult | null; error: string }
