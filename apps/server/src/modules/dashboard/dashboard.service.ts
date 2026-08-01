/**
 * 经营驾驶舱服务
 * 聚合多域数据，返回高管综合看板指标。
 */
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import type { DashboardOverviewQueryDto } from './dto/dashboard-query.dto'

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
}
