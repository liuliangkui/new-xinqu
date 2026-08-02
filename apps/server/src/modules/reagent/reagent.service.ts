import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateReagentDto } from './dto/create-reagent.dto'
import type { UpdateReagentDto } from './dto/update-reagent.dto'
import type { ReagentQueryDto } from './dto/reagent-query.dto'

@Injectable()
export class ReagentService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ReagentQueryDto) {
    const { keyword, status, brandId } = query
    const where: { deletedAt: null; category: string; status?: string; brandId?: string; OR?: unknown[] } = {
      deletedAt: null,
      category: 'REAGENT',
    }
    if (status) where.status = status
    if (brandId) where.brandId = brandId
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }

    const list = await this.prisma.product.findMany({
      where,
      include: { brand: true, reagentBatches: { where: { deletedAt: null } } },
      orderBy: { createdAt: 'desc' },
    })

    return {
      list: list.map((p) => ({
        ...p,
        stock: p.reagentBatches.reduce((sum, b) => sum + b.stock, 0),
        safetyStock: 0,
      })),
      total: list.length,
    }
  }

  async findOne(id: string) {
    const item = await this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, reagentBatches: { where: { deletedAt: null } } },
    })
    if (!item) throw new NotFoundException('试剂不存在')
    return item
  }

  async create(dto: CreateReagentDto) {
    const exists = await this.prisma.product.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('试剂编码已存在')
    return this.prisma.product.create({
      data: { ...dto, category: 'REAGENT' },
    })
  }

  async update(id: string, dto: UpdateReagentDto) {
    await this.findOne(id)
    return this.prisma.product.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
