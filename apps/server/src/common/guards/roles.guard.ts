import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '@/prisma/prisma.service'
import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator'
import { BusinessException } from '@/common/exceptions/business.exception'

export interface Permission {
  resource: string
  action: string
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // 没有声明权限则放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new BusinessException('AUTH_002', '无法获取当前用户权限', 403)
    }

    // 超级管理员放行
    if (user.permissions?.includes('*')) {
      return true
    }

    const permissions = await this.resolvePermissions(user.roleIds || [])

    const hasPermission = requiredPermissions.some((p) => permissions.has(p))
    if (!hasPermission) {
      throw new BusinessException('PERM_001', '权限不足，无法访问该资源', 403)
    }

    return true
  }

  private async resolvePermissions(roleIds: string[]): Promise<Set<string>> {
    if (roleIds.length === 0) {
      return new Set()
    }

    const roles = await this.prisma.role.findMany({
      where: {
        id: { in: roleIds },
        status: 'ACTIVE',
      },
    })

    const permissions = new Set<string>()
    for (const role of roles) {
      const rolePermissions = (role.permissions as unknown as Permission[] | undefined) || []
      for (const p of rolePermissions) {
        permissions.add(`${p.resource}:${p.action}`)
      }
    }

    return permissions
  }
}
