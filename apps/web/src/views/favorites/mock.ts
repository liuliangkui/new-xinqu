/**
 * 收藏夹 — Mock
 */
import { allApps } from '@/views/apps/mock'
import type { FavoriteItem, FavoriteListResult } from './types'

const favorites: FavoriteItem[] = [
  {
    id: 'f1',
    targetType: 'APP',
    targetId: '1',
    title: '工作台',
    icon: 'home',
    route: '/',
    createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'f2',
    targetType: 'APP',
    targetId: '3',
    title: '任务',
    icon: 'task',
    route: '/tasks',
    createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'f3',
    targetType: 'APP',
    targetId: '8',
    title: '客户 360°',
    icon: 'customer',
    route: '/customer',
    createdAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'f4',
    targetType: 'CUSTOMER',
    targetId: '1',
    title: '昆明市第一人民医院',
    subtitle: '三级甲等 · 昆明市',
    createdAt: '2026-07-29T10:00:00Z',
  },
  {
    id: 'f5',
    targetType: 'INTENTION',
    targetId: '1',
    title: 'XN-550 采购意向',
    subtitle: '预计金额 120 万',
    createdAt: '2026-07-29T10:00:00Z',
  },
]

export function generateFavoriteList(): FavoriteListResult {
  // 同步应用收藏状态
  const appFavorites = allApps
    .filter((a) => a.isFavorite)
    .map((a) => ({
      id: `fav-app-${a.appId}`,
      targetType: 'APP' as const,
      targetId: a.appId,
      title: a.name,
      icon: a.icon,
      route: a.route,
      createdAt: new Date().toISOString(),
    }))

  const nonAppFavorites = favorites.filter((f) => f.targetType !== 'APP')
  const merged = [...appFavorites, ...nonAppFavorites]
  return { list: merged, total: merged.length }
}

export function removeFavoriteFromMock(id: string): boolean {
  const idx = favorites.findIndex((f) => f.id === id)
  if (idx === -1) return false
  favorites.splice(idx, 1)
  return true
}

export function addFavoriteToMock(data: Partial<FavoriteItem>): FavoriteItem {
  const item: FavoriteItem = {
    id: `fav_${Date.now()}`,
    targetType: data.targetType || 'CUSTOMER',
    targetId: data.targetId || '',
    title: data.title || '未命名',
    subtitle: data.subtitle,
    icon: data.icon,
    route: data.route,
    createdAt: new Date().toISOString(),
  }
  favorites.unshift(item)
  return item
}
