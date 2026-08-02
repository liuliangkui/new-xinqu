/**
 * 工单看板 — Mock
 */
import type { KanbanColumn, KanbanListResult, KanbanStats, KanbanTicket } from './types'

const tickets: KanbanTicket[] = [
  {
    ticketId: 'k1',
    ticketCode: 'TK-20260728-001',
    title: 'XN-550 设备报警处理',
    customerName: '昆明市第一人民医院',
    status: 'PENDING',
    priority: 'HIGH',
    assigneeName: '李工',
    deadline: '2026-07-29',
    createdAt: '2026-07-28T09:00:00Z',
  },
  {
    ticketId: 'k2',
    ticketCode: 'TK-20260728-002',
    title: '生化仪校准异常',
    customerName: '曲靖市第二人民医院',
    status: 'PROCESSING',
    priority: 'URGENT',
    assigneeName: '王工',
    deadline: '2026-07-28',
    createdAt: '2026-07-28T08:30:00Z',
  },
  {
    ticketId: 'k3',
    ticketCode: 'TK-20260728-003',
    title: '试剂更换指导',
    customerName: '玉溪市人民医院',
    status: 'WAITING',
    priority: 'NORMAL',
    assigneeName: '张工',
    deadline: '2026-07-30',
    createdAt: '2026-07-27T10:00:00Z',
  },
  {
    ticketId: 'k4',
    ticketCode: 'TK-20260727-004',
    title: '血球仪保养完成确认',
    customerName: '大理州人民医院',
    status: 'RESOLVED',
    priority: 'LOW',
    assigneeName: '赵工',
    deadline: '2026-07-27',
    createdAt: '2026-07-26T09:00:00Z',
  },
  {
    ticketId: 'k5',
    ticketCode: 'TK-20260726-005',
    title: '设备移机支持',
    customerName: '红河州第一人民医院',
    status: 'CLOSED',
    priority: 'NORMAL',
    assigneeName: '李工',
    deadline: '2026-07-25',
    createdAt: '2026-07-24T09:00:00Z',
  },
]

const columnConfig: { status: KanbanTicket['status']; title: string }[] = [
  { status: 'PENDING', title: '待处理' },
  { status: 'PROCESSING', title: '处理中' },
  { status: 'WAITING', title: '待反馈' },
  { status: 'RESOLVED', title: '已解决' },
  { status: 'CLOSED', title: '已关闭' },
]

export function generateKanbanData(): KanbanListResult {
  const columns: KanbanColumn[] = columnConfig.map((col) => ({
    ...col,
    tickets: tickets.filter((t) => t.status === col.status),
  }))
  return { columns }
}

export function generateKanbanStats(): KanbanStats {
  return {
    totalCount: tickets.length,
    pendingCount: tickets.filter((t) => t.status === 'PENDING').length,
    processingCount: tickets.filter((t) => t.status === 'PROCESSING').length,
    waitingCount: tickets.filter((t) => t.status === 'WAITING').length,
    resolvedCount: tickets.filter((t) => t.status === 'RESOLVED').length,
  }
}
