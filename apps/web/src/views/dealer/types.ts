/**
 * 经销商协同 — 类型定义
 */

export type DealerStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
export type DealerLevel = 'CORE' | 'AUTHORIZED' | 'GENERAL'

export interface Dealer {
  dealerId: string
  dealerName: string
  dealerCode: string
  regionName: string
  level: DealerLevel
  contactName: string
  contactPhone: string
  authorizedStartDate: string
  authorizedEndDate: string
  inventoryCount: number
  orderCount: number
  status: DealerStatus
  createdAt: string
  updatedAt: string
}

export interface DealerForm {
  dealerId?: string
  dealerName: string
  dealerCode: string
  regionName: string
  level: DealerLevel
  contactName: string
  contactPhone: string
  authorizedStartDate: string
  authorizedEndDate: string
  status?: DealerStatus
}

export interface DealerListResult {
  list: Dealer[]
  total: number
}

export interface DealerStats {
  totalCount: number
  coreCount: number
  authorizedCount: number
  expiredCount: number
}

export interface DealerListParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: string
  level?: string
  [key: string]: unknown
}
