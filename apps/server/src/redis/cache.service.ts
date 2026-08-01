import { Injectable, Logger } from '@nestjs/common'
import { RedisService } from './redis.service'

export interface CacheOptions {
  ttl?: number
  tags?: string[]
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly prefix = 'xqcop:'
  private readonly tagPrefix = 'xqcop:tag:'

  constructor(private readonly redisService: RedisService) {}

  private buildKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisService.getClient().get(this.buildKey(key))
    if (value === null || value === undefined) {
      return null
    }
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    const client = this.redisService.getClient()
    const fullKey = this.buildKey(key)

    if (options.ttl && options.ttl > 0) {
      await client.set(fullKey, serialized, 'EX', options.ttl)
    } else {
      await client.set(fullKey, serialized)
    }

    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await client.sadd(`${this.tagPrefix}${tag}`, fullKey)
      }
    }
  }

  async del(key: string): Promise<void> {
    await this.redisService.getClient().del(this.buildKey(key))
  }

  async delPattern(pattern: string): Promise<void> {
    const client = this.redisService.getClient()
    const keys: string[] = []
    const stream = client.scanStream({ match: this.buildKey(pattern), count: 100 })

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (resultKeys: string[]) => keys.push(...resultKeys))
      stream.on('end', () => resolve())
      stream.on('error', (err) => reject(err))
    })

    if (keys.length > 0) {
      await client.del(...keys)
    }
  }

  async invalidateTag(tag: string): Promise<void> {
    const client = this.redisService.getClient()
    const tagKey = `${this.tagPrefix}${tag}`
    const keys = await client.smembers(tagKey)
    if (keys.length > 0) {
      await client.del(...keys)
      await client.del(tagKey)
    }
  }

  async remember<T>(key: string, factory: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, options)
    return value
  }

  async flush(): Promise<void> {
    await this.delPattern('*')
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisService.getClient().exists(this.buildKey(key))
    return result === 1
  }
}
