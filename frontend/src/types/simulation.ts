export type Measure = 'real_world' | 'risk_neutral'

// form values stay strings so the inputs can be edited freely; blank seed = random
export type SimulationFormValues = {
  s0: string
  u: string
  d: string
  n: string
  paths: string
  measure: Measure
  p: string
  r: string
  seed: string
}

export type SimulationParams = {
  s0: number
  u: number
  d: number
  n: number
  paths: number
  measure: Measure
  p: number | null
  r: number
  seed: number | null
}

export type SimulationResult = {
  p: number // up probability actually used (q for risk-neutral)
  sample_paths: number[][] // each n+1 prices, starting at s0
  ups_counts: number[] // paths ending with j ups, j = 0..n
  terminal_mean: number
  terminal_std: number
  theoretical_mean: number
  theoretical_std: number
}
