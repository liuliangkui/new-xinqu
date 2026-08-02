import type { PageResult } from '@/types/common'

export type PerformanceTabType = 'my' | 'team' | 'region' | 'product' | 'channel'
export type PerformancePeriod = 'month' | 'quarter' | 'year'
export type PerformanceIndicator = 'revenue' | 'collection' | 'quantity'
export type PerformanceStatus = 'normal' | 'attention' | 'risk'

export interface TrendPoint {
  label: string
  target: number
  actual: number
}

export interface PerformanceOverview {
  targetTotal: number
  actualTotal: number
  achievementRate: number
  gap: number
  yoy: number
  mom: number
  underperformCount: number
  trend: TrendPoint[]
  period: PerformancePeriod
  indicator: PerformanceIndicator
}

export interface PerformanceItem {
  id: string
  name: string
  target: number
  actual: number
  achievementRate: number
  gap: number
  yoy: number
  mom: number
  status: PerformanceStatus
  rank?: number
  regionName?: string
  productLine?: string
  ownerName?: string
}

export type PerformanceListResult = PageResult<PerformanceItem>

export interface PerformanceListParams {
  page?: number
  size?: number
  keyword?: string
  tabType?: PerformanceTabType
  period?: PerformancePeriod
  indicator?: PerformanceIndicator
}
