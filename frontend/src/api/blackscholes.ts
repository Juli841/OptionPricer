import type { BsParams, BsResult } from '../types/blackscholes'
import { post } from './gbm'

export const priceBs = (params: BsParams) => post<BsResult>('/api/bs/price', params)
