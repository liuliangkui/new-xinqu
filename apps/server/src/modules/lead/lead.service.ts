import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import type { LeadQueryDto } from './dto/lead-query.dto'

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: LeadQueryDto) {
    const { page = 1, pageSize = 20, keyword, status, poolType, ownerId, region } = query

    const baseWhere: {
      OR?: unknown[]
      status?: string
      poolType?: string
      ownerId?: string
      region?: string
    } = {}

    if (keyword) {
      baseWhere.OR = [
        { name: { contains: keyword } },
        { contactName: { contains: keyword } },
        { contactPhone: { contains: keyword } },
        { companyName: { contains: keyword } },
      ]
    }
    if (status) baseWhere.status = status
    if (poolType) baseWhere.poolType = poolType
    if (ownerId) baseWhere.ownerId = ownerId
    if (region) baseWhere.region = region

    const where = await this.dataScope.apply(user, 'lead', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        select: { status: true, intentionLevel: true },
      }),
    ])

    const stats = {
      leadTotalCount: total,
      pendingCount: allForStats.filter((l) => l.status === 'PENDING').length,
      followingCount: allForStats.filter((l) => l.status === 'FOLLOWING').length,
      convertedCount: allForStats.filter((l) => l.status === 'CONVERTED').length,
      highIntentionCount: allForStats.filter((l) => l.intentionLevel === 'HIGH').length,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        followRecords: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!lead) throw new NotFoundException('线索不存在')
    return lead
  }

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: dto })
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id)
    return this.prisma.lead.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
