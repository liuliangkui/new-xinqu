import { SetMetadata } from '@nestjs/common'

export const PERMISSIONS_KEY = 'permissions'

/**
 * 声明接口所需的权限，格式：resource:action
 * 例：@Permissions('customer:create', 'customer:update')
 */
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions)
