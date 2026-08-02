import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateBrandDto } from './dto/create-brand.dto'
import type { UpdateBrandDto } from './dto/update-brand.dto'
import type { BrandQueryDto } from './dto/brand-query.dto'

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BrandQueryDto) {
    const { keyword, status, category } = query
    const where: { deletedAt: null; status?: string; category?: string; OR?: unknown[] } = {
      deletedAt: null,
    }
    if (status) where.status = status
    if (category) where.category = category
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }

    const [list, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.brand.count({ where }),
    ])

    return {
      list: list.map((b) => ({ ...b, productCount: b._count.products })),
      total,
    }
  }

  async findOne(id: string) {
    const item = await this.prisma.brand.findUnique({ where: { id }, include: { products: true } })
    if (!item) throw new NotFoundException('品牌不存在')
    return item
  }

  async create(dto: CreateBrandDto) {
    const exists = await this.prisma.brand.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('品牌编码已存在')
    return this.prisma.brand.create({ data: dto })
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id)
    return this.prisma.brand.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
