/**
 * 意向管理模块 — 类型定义
 */

export enum BusinessType {
  BID = 1,
  NON_BID = 2,
  TP = 3,
  DONATION = 4,
}

export enum IntentionStatus {
  DRAFT = 'draft',
  APPROVING = 'approving',
  EFFECTIVE = 'effective',
  REJECTED = 'rejected',
  CLOSED = 'closed',
}

export interface Intention {
  intentionId: number
  intentionCode: string
  customerName: string
  projectName: string
  businessType: BusinessType
  status: IntentionStatus
  amount?: number
  productLine: string
  ownerName: string
  createTime: string
  updateTime: string
  approvalLog?: Array<{ time: string; operator: string; action: string; comment?: string }>
}

export interface IntentionStats {
  totalCount: number
  draftCount: number
  approvingCount: number
  effectiveCount: number
  rejectedCount: number
  closedCount: number
}

export interface IntentionListResult {
  list: Intention[]
  total: number
  pageNum: number
  pageSize: number
  stats: IntentionStats
}
