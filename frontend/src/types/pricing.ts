export type OptionKind = 'call' | 'put'

// form values stay strings so the inputs can be edited freely
export type OnePeriodFormValues = {
  s0: string
  k: string
  u: string
  d: string
  r: string
  kind: OptionKind
}

export type OnePeriodParams = {
  s0: number
  k: number
  u: number
  d: number
  r: number
  kind: OptionKind
}

export type OnePeriodResult = {
  price: number
  delta: number
  bond: number
  q: number
  s_up: number
  s_down: number
  v_up: number
  v_down: number
}
