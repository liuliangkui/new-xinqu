import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; pageSize: number; keyword?: string; status?: string; poolType?: string }) {
    const { page, pageSize, keyword, status, poolType } = params
    const where: { OR?: unknown[]; status?: string; poolType?: string } = {}
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { contactName: { contains: keyword } },
        { contactPhone: { contains: keyword } },
        { companyName: { contains: keyword } },
      ]
    }
    if (status) where.status = status
    if (poolType) where.poolType = poolType

    const [list, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ])

    return { list, total, page, pageSize }
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        followRecords: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!lead) throw new NotFoundException('线索不存在')
    return lead
  }

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: dto })
  }

  async update(id: string, dto: UpdateLeadDto) {
    return this.prisma.lead.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.prisma.lead.delete({ where: { id } })
    return { success: true }
  }
}
