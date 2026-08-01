import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'

interface LoginAttempt {
  count: number
  lockedUntil: number
}

@Injectable()
export class AuthService {
  private readonly loginAttempts = new Map<string, LoginAttempt>()
  private readonly maxAttempts = 5
  private readonly lockDuration = 15 * 60 * 1000 // 15 分钟

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } })
    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return null

    return user
  }

  async login(username: string, password: string) {
    const now = Date.now()
    const attempt = this.loginAttempts.get(username)

    if (attempt && attempt.lockedUntil > now) {
      const remainMinutes = Math.ceil((attempt.lockedUntil - now) / 60000)
      throw new UnauthorizedException(`账号已锁定，请 ${remainMinutes} 分钟后重试`)
    }

    const user = await this.validateUser(username, password)
    if (!user) {
      this.recordFailedLogin(username)
      throw new UnauthorizedException('用户名或密码错误')
    }

    this.loginAttempts.delete(username)

    const payload = { sub: user.id, username: user.username }
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '2h'),
    })

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    }
  }

  private recordFailedLogin(username: string) {
    const now = Date.now()
    const current = this.loginAttempts.get(username)

    if (!current || current.lockedUntil < now) {
      this.loginAttempts.set(username, { count: 1, lockedUntil: 0 })
      return
    }

    const newCount = current.count + 1
    if (newCount >= this.maxAttempts) {
      this.loginAttempts.set(username, {
        count: newCount,
        lockedUntil: now + this.lockDuration,
      })
    } else {
      this.loginAttempts.set(username, {
        count: newCount,
        lockedUntil: current.lockedUntil,
      })
    }
  }
}
