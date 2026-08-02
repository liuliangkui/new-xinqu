/**
 * 品牌库管理 — 类型定义
 */

export type BrandStatus = 'ACTIVE' | 'INACTIVE'

export interface Brand {
  brandId: string
  brandName: string
  brandCode: string
  manufacturer: string
  category: string
  productCount: number
  status: BrandStatus
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface BrandForm {
  brandId?: string
  brandName: string
  brandCode: string
  manufacturer: string
  category: string
  status?: BrandStatus
  remark?: string
}

export interface BrandListResult {
  list: Brand[]
  total: number
}

export interface BrandStats {
  totalCount: number
  activeCount: number
  inactiveCount: number
  productCount: number
}

export interface BrandListParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: string
  category?: string
  [key: string]: unknown
}
