import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class AuthService {
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
    const user = await this.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误')
    }

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
}
