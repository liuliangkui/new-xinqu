/**
 * 试剂运营 — 类型定义
 */

export type ReagentStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface Reagent {
  reagentId: string
  reagentName: string
  reagentCode: string
  brandName: string
  category: string
  specification: string
  unit: string
  price: number
  stock: number
  safetyStock: number
  status: ReagentStatus
  createdAt: string
  updatedAt: string
}

export interface ReagentForm {
  reagentId?: string
  reagentName: string
  reagentCode: string
  brandName: string
  category: string
  specification: string
  unit: string
  price: number
  stock: number
  safetyStock: number
  status?: ReagentStatus
}

export interface ReagentListResult {
  list: Reagent[]
  total: number
}

export interface ReagentStats {
  totalCount: number
  activeCount: number
  lowStockCount: number
  discontinuedCount: number
}

export interface ReagentListParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: string
  category?: string
  [key: string]: unknown
}
