import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @SkipThrottle()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password)
  }
}
