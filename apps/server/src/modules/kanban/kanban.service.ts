import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class KanbanService {
  constructor(private prisma: PrismaService) {}

  private columns = [
    { status: 'PENDING', title: '待处理' },
    { status: 'PROCESSING', title: '处理中' },
    { status: 'WAITING', title: '待反馈' },
    { status: 'RESOLVED', title: '已解决' },
    { status: 'CLOSED', title: '已关闭' },
  ]

  async findAll() {
    const tickets = await this.prisma.ticket.findMany({
      where: { deletedAt: null },
      include: { customer: true, assignee: true },
      orderBy: { createdAt: 'desc' },
    })

    const columns = this.columns.map((col) => ({
      ...col,
      tickets: tickets
        .filter((t) => t.status === col.status)
        .map((t) => ({
          ticketId: t.id,
          ticketCode: t.code || t.id,
          title: t.title,
          customerName: t.customer?.name || '',
          status: t.status,
          priority: t.priority,
          assigneeName: t.assignee?.name || '',
          createdAt: t.createdAt,
        })),
    }))

    return { columns }
  }

  async stats() {
    const tickets = await this.prisma.ticket.findMany({
      where: { deletedAt: null },
      select: { status: true },
    })
    return {
      totalCount: tickets.length,
      pendingCount: tickets.filter((t) => t.status === 'PENDING').length,
      processingCount: tickets.filter((t) => t.status === 'PROCESSING').length,
      waitingCount: tickets.filter((t) => t.status === 'WAITING').length,
      resolvedCount: tickets.filter((t) => t.status === 'RESOLVED').length,
    }
  }
}
