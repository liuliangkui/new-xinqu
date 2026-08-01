/**
 * 收藏夹 — API 层
 */
import { get, post } from '@/api/request'
import type { FavoriteItem, FavoriteListResult } from './types'

const BASE = '/favorites'

/** 获取收藏列表 */
export function getFavoriteList(): Promise<FavoriteListResult> {
  return get<FavoriteListResult>(BASE)
}

/** 取消收藏 */
export function removeFavorite(id: string): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`${BASE}/${id}/remove`)
}

/** 新增收藏 */
export function addFavorite(data: Partial<FavoriteItem>): Promise<FavoriteItem> {
  return post<FavoriteItem>(BASE, data)
}
