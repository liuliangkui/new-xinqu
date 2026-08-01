/**
 * 经营驾驶舱 — Mock
 */
import dayjs from 'dayjs'
import type { DashboardOverview, DashboardQueryParams } from './types'

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
