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
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ApprovalPriority {
  NORMAL = 'normal',
  URGENT = 'urgent',
}

export type ApprovalMode = 'serial' | 'parallel'
export type ApprovalRejectAction = 'end' | 'prev' | 'node'

/** 审批阶段中的审批人 */
export interface ApprovalStageApprover {
  id: string
  name: string
  avatar?: string
}

/** 审批阶段：阶段之间串行，阶段内部可串行或并行 */
export interface ApprovalStage {
  id: string
  name: string
  mode: ApprovalMode
  approvers: ApprovalStageApprover[]
}

export interface ApprovalTask {
  taskId: string
  nodeId?: string
  assigneeId?: string
  assigneeName?: string
  action?: 'approve' | 'reject' | 'transfer' | 'withdraw'
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

export interface ApprovalFlowNode {
  id: string
  name: string
  assigneeId?: string
  assigneeName?: string
}

export interface ApprovalForm {
  title: string
  businessKey?: string
  module?: ApprovalModule
  priority?: ApprovalPriority
  mode?: ApprovalMode
  rejectAction?: ApprovalRejectAction
  rejectTargetIndex?: number
  /** 阶段化审批流（串/并行混合），优先级高于 nodes / approverIds */
  stages?: ApprovalStage[]
  approverIds?: string[]
  approverId?: string
  nodes?: ApprovalFlowNode[]
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
