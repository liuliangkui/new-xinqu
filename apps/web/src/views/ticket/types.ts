/**
 * 工单管理模块 — 类型定义
 */

export enum TicketType {
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  CONSULT = 'consult',
  COMPLAINT = 'complaint',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface Ticket {
  ticketId: number
  ticketCode: string
  title: string
  type: TicketType
  priority: TicketPriority
  status: TicketStatus
  customerName?: string
  equipmentName?: string
  reporterName?: string
  assigneeName?: string
  source?: string
  content: string
  solution?: string
  createdAt: string
  updatedAt: string
}

export interface TicketForm {
  title: string
  type?: TicketType
  priority?: TicketPriority
  status?: TicketStatus
  customerName?: string
  equipmentName?: string
  reporterName?: string
  assigneeName?: string
  source?: string
  content: string
  solution?: string
}

export interface TicketStats {
  totalCount: number
  pendingCount: number
  processingCount: number
  waitingCount: number
  resolvedCount: number
  closedCount: number
  urgentCount: number
}

export interface TicketListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  priority?: string
  type?: string
  tabType?: 'all' | 'my' | 'pending' | 'processing' | 'overdue'
}

export interface TicketListResult {
  list: Ticket[]
  total: number
  pageNum: number
  pageSize: number
  stats: TicketStats
}
