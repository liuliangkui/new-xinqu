import { Controller, Get, Post, Body, Req } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import { Public } from '@/common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import type { Request } from 'express'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @SkipThrottle()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password)
  }

  @Get('profile')
  @ApiOperation({ summary: '当前登录用户信息' })
  async profile(@Req() req: Request) {
    const user = (req as Request & { user: { userId: string } }).user
    return this.authService.getProfile(user.userId)
  }
}
