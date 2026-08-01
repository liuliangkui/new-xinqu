import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext) {
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
