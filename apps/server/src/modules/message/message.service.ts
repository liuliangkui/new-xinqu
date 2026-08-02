import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateMessageDto } from './dto/create-message.dto'
import type { MessageQueryDto } from './dto/message-query.dto'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: MessageQueryDto) {
    const { status, type } = query
    const where: { receiverId: string; deletedAt: null; status?: string; type?: string } = {
      receiverId: userId,
      deletedAt: null,
    }
    if (status) where.status = status
    if (type) where.type = type

    const [list, total, unreadCount] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.count({ where }),
      this.prisma.message.count({
        where: { receiverId: userId, status: 'UNREAD', deletedAt: null },
      }),
    ])

    return { list, total, unreadCount }
  }

  async markRead(userId: string, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, receiverId: userId, deletedAt: null },
    })
    if (!message) throw new NotFoundException('消息不存在')
    return this.prisma.message.update({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    })
  }

  async markAllRead(userId: string) {
    await this.prisma.message.updateMany({
      where: { receiverId: userId, status: 'UNREAD', deletedAt: null },
      data: { status: 'READ', readAt: new Date() },
    })
    return { success: true }
  }

  async create(dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
        receiverId: dto.receiverId,
        payload: (dto.payload ?? {}) as unknown as Prisma.InputJsonValue,
      },
    })
  }
}
