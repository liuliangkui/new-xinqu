import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

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
