import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

export type DataScope = 'ALL' | 'SELF' | 'DEPT' | 'DEPT_AND_CHILD' | 'REGION'

export interface CurrentUser {
  userId: string
  username?: string
  roleIds: string[]
  departmentId?: string
  region?: string
}

@Injectable()
export class DataScopeHelper {
  constructor(private prisma: PrismaService) {}

  /**
   * 根据当前用户的数据权限范围，生成 Prisma where 条件
   * 目前支持：
   * - ALL：不过滤
   * - SELF：只查 ownerId = 当前用户的数据
   * - DEPT / DEPT_AND_CHILD / REGION：占位，后续按组织架构/区域扩展
   */
  async apply<T extends Record<string, unknown>>(
    user: CurrentUser,
    model: string,
    baseWhere: T = {} as T,
  ): Promise<T & Record<string, unknown>> {
    const scope = await this.resolveDataScope(user.roleIds)

    switch (scope) {
      case 'ALL':
        return baseWhere
      case 'SELF':
        return {
          ...baseWhere,
          ownerId: user.userId,
        }
      case 'DEPT':
      case 'DEPT_AND_CHILD':
        // 后续根据部门表 path 字段展开
        return {
          ...baseWhere,
          ownerId: user.userId,
        }
      case 'REGION':
        if (user.region) {
          return {
            ...baseWhere,
            region: user.region,
          }
        }
        return baseWhere
      default:
        return baseWhere
    }
  }

  private async resolveDataScope(roleIds: string[]): Promise<DataScope> {
    if (roleIds.length === 0) return 'SELF'

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds }, status: 'ACTIVE' },
    })

    // 任一角色为 ALL 则取最大范围
    if (roles.some((r) => r.dataScope === 'ALL')) return 'ALL'
    if (roles.some((r) => r.dataScope === 'REGION')) return 'REGION'
    if (roles.some((r) => r.dataScope === 'DEPT_AND_CHILD')) return 'DEPT_AND_CHILD'
    if (roles.some((r) => r.dataScope === 'DEPT')) return 'DEPT'
    return 'SELF'
  }
}
