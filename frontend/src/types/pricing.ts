export type OptionKind = 'call' | 'put'

// form values stay strings so the inputs can be edited freely
export type PricingFormValues = {
  s0: string
  k: string
  u: string
  d: string
  r: string
  n: string
  kind: OptionKind
}

export type PricingParams = {
  s0: number
  k: number
  u: number
  d: number
  r: number
  n: number
  kind: OptionKind
}

// trees are indexed [level][ups]; null when n is too large to show
export type PricingResult = {
  price: number
  q: number
  stock: number[][] | null
  option: number[][] | null
  delta: number[][] | null // levels 0..n-1 only
}

// American adds the exercise decision and the Shreve hedge (consumption C and bond B per node)
export type AmericanResult = PricingResult & {
  intrinsic: number[][] | null
  continuation: number[][] | null // levels 0..n-1
  exercise: boolean[][] | null
  bond: number[][] | null // levels 0..n-1
  consumption: number[][] | null // levels 0..n-1
}
