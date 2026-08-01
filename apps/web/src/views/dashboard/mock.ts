/**
 * 经营驾驶舱 — Mock
 */
import dayjs from 'dayjs'
import type { DashboardOverview, DashboardQueryParams, DashboardFunnelResult } from './types'

export function generateDashboardOverview(_params?: DashboardQueryParams): DashboardOverview {
  return {
    healthScore: 82,
    kpis: {
      revenue: { label: '本月收入', value: 28600000, target: 350000000, unit: '元', rate: 8.2, trend: 12 },
      receivable: { label: '本月回款', value: 21200000, target: 280000000, unit: '元', rate: 7.6, trend: 5 },
      intentionCount: 128,
      visitComplianceRate: 91,
      customerCount: 342,
      leadCount: 86,
      equipmentCount: 156,
      dealerCount: 45,
    },
    alerts: [
      { level: 'risk', title: '华北区本月收入达成率 48%，低于 50% 阈值' },
      { level: 'warn', title: '3 条拜访记录缺少定位照片' },
      { level: 'warn', title: '2 家经销商库存周转超过 90 天' },
    ],
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  }
}

export function generateDashboardFunnel(_params?: DashboardQueryParams): DashboardFunnelResult {
  const stages = [
    { stage: '新增线索', count: 860, amount: 0 },
    { stage: '线索跟进', count: 640, amount: 0 },
    { stage: '转化意向', count: 380, amount: 0 },
    { stage: '方案报价', count: 210, amount: 0 },
    { stage: '商务谈判', count: 95, amount: 0 },
    { stage: '成交赢单', count: 42, amount: 15800000 },
  ]
  const maxCount = Math.max(...stages.map((s) => s.count))
  const colors = ['#3370FF', '#5B8FF9', '#7C3AED', '#FF8800', '#FAAD14', '#34C724']
  return {
    stages: stages.map((s, i) => ({
      ...s,
      conversionRate: i === 0 ? 100 : Math.round((s.count / (stages[i - 1] as { count: number }).count) * 100),
      widthPercent: Math.round((s.count / maxCount) * 100),
      color: colors[i] || '#3370FF',
    })),
    totalCount: 860,
    totalAmount: 15800000,
    winRate: 5,
    avgDealAmount: 376000,
  }
}
