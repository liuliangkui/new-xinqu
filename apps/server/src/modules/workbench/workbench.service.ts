import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'

@Injectable()
export class WorkbenchService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser) {
    const baseWhere = { deletedAt: null }

    const [pendingTasks, pendingApprovals, unreadMessages, todaySchedules, favoriteApps] = await Promise.all([
      this.prisma.task.count({
        where: await this.dataScope.apply(user, 'task', {
          ...baseWhere,
          status: 'PENDING',
          OR: [{ ownerId: user.userId }, { assigneeIds: { has: user.userId } }],
        }),
      }),
      this.prisma.approvalInstance.count({
        where: await this.dataScope.apply(user, 'approval', {
          ...baseWhere,
          status: 'pending',
          tasks: { some: { assigneeId: user.userId, action: null } },
        }),
      }),
      this.prisma.message.count({
        where: {
          receiverId: user.userId,
          readAt: null,
          deletedAt: null,
        },
      }),
      this.prisma.schedule.findMany({
        where: {
          ownerId: user.userId,
          startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'ACTIVE',
          deletedAt: null,
        },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
      this.prisma.userFavorite.findMany({
        where: {
          userId: user.userId,
          targetType: 'APP',
          deletedAt: null,
        },
        take: 8,
      }),
    ])

    const favoriteAppIds = favoriteApps.map((f) => f.targetId)
    const apps = favoriteAppIds.length
      ? await this.prisma.app.findMany({
          where: { id: { in: favoriteAppIds }, deletedAt: null },
          select: { id: true, name: true, route: true, icon: true },
        })
      : []
    const appMap = new Map(apps.map((a) => [a.id, a]))

    return {
      stats: {
        pendingTaskCount: pendingTasks,
        pendingApprovalCount: pendingApprovals,
        unreadMessageCount: unreadMessages,
        todayScheduleCount: todaySchedules.length,
      },
      schedules: todaySchedules,
      favorites: favoriteApps.map((f) => {
        const app = appMap.get(f.targetId)
        return {
          id: f.id,
          appId: f.targetId,
          name: app?.name || f.targetId,
          route: app?.route,
          icon: app?.icon,
        }
      }),
    }
  }
}
