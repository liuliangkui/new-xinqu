import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import type { AppQueryDto } from './dto/app-query.dto'

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: AppQueryDto) {
    const { page = 1, pageSize = 100, keyword, category, status } = query

    const where: {
      OR?: unknown[]
      category?: string
      status?: string
      deletedAt: null
    } = { deletedAt: null, status: 'ACTIVE' }

    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }
    if (category) where.category = category
    if (status) where.status = status

    const [list, total, favorites] = await Promise.all([
      this.prisma.app.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.app.count({ where }),
      this.prisma.userFavorite.findMany({
        where: { userId, targetType: 'APP', deletedAt: null },
        select: { targetId: true },
      }),
    ])

    const favoriteIds = new Set(favorites.map((f) => f.targetId))

    return {
      list: list.map((app) => ({
        appId: app.id,
        code: app.code,
        name: app.name,
        icon: app.icon,
        route: app.route,
        category: app.category,
        permissions: app.permissions,
        sortOrder: app.sortOrder,
        status: app.status,
        isFavorite: favoriteIds.has(app.id),
      })),
      total,
      page,
      pageSize,
    }
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

  async toggleFavorite(userId: string, appId: string, isFavorite: boolean) {
    await this.findOne(appId)

    if (isFavorite) {
      await this.prisma.userFavorite.upsert({
        where: {
          userId_targetType_targetId: {
            userId,
            targetType: 'APP',
            targetId: appId,
          },
        },
        create: {
          userId,
          targetType: 'APP',
          targetId: appId,
          sortOrder: 0,
        },
        update: { deletedAt: null },
      })
    } else {
      const favorite = await this.prisma.userFavorite.findFirst({
        where: { userId, targetType: 'APP', targetId: appId, deletedAt: null },
      })
      if (favorite) {
        await this.prisma.userFavorite.update({
          where: { id: favorite.id },
          data: { deletedAt: new Date() },
        })
      }
    }

    return isFavorite
  }
}
