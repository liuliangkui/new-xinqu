/**
 * 应用中心 — API 层
 * 对接后端 /apps REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { AppItem, AppForm, AppListParams, AppListResult } from './types'

const BASE = '/apps'

/** 获取应用列表 */
export function getAppList(params: AppListParams): Promise<AppListResult> {
  return get<AppListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    category: params.category,
    status: params.status,
  })
}

/** 获取应用详情 */
export function getAppDetail(appId: string): Promise<AppItem> {
  return get<AppItem>(`${BASE}/${appId}`)
}

/** 创建应用 */
export function createApp(data: AppForm): Promise<AppItem> {
  return post<AppItem>(BASE, data)
}

/** 更新应用 */
export function updateApp(appId: string, data: Partial<AppForm>): Promise<AppItem> {
  return put<AppItem>(`${BASE}/${appId}`, data)
}

/** 删除应用 */
export function deleteApp(appId: string): Promise<unknown> {
  return del<unknown>(`${BASE}/${appId}`)
}

/** 切换收藏状态 */
export function toggleFavorite(appId: string, isFavorite: boolean): Promise<boolean> {
  return post<boolean>(`${BASE}/${appId}/favorite`, { isFavorite })
}
