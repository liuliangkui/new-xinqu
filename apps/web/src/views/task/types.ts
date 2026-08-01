/**
 * 任务管理模块 — 类型定义
 */

export enum TaskType {
  FOLLOW_UP = 'follow_up',
  VISIT = 'visit',
  PHONE = 'phone',
  MEETING = 'meeting',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Task {
  taskId: number
  taskCode: string
  title: string
  description?: string
  taskType: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  customerName?: string
  customerId?: string
  leadId?: string
  intentionId?: string
  ticketId?: string
  ownerName?: string
  ownerId?: string
  participantNames?: string[]
  participantIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface TaskForm {
  title: string
  description?: string
  taskType?: TaskType
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string
  customerName?: string
  customerId?: string
  ownerName?: string
  ownerId?: string
  participantNames?: string[]
  participantIds?: string[]
}

export interface TaskStats {
  totalCount: number
  pendingCount: number
  processingCount: number
  completedCount: number
  overdueCount: number
  urgentCount: number
}

export interface TaskListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  taskType?: string
  priority?: string
  status?: string
  tabType?: 'all' | 'my' | 'team' | 'collaboration' | 'overdue'
}

export interface TaskListResult {
  list: Task[]
  total: number
  pageNum: number
  pageSize: number
  stats: TaskStats
}
