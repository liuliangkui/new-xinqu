import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import type { TicketQueryDto } from './dto/ticket-query.dto'

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: TicketQueryDto) {
    const { page = 1, pageSize = 20, keyword, customerId, assigneeId, status, priority, type } = query

    const baseWhere: {
      OR?: unknown[]
      customerId?: string
      assigneeId?: string
      status?: string
      priority?: string
      type?: string
    } = {}

    if (keyword) {
      baseWhere.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
        { code: { contains: keyword } },
      ]
    }
    if (customerId) baseWhere.customerId = customerId
    if (assigneeId) baseWhere.assigneeId = assigneeId
    if (status) baseWhere.status = status
    if (priority) baseWhere.priority = priority
    if (type) baseWhere.type = type

    const where = await this.dataScope.apply(user, 'ticket', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        select: { status: true, priority: true },
      }),
    ])

    const stats = {
      ticketTotalCount: total,
      pendingCount: allForStats.filter((t) => t.status === 'PENDING').length,
      processingCount: allForStats.filter((t) => t.status === 'PROCESSING').length,
      waitingCount: allForStats.filter((t) => t.status === 'WAITING').length,
      resolvedCount: allForStats.filter((t) => t.status === 'RESOLVED').length,
      closedCount: allForStats.filter((t) => t.status === 'CLOSED').length,
      urgentCount: allForStats.filter((t) => t.priority === 'URGENT' && t.status !== 'CLOSED').length,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        comments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        histories: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!ticket) throw new NotFoundException('工单不存在')
    return ticket
  }

  async create(dto: CreateTicketDto) {
    const code = `TK${Date.now().toString(36).toUpperCase()}`
    return this.prisma.ticket.create({
      data: { ...dto, code },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id)
    return this.prisma.ticket.update({
      where: { id },
      data: dto,
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.ticket.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
