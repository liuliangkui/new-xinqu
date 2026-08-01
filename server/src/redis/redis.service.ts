import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD', undefined),
      db: this.configService.get('REDIS_DB', 0),
      lazyConnect: true,
      retryStrategy: () => null,
    })

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`)
    })
  }

  getClient(): Redis {
    return this.client
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit()
    }
  }
}
