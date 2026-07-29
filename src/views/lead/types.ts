/**
 * 线索管理模块 — 类型定义
 */

/** 线索来源 */
export enum LeadSource {
  SELF_COLLECTED = 1,
  EXHIBITION = 2,
  DEALER = 3,
  WEBSITE = 4,
  REFERRAL = 5,
  OTHER = 6,
}

/** 线索状态 */
export enum LeadStatus {
  PENDING = 'pending',
  FOLLOWING = 'following',
  CONVERTED = 'converted',
  DISCARDED = 'discarded',
  RECYCLED = 'recycled',
}

export interface Lead {
  leadId: number
  leadCode: string
  customerName: string
  department?: string
  productLine: string
  leadSummary: string
  sourceType: LeadSource
  status: LeadStatus
  amount?: number
  decisionDate?: string
  assigneeId?: number
  assigneeName?: string
  followDeadline?: string
  nextFollowTime?: string
  creatorName: string
  createTime: string
  updateTime: string
  remark?: string
  followRecords?: FollowRecord[]
}

export interface FollowRecord {
  id: number
  followType: string
  content: string
  nextPlan?: string
  creatorName: string
  createTime: string
}

export interface LeadStats {
  monthNewCount: number
  pendingCount: number
  followingCount: number
  conversionRate: number
}

export interface LeadListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  sourceType?: number
  status?: string
  tabType?: 'all' | 'my' | 'pool' | 'team'
}

export interface LeadListResult {
  list: Lead[]
  total: number
  pageNum: number
  pageSize: number
  stats: LeadStats
}
