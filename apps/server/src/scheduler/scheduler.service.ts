import { Injectable, Logger } from '@nestjs/common'
import { Cron, Interval } from '@nestjs/schedule'
import dayjs from 'dayjs'
import { PrismaService } from '@/prisma/prisma.service'

const SOFT_DELETE_MODELS = [
  'systemConfig',
  'systemConfigHistory',
  'user',
  'department',
  'role',
  'customer',
  'contact',
  'customerDepartment',
  'visitRecord',
  'lead',
  'leadFollowRecord',
  'intention',
  'intentionStageRecord',
] as const

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 应用心跳，每 5 分钟记录一次，便于监控调度器是否存活
   */
  @Interval(1000 * 60 * 5)
  heartbeat(): void {
    this.logger.debug('Scheduler heartbeat')
  }

  /**
   * 每日凌晨 2 点清理 30 天前软删除的数据
   */
  @Cron('0 2 * * *')
  async cleanupSoftDeletedRecords(): Promise<void> {
    const threshold = dayjs().subtract(30, 'day').toDate()
    const prismaClient = this.prisma as unknown as Record<string, { deleteMany: (args: unknown) => Promise<unknown> }>

    for (const model of SOFT_DELETE_MODELS) {
      try {
        const result = await prismaClient[model].deleteMany({
          where: {
            deletedAt: {
              lt: threshold,
            },
          },
        })
        this.logger.log(`Cleaned up soft-deleted ${model}: ${JSON.stringify(result)}`)
      } catch (error) {
        this.logger.error(`Failed to cleanup soft-deleted ${model}`, error)
      }
    }
  }
}
