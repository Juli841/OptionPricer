import type { McParams, McResult } from '../types/montecarlo'
import { post } from './gbm'

export const priceMc = (params: McParams) => post<McResult>('/api/mc/price', params)
