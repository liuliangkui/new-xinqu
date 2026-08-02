import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateFavoriteDto } from './dto/create-favorite.dto'
import type { FavoriteQueryDto } from './dto/favorite-query.dto'

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: FavoriteQueryDto) {
    const { targetType } = query
    const where: { userId: string; targetType?: string; deletedAt: null } = {
      userId,
      deletedAt: null,
    }
    if (targetType) where.targetType = targetType

    const list = await this.prisma.userFavorite.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return { list, total: list.length }
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    return this.prisma.userFavorite.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
      create: { userId, ...dto },
      update: { deletedAt: null },
    })
  }

  async remove(userId: string, id: string) {
    const favorite = await this.prisma.userFavorite.findFirst({
      where: { id, userId, deletedAt: null },
    })
    if (!favorite) throw new NotFoundException('收藏不存在')
    await this.prisma.userFavorite.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
