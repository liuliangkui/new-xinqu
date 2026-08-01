/**
 * 经营驾驶舱 — 类型定义
 */

export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'

export type AlertLevel = 'risk' | 'warn' | 'info'

export interface DashboardKpiItem {
  label?: string
  value: number
  unit?: string
  target?: number
  rate?: number
  trend?: number
  color?: string
}

export interface DashboardAlert {
  level: AlertLevel
  title: string
}

export interface DashboardOverview {
  healthScore: number
  kpis: {
    revenue: DashboardKpiItem
    receivable: DashboardKpiItem
    intentionCount: number
    visitComplianceRate: number
    customerCount: number
    leadCount: number
    equipmentCount: number
    dealerCount: number
  }
  alerts: DashboardAlert[]
  updateTime: string
}

export interface DashboardQueryParams extends Record<string, unknown> {
  period?: DashboardPeriod
  regionCode?: string
}
