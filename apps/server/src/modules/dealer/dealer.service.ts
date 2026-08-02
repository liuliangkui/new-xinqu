import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateDealerDto } from './dto/create-dealer.dto'
import type { UpdateDealerDto } from './dto/update-dealer.dto'
import type { DealerQueryDto } from './dto/dealer-query.dto'

@Injectable()
export class DealerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: DealerQueryDto) {
    const { keyword, status, level } = query
    const where: { deletedAt: null; status?: string; level?: string; OR?: unknown[] } = { deletedAt: null }
    if (status) where.status = status
    if (level) where.level = level
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }

    const [list, total] = await Promise.all([
      this.prisma.dealer.findMany({
        where,
        include: {
          _count: { select: { inventory: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dealer.count({ where }),
    ])

    return {
      list: list.map((d) => ({
        ...d,
        inventoryCount: d._count.inventory,
        orderCount: d._count.orders,
      })),
      total,
    }
  }

  async findOne(id: string) {
    const item = await this.prisma.dealer.findUnique({
      where: { id },
      include: { contracts: true, orders: true, inventory: true },
    })
    if (!item) throw new NotFoundException('经销商不存在')
    return item
  }

  async create(dto: CreateDealerDto) {
    const exists = await this.prisma.dealer.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('经销商编码已存在')
    return this.prisma.dealer.create({
      data: {
        ...dto,
        authorizedAt: dto.authorizedAt ? new Date(dto.authorizedAt) : undefined,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
      },
    })
  }

  async update(id: string, dto: UpdateDealerDto) {
    await this.findOne(id)
    return this.prisma.dealer.update({
      where: { id },
      data: {
        ...dto,
        authorizedAt: dto.authorizedAt ? new Date(dto.authorizedAt) : undefined,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.dealer.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
