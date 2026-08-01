/**
 * 经营驾驶舱 — API 层
 */
import { get } from '@/api/request'
import type { DashboardOverview, DashboardQueryParams, DashboardFunnelResult } from './types'

const BASE = '/dashboard'

/** 获取高管综合看板概览 */
export function getDashboardOverview(params?: DashboardQueryParams): Promise<DashboardOverview> {
  return get<DashboardOverview>(`${BASE}/overview`, params)
}

/** 获取销售漏斗分析 */
export function getDashboardFunnel(params?: DashboardQueryParams): Promise<DashboardFunnelResult> {
  return get<DashboardFunnelResult>(`${BASE}/funnel`, params)
}
