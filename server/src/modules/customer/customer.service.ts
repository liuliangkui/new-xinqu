import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { page: number; pageSize: number; keyword?: string; status?: string; level?: string }) {
    const { page, pageSize, keyword, status, level } = params
    const where: { OR?: unknown[]; status?: string; level?: string } = {}
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { tags: { has: keyword } }]
    }
    if (status) where.status = status
    if (level) where.level = level

    const [list, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ])

    return { list, total, page, pageSize }
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        departments: true,
        visitRecords: { orderBy: { visitTime: 'desc' }, take: 10 },
      },
    })
    if (!customer) throw new NotFoundException('客户不存在')
    return customer
  }

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto })
  }

  async update(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.prisma.customer.delete({ where: { id } })
    return { success: true }
  }
}
