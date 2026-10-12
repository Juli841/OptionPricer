import type { Kind } from './gbm'

// strings so the inputs can be edited freely
export type BsFormValues = {
  s0: string
  k: string
  sigma: string
  r: string
  T: string
  kind: Kind
}

export type BsParams = {
  s0: number
  k: number
  sigma: number
  r: number
  T: number
  kind: Kind
}

export type BsResult = {
  price: number
  d1: number
  d2: number
  nd1: number
  nd2: number
}
