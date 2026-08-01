import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import type { TaskQueryDto } from './dto/task-query.dto'

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: TaskQueryDto) {
    const { page = 1, pageSize = 20, keyword, type, priority, status, tabType } = query

    const baseWhere: {
      OR?: unknown[]
      type?: string
      priority?: string
      status?: string
      ownerId?: string
      participantIds?: { has: string }
      deletedAt?: null
    } = { deletedAt: null }

    if (keyword) {
      baseWhere.OR = [{ title: { contains: keyword } }, { content: { contains: keyword } }]
    }
    if (type) baseWhere.type = type
    if (priority) baseWhere.priority = priority
    if (status) baseWhere.status = status

    if (tabType === 'my') {
      baseWhere.ownerId = user.userId
    } else if (tabType === 'collaboration') {
      baseWhere.participantIds = { has: user.userId }
    } else if (tabType === 'overdue') {
      baseWhere.status = baseWhere.status || 'PENDING'
    }

    const where = await this.dataScope.apply(user, 'task', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        select: { status: true, priority: true },
      }),
    ])

    const stats = {
      totalCount: total,
      pendingCount: allForStats.filter((t) => t.status === 'PENDING').length,
      processingCount: allForStats.filter((t) => t.status === 'IN_PROGRESS').length,
      completedCount: allForStats.filter((t) => t.status === 'COMPLETED').length,
      overdueCount: allForStats.filter((t) => t.status === 'PENDING').length,
      urgentCount: allForStats.filter((t) => t.priority === 'URGENT').length,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    })
    if (!task) throw new NotFoundException('任务不存在')
    return task
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        ownerId: dto.ownerId || userId,
        createdBy: dto.createdBy || userId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    })
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id)
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
