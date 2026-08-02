/**
 * 品牌库管理 — API 层
 */
import { get, post, put, del } from '@/api/request'
import type { Brand, BrandForm, BrandListResult, BrandListParams, BrandStats } from './types'

const BASE = '/brands'

/** 获取品牌列表 */
export function getBrandList(params?: BrandListParams): Promise<BrandListResult> {
  return get<BrandListResult>(BASE, params)
}

/** 获取品牌统计 */
export function getBrandStats(): Promise<BrandStats> {
  return get<BrandStats>(`${BASE}/stats`)
}

/** 保存品牌 */
export function saveBrand(data: BrandForm): Promise<Brand> {
  return data.brandId ? put<Brand>(`${BASE}/${data.brandId}`, data) : post<Brand>(BASE, data)
}

/** 删除品牌 */
export function deleteBrand(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${id}`)
}
