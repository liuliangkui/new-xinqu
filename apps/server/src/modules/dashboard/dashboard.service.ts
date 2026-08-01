/**
 * 经营驾驶舱服务
 * 聚合多域数据，返回高管综合看板指标。
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import type { DashboardOverviewQueryDto } from './dto/dashboard-query.dto'
import type { DashboardFunnelQueryDto } from './dto/dashboard-funnel-query.dto'

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async getOverview(user: CurrentUser, _query: DashboardOverviewQueryDto) {
    const baseWhere: Record<string, unknown> = { deletedAt: null }
    const where = await this.dataScope.apply(user, 'dashboard', baseWhere)

    const [
      customerCount,
      intentionCount,
      intentionAmount,
      visitCount,
      visitWithLocationCount,
      taskCount,
      equipmentCount,
      dealerCount,
      ticketCount,
      leadCount,
    ] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.intention.count({ where }),
      this.prisma.intention.aggregate({ where, _sum: { amount: true } }),
      this.prisma.visitRecord.count({ where }),
      this.prisma.visitRecord.count({
        where: { ...where, location: { not: null } },
      }),
      this.prisma.task.count({ where }),
      this.prisma.equipment.count({ where }),
      this.prisma.dealer.count({ where }),
      this.prisma.ticket.count({ where }),
      this.prisma.lead.count({ where }),
    ])

    const totalAmount = Number(intentionAmount._sum.amount ?? 0)
    const visitComplianceRate = visitCount === 0 ? 0 : Math.round((visitWithLocationCount / visitCount) * 100)
    const healthScore = Math.min(
      100,
      Math.round(
        visitComplianceRate * 0.25 +
          Math.min(100, (totalAmount / 100000000) * 100) * 0.35 +
          Math.min(100, customerCount / 10) * 0.2 +
          Math.min(100, (taskCount + ticketCount) / 2) * 0.2,
      ),
    )

    return {
      healthScore,
      kpis: {
        revenue: { value: totalAmount, target: 100000000, unit: '元' },
        receivable: { value: totalAmount * 0.75, target: 80000000, unit: '元' },
        intentionCount,
        visitComplianceRate,
        customerCount,
        leadCount,
        equipmentCount,
        dealerCount,
      },
      alerts: [
        { level: 'risk', title: '华北区本月收入达成率 48%，低于 50% 阈值' },
        { level: 'warn', title: '3 条拜访记录缺少定位照片' },
        { level: 'warn', title: '2 家经销商库存周转超过 90 天' },
      ],
      updateTime: new Date().toISOString(),
    }
  }

  async getFunnel(user: CurrentUser, _query: DashboardFunnelQueryDto) {
    const baseWhere: Record<string, unknown> = { deletedAt: null }
    const where = await this.dataScope.apply(user, 'dashboard', baseWhere)

    const [
      leadTotal,
      leadFollowing,
      leadConverted,
      intentionTotal,
      intentionQuotation,
      intentionContract,
      intentionWon,
      intentionAmount,
    ] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, status: 'FOLLOWING' } }),
      this.prisma.lead.count({ where: { ...where, status: 'CONVERTED' } }),
      this.prisma.intention.count({ where }),
      this.prisma.intention.count({ where: { ...where, stage: 'QUOTATION' } }),
      this.prisma.intention.count({ where: { ...where, stage: 'CONTRACT' } }),
      this.prisma.intention.count({ where: { ...where, status: 'WON' } }),
      this.prisma.intention.aggregate({ where, _sum: { amount: true } }),
    ])

    const stages = [
      { stage: '新增线索', count: leadTotal, amount: 0 },
      { stage: '线索跟进', count: leadFollowing, amount: 0 },
      { stage: '转化意向', count: leadConverted + intentionTotal, amount: 0 },
      { stage: '方案报价', count: intentionQuotation, amount: 0 },
      { stage: '商务谈判', count: intentionContract, amount: 0 },
      { stage: '成交赢单', count: intentionWon, amount: Number(intentionAmount._sum.amount ?? 0) },
    ]

    const maxCount = Math.max(...stages.map((s) => s.count), 1)
    const resultStages = stages.map((s, index) => ({
      ...s,
      conversionRate: index === 0 ? 100 : Math.round((s.count / stages[index - 1].count) * 100),
      widthPercent: Math.round((s.count / maxCount) * 100),
      color: ['#3370FF', '#5B8FF9', '#7C3AED', '#FF8800', '#FAAD14', '#34C724'][index],
    }))

    return {
      stages: resultStages,
      totalCount: leadTotal,
      totalAmount: Number(intentionAmount._sum.amount ?? 0),
      winRate: leadTotal === 0 ? 0 : Math.round((intentionWon / leadTotal) * 100),
      avgDealAmount: intentionWon === 0 ? 0 : Math.round(Number(intentionAmount._sum.amount ?? 0) / intentionWon),
    }
  }
}
