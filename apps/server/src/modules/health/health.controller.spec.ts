import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { PrismaService } from '@/prisma/prisma.service'
import { RedisService } from '@/redis/redis.service'

const mockPrisma = {
  $queryRaw: jest.fn(),
}

const mockRedisClient = {
  ping: jest.fn(),
}

const mockRedisService = {
  getClient: jest.fn().mockReturnValue(mockRedisClient),
}

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return ok when all services healthy', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ '1': 1 }])
    mockRedisClient.ping.mockResolvedValue('PONG')

    const result = await controller.check()

    expect(result.status).toBe('ok')
    expect(result.checks.database).toBe('ok')
    expect(result.checks.redis).toBe('ok')
  })

  it('should return error when database fails', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('DB error'))
    mockRedisClient.ping.mockResolvedValue('PONG')

    const result = await controller.check()

    expect(result.status).toBe('error')
    expect(result.checks.database).toBe('error')
  })
})
