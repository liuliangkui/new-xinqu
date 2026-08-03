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
        where: {
          ...baseWhere,
          status: 'pending',
          tasks: { some: { assigneeId: user.userId, action: null } },
        },
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

    const todos = await this.buildTodos(user, baseWhere)

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
      todos,
    }
  }

  private async buildTodos(user: CurrentUser, baseWhere: { deletedAt: null }) {
    const [taskTodos, approvalTodos, messageTodos] = await Promise.all([
      this.prisma.task.findMany({
        where: await this.dataScope.apply(user, 'task', {
          ...baseWhere,
          status: 'PENDING',
          OR: [{ ownerId: user.userId }, { assigneeIds: { has: user.userId } }],
        }),
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true, priority: true },
      }),
      this.prisma.approvalInstance.findMany({
        where: {
          ...baseWhere,
          status: 'pending',
          tasks: { some: { assigneeId: user.userId, action: null } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
      this.prisma.message.findMany({
        where: {
          receiverId: user.userId,
          readAt: null,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
    ])

    const list: Array<{
      todoId: string
      title: string
      type: 'task' | 'approval' | 'message'
      description?: string
      time: string
      status?: string
    }> = []

    taskTodos.forEach((t) =>
      list.push({
        todoId: `task_${t.id}`,
        title: t.title,
        type: 'task',
        description: String(t.priority || ''),
        time: t.createdAt.toISOString(),
      }),
    )
    approvalTodos.forEach((t) =>
      list.push({
        todoId: `approval_${t.id}`,
        title: t.title,
        type: 'approval',
        description: '待审批',
        time: t.createdAt.toISOString(),
      }),
    )
    messageTodos.forEach((t) =>
      list.push({
        todoId: `message_${t.id}`,
        title: t.title,
        type: 'message',
        description: '未读消息',
        time: t.createdAt.toISOString(),
      }),
    )

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)
  }
}
