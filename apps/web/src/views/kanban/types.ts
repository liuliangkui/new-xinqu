/**
 * 工单看板 — 类型定义
 */

export type KanbanTicketStatus = 'PENDING' | 'PROCESSING' | 'WAITING' | 'RESOLVED' | 'CLOSED'
export type KanbanTicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export interface KanbanTicket {
  ticketId: string
  ticketCode: string
  title: string
  customerName: string
  status: KanbanTicketStatus
  priority: KanbanTicketPriority
  assigneeName: string
  deadline?: string
  createdAt: string
}

export interface KanbanColumn {
  status: KanbanTicketStatus
  title: string
  tickets: KanbanTicket[]
}

export interface KanbanListResult {
  columns: KanbanColumn[]
}

export interface KanbanStats {
  totalCount: number
  pendingCount: number
  processingCount: number
  waitingCount: number
  resolvedCount: number
}
