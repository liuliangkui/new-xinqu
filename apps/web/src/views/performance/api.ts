import { get } from '@/api/request'
import type { PerformanceOverview, PerformanceListParams, PerformanceListResult } from './types'

export function getPerformanceOverview(
  params?: Pick<PerformanceListParams, 'period' | 'indicator'>,
): Promise<PerformanceOverview> {
  return get<PerformanceOverview>('/performance/overview', params)
}

export function getPerformanceList(params: PerformanceListParams): Promise<PerformanceListResult> {
  return get<PerformanceListResult>('/performance/list', {
    ...params,
    pageSize: params.size,
  })
}
