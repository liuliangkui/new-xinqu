import { Injectable, type ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

/**
 * 应用限流守卫
 * - 生产环境按 NestJS Throttler 配置执行限流
 * - 非生产环境（开发/测试）跳过限流，避免调试和频繁操作被误拦截
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      return true
    }
    return super.canActivate(context)
  }
}
