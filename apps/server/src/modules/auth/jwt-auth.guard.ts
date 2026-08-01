import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }
    return super.canActivate(context)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('未授权，请先登录')
    }
    return user
  }
}
