import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { softDeleteExtension } from './extensions/soft-delete.extension'

export type ExtendedPrismaClient = Record<string, unknown>

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)
  private readonly extendedClient: ExtendedPrismaClient

  constructor() {
    super()
    this.extendedClient = this.$extends(softDeleteExtension as unknown) as ExtendedPrismaClient

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) {
          return (target as unknown as Record<string, unknown>)[prop as string]
        }
        return (this.extendedClient as Record<string, unknown>)[prop as string]
      },
    }) as PrismaService
  }

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Database connected')
    } catch (error) {
      this.logger.error('Database connection failed, app will continue running', error)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async runInTransaction<T>(fn: (prisma: ExtendedPrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => fn(tx as ExtendedPrismaClient)) as Promise<T>
  }
}
