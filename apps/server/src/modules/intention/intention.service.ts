import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateIntentionDto } from './dto/create-intention.dto'
import { UpdateIntentionDto } from './dto/update-intention.dto'
import type { IntentionQueryDto } from './dto/intention-query.dto'

@Injectable()
export class IntentionService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: IntentionQueryDto) {
    const { page = 1, pageSize = 20, keyword, customerId, ownerId, status, stage } = query

    const baseWhere: {
      OR?: unknown[]
      customerId?: string
      ownerId?: string
      status?: string
      stage?: string
    } = {}

    if (keyword) {
      baseWhere.OR = [{ customer: { name: { contains: keyword } } }]
    }
    if (customerId) baseWhere.customerId = customerId
    if (ownerId) baseWhere.ownerId = ownerId
    if (status) baseWhere.status = status
    if (stage) baseWhere.stage = stage

    const where = await this.dataScope.apply(user, 'intention', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.intention.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.intention.count({ where }),
      this.prisma.intention.findMany({
        where,
        select: { status: true, stage: true },
      }),
    ])

    const stats = {
      intentionTotalCount: total,
      activeCount: allForStats.filter((i) => i.status === 'ACTIVE').length,
      wonCount: allForStats.filter((i) => i.status === 'WON').length,
      lostCount: allForStats.filter((i) => i.status === 'LOST').length,
      stalledCount: allForStats.filter((i) => i.status === 'STALLED').length,
      highProbabilityCount: allForStats.filter(
        (i) => (i.status === 'ACTIVE' || i.status === 'WON') && i.stage === 'CONTRACT',
      ).length,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const intention = await this.prisma.intention.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        stageRecords: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!intention) throw new NotFoundException('意向不存在')
    return intention
  }

  async create(dto: CreateIntentionDto) {
    return this.prisma.intention.create({
      data: {
        ...dto,
        expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async update(id: string, dto: UpdateIntentionDto) {
    await this.findOne(id)
    return this.prisma.intention.update({
      where: { id },
      data: {
        ...dto,
        expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.intention.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
