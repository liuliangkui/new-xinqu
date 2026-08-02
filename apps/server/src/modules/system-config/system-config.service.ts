import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { SystemConfigQueryDto } from './dto/system-config-query.dto'
import type { CreateSystemConfigDto } from './dto/create-system-config.dto'
import type { UpdateSystemConfigDto } from './dto/update-system-config.dto'

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SystemConfigQueryDto) {
    const { module, keyword } = query
    const where: { module?: string; deletedAt: null; OR?: unknown[] } = { deletedAt: null }
    if (module) where.module = module
    if (keyword) {
      where.OR = [{ key: { contains: keyword } }, { description: { contains: keyword } }]
    }
    const list = await this.prisma.systemConfig.findMany({ where, orderBy: { updatedAt: 'desc' } })
    return { list, total: list.length }
  }

  async findOne(id: string) {
    const item = await this.prisma.systemConfig.findUnique({ where: { id } })
    if (!item) throw new NotFoundException('配置不存在')
    return item
  }

  async create(dto: CreateSystemConfigDto) {
    return this.prisma.systemConfig.create({ data: dto })
  }

  async update(id: string, dto: UpdateSystemConfigDto) {
    await this.findOne(id)
    return this.prisma.systemConfig.update({ where: { id }, data: dto })
  }

  async getNumber(module: string, key: string, defaultValue: number): Promise<number> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { module_key: { module, key } },
    })
    if (!config || config.status !== 'ACTIVE') return defaultValue
    return Number(config.value)
  }

  async getString(module: string, key: string, defaultValue: string): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { module_key: { module, key } },
    })
    if (!config || config.status !== 'ACTIVE') return defaultValue
    return config.value
  }

  async getBoolean(module: string, key: string, defaultValue: boolean): Promise<boolean> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { module_key: { module, key } },
    })
    if (!config || config.status !== 'ACTIVE') return defaultValue
    return config.value.toLowerCase() === 'true'
  }

  async setValue(
    module: string,
    key: string,
    value: string,
    operatorId: string,
    reason: string,
    description?: string,
    valueType = 'STRING',
  ) {
    const existing = await this.prisma.systemConfig.findUnique({
      where: { module_key: { module, key } },
    })

    if (existing) {
      await this.prisma.systemConfigHistory.create({
        data: {
          configId: existing.id,
          module,
          key,
          oldValue: existing.value,
          newValue: value,
          reason,
          operatorId,
        },
      })

      return this.prisma.systemConfig.update({
        where: { id: existing.id },
        data: { value, valueType, description },
      })
    }

    return this.prisma.systemConfig.create({
      data: { module, key, value, valueType, description },
    })
  }
}
