import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { RedisService } from '@/redis/redis.service'

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks: Record<string, string> = {}

    try {
      await this.prisma.$queryRaw`SELECT 1`
      checks.database = 'ok'
    } catch {
      checks.database = 'error'
    }

    try {
      await this.redis.getClient().ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
    }

    const allOk = Object.values(checks).every((v) => v === 'ok')

    return {
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks,
    }
  }
}
