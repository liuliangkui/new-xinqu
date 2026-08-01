/**
 * 收藏夹 — 类型定义
 */

export type FavoriteType = 'APP' | 'CUSTOMER' | 'LEAD' | 'INTENTION'

export interface FavoriteItem {
  id: string
  targetType: FavoriteType
  targetId: string
  title: string
  subtitle?: string
  icon?: string
  route?: string
  createdAt: string
}

export interface FavoriteListResult {
  list: FavoriteItem[]
  total: number
}
