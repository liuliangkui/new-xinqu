import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { PrismaService } from '@/prisma/prisma.service'

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
}

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
}

const mockConfigService = {
  get: jest.fn().mockReturnValue('secret'),
}

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('validateUser', () => {
    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const result = await service.validateUser('admin', 'admin123')
      expect(result).toBeNull()
    })
  })

  describe('login', () => {
    it('should throw UnauthorizedException when credentials invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(service.login('admin', 'wrong')).rejects.toThrow(UnauthorizedException)
    })
  })
})
