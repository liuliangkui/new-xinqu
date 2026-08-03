/**
 * 审批中心模块 — 类型定义
 */

export enum ApprovalModule {
  LEAVE = 'leave',
  EXPENSE = 'expense',
  CONTRACT = 'contract',
  DISCOUNT = 'discount',
  PURCHASE = 'purchase',
  OTHER = 'other',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum ApprovalPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
}

export type ApprovalMode = 'serial' | 'parallel'
export type ApprovalRejectAction = 'end' | 'prev' | 'node'

export interface ApprovalTask {
  taskId: string
  nodeId?: string
  assigneeId?: string
  assigneeName?: string
  action?: 'approve' | 'reject' | 'transfer'
  comment?: string
  createdAt?: string
  completedAt?: string
}

export interface ApprovalCcRecord {
  ccRecordId: string
  userId?: string
  userName?: string
  readAt?: string
}

export interface Approval {
  approvalId: string
  approvalCode: string
  title: string
  businessKey?: string
  module: ApprovalModule
  status: ApprovalStatus
  priority?: ApprovalPriority
  applicantName?: string
  applicantId?: string
  currentApproverName?: string
  payload?: Record<string, unknown>
  tasks?: ApprovalTask[]
  ccRecords?: ApprovalCcRecord[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ApprovalForm {
  title: string
  businessKey?: string
  module?: ApprovalModule
  priority?: ApprovalPriority
  mode?: ApprovalMode
  rejectAction?: ApprovalRejectAction
  rejectTargetIndex?: number
  approverIds?: string[]
  approverId?: string
  payload?: Record<string, unknown>
  ccUserIds?: string[]
}

export interface ApprovalStats {
  totalCount: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  withdrawnCount: number
  initiatedCount?: number
  ccCount?: number
}

export interface ApprovalListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  module?: string
  status?: string
  tabType?: 'all' | 'pending' | 'approved' | 'cc' | 'initiated'
}

export interface ApprovalListResult {
  list: Approval[]
  total: number
  pageNum: number
  pageSize: number
  stats: ApprovalStats
}

export interface ApprovalTimelineNode {
  nodeId: string
  nodeName?: string
  assigneeId?: string
  assigneeName?: string
  action?: 'approve' | 'reject'
  comment?: string
  startTime?: string
  endTime?: string
}

export interface ApprovalTimelineResult {
  instanceId: string
  timeline: ApprovalTimelineNode[]
}
