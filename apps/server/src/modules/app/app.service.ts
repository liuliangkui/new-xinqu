import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import type { AppQueryDto } from './dto/app-query.dto'

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: AppQueryDto) {
    const { page = 1, pageSize = 100, keyword, category, status } = query

    const baseWhere: {
      OR?: unknown[]
      category?: string
      status?: string
      deletedAt?: null
    } = { deletedAt: null, status: 'ACTIVE' }

    if (keyword) {
      baseWhere.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }
    if (category) baseWhere.category = category
    if (status) baseWhere.status = status

    const where = await this.dataScope.apply(user, 'app', baseWhere)

    const [list, total] = await Promise.all([
      this.prisma.app.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.app.count({ where }),
    ])

    return { list, total, page, pageSize }
  }

  async findOne(id: string) {
    const app = await this.prisma.app.findUnique({ where: { id } })
    if (!app) throw new NotFoundException('应用不存在')
    return app
  }

  async create(dto: CreateAppDto) {
    return this.prisma.app.create({ data: dto })
  }

  async update(id: string, dto: UpdateAppDto) {
    await this.findOne(id)
    return this.prisma.app.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.app.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
