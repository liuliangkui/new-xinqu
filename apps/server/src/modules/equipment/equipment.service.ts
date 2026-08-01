import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateEquipmentDto } from './dto/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/update-equipment.dto'
import type { EquipmentQueryDto } from './dto/equipment-query.dto'

@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: EquipmentQueryDto) {
    const { page = 1, pageSize = 20, keyword, customerId, productId, ownerId, status } = query

    const baseWhere: {
      OR?: unknown[]
      customerId?: string
      productId?: string
      ownerId?: string
      status?: string
    } = {}

    if (keyword) {
      baseWhere.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
        { serialNo: { contains: keyword } },
      ]
    }
    if (customerId) baseWhere.customerId = customerId
    if (productId) baseWhere.productId = productId
    if (ownerId) baseWhere.ownerId = ownerId
    if (status) baseWhere.status = status

    const where = await this.dataScope.apply(user, 'equipment', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.findMany({
        where,
        select: { status: true },
      }),
    ])

    const stats = {
      equipmentTotalCount: total,
      runningCount: allForStats.filter((e) => e.status === 'RUNNING').length,
      maintainingCount: allForStats.filter((e) => e.status === 'MAINTAINING').length,
      scrappedCount: allForStats.filter((e) => e.status === 'SCRAPPED').length,
    }

    return { list, total, page, pageSize, stats }
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
    if (!equipment) throw new NotFoundException('设备不存在')
    return equipment
  }

  async create(dto: CreateEquipmentDto) {
    return this.prisma.equipment.create({
      data: {
        ...dto,
        installDate: dto.installDate ? new Date(dto.installDate) : undefined,
        warrantyExpire: dto.warrantyExpire ? new Date(dto.warrantyExpire) : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.findOne(id)
    return this.prisma.equipment.update({
      where: { id },
      data: {
        ...dto,
        installDate: dto.installDate ? new Date(dto.installDate) : undefined,
        warrantyExpire: dto.warrantyExpire ? new Date(dto.warrantyExpire) : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.equipment.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
