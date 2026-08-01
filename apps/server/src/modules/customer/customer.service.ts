import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import type { CustomerQueryDto } from './dto/customer-query.dto'

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: CustomerQueryDto) {
    const { page = 1, pageSize = 20, keyword, status, level, regionId, ownerId } = query

    const baseWhere: {
      OR?: unknown[]
      status?: string
      level?: string
      regionId?: string
      ownerId?: string
    } = {}

    if (keyword) {
      baseWhere.OR = [{ name: { contains: keyword } }, { tags: { has: keyword } }]
    }
    if (status) baseWhere.status = status
    if (level) baseWhere.level = level
    if (regionId) baseWhere.regionId = regionId
    if (ownerId) baseWhere.ownerId = ownerId

    const where = await this.dataScope.apply(user, 'customer', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        select: { healthScore: true },
      }),
    ])

    const stats = {
      customerTotalCount: total,
      healthyCount: allForStats.filter((c) => (c.healthScore ?? 0) >= 80).length,
      riskCount: allForStats.filter((c) => (c.healthScore ?? 0) < 60).length,
      pendingVisitCount: 0,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        departments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        visitRecords: {
          where: { deletedAt: null },
          orderBy: { visitTime: 'desc' },
          take: 20,
        },
        equipment: {
          where: { deletedAt: null },
          take: 20,
        },
        intentions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        leads: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!customer) throw new NotFoundException('客户不存在')
    return customer
  }

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto })
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id)
    return this.prisma.customer.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
