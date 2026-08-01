/**
 * 工单管理 — Mock
 */
import type { Ticket, TicketForm, TicketListResult, TicketStats } from './types'
import { TicketType, TicketPriority, TicketStatus } from './types'

const customers = ['昆明市一院', '云南省一院', '大理州医院', '曲靖市一院', '玉溪市医院']
const equipments = ['XN-550 生化分析仪', 'XQ-MRI 1.5T', 'XQ-ECG Pro']
const types = Object.values(TicketType)
const priorities = Object.values(TicketPriority)
const statuses = Object.values(TicketStatus)

function makeTicket(id: number): Ticket {
  const status = statuses[id % statuses.length]!
  return {
    ticketId: id,
    ticketCode: `TK${String(id).padStart(6, '0')}`,
    title: `${customers[id % customers.length]!}${equipments[id % equipments.length]!}维修`,
    type: types[id % types.length]!,
    priority: priorities[id % priorities.length]!,
    status,
    customerName: customers[id % customers.length]!,
    equipmentName: equipments[id % equipments.length]!,
    reporterName: '张三',
    assigneeName: id % 3 === 0 ? '李四' : '张三',
    source: ['电话', '微信', 'APP', '代理商'][id % 4],
    content: '设备运行异常，需要尽快安排工程师上门检修。',
    solution:
      status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED
        ? '已更换配件，设备恢复正常'
        : undefined,
    createdAt: new Date(2026, 6, 28 - (id % 20)).toISOString(),
    updatedAt: new Date(2026, 6, 28 - (id % 10)).toISOString(),
  }
}

export const allTickets = Array.from({ length: 26 }, (_, i) => makeTicket(i + 1))

function filterTickets(params: {
  keyword?: string
  status?: string
  priority?: string
  type?: string
  tabType?: string
}): Ticket[] {
  let filtered = [...allTickets]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(kw) ||
        t.ticketCode.toLowerCase().includes(kw) ||
        (t.customerName && t.customerName.toLowerCase().includes(kw)),
    )
  }
  if (params.status) filtered = filtered.filter((t) => t.status === params.status)
  if (params.priority) filtered = filtered.filter((t) => t.priority === params.priority)
  if (params.type) filtered = filtered.filter((t) => t.type === params.type)
  if (params.tabType === 'my') filtered = filtered.filter((t) => t.assigneeName === '张三')
  if (params.tabType === 'pending')
    filtered = filtered.filter((t) => t.status === TicketStatus.PENDING)
  if (params.tabType === 'processing')
    filtered = filtered.filter((t) => t.status === TicketStatus.PROCESSING)
  if (params.tabType === 'overdue')
    filtered = filtered.filter(
      (t) => t.priority === TicketPriority.URGENT && t.status !== TicketStatus.CLOSED,
    )
  return filtered
}

function buildStats(filtered: Ticket[]): TicketStats {
  return {
    totalCount: filtered.length,
    pendingCount: filtered.filter((t) => t.status === TicketStatus.PENDING).length,
    processingCount: filtered.filter((t) => t.status === TicketStatus.PROCESSING).length,
    waitingCount: filtered.filter((t) => t.status === TicketStatus.WAITING).length,
    resolvedCount: filtered.filter((t) => t.status === TicketStatus.RESOLVED).length,
    closedCount: filtered.filter((t) => t.status === TicketStatus.CLOSED).length,
    urgentCount: filtered.filter(
      (t) => t.priority === TicketPriority.URGENT && t.status !== TicketStatus.CLOSED,
    ).length,
  }
}

export function generateTicketList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  priority?: string
  type?: string
  tabType?: string
}): TicketListResult {
  const filtered = filterTickets(params)
  const total = filtered.length
  const start = (params.pageNum - 1) * params.pageSize
  return {
    list: filtered.slice(start, start + params.pageSize),
    total,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    stats: buildStats(filtered),
  }
}

function nextTicketId(): number {
  return allTickets.length > 0 ? Math.max(...allTickets.map((t) => t.ticketId)) + 1 : 1
}

export function createTicketInMock(data: Partial<TicketForm>): Ticket {
  const now = new Date().toISOString()
  const id = nextTicketId()
  const ticket: Ticket = {
    ticketId: id,
    ticketCode: `TK${String(id).padStart(6, '0')}`,
    title: data.title || '新建工单',
    type: data.type ?? TicketType.REPAIR,
    priority: data.priority ?? TicketPriority.MEDIUM,
    status: data.status ?? TicketStatus.PENDING,
    customerName: data.customerName,
    equipmentName: data.equipmentName,
    reporterName: data.reporterName || '张三',
    assigneeName: data.assigneeName,
    source: data.source,
    content: data.content || '',
    solution: data.solution,
    createdAt: now,
    updatedAt: now,
  }
  allTickets.unshift(ticket)
  return ticket
}

export function updateTicketInMock(ticketId: number, data: Partial<TicketForm>): Ticket | null {
  const idx = allTickets.findIndex((t) => t.ticketId === ticketId)
  if (idx === -1) return null
  const existing = allTickets[idx]!
  const updated: Ticket = {
    ...existing,
    ...data,
    ticketId: existing.ticketId,
    ticketCode: existing.ticketCode,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }
  allTickets[idx] = updated
  return updated
}

export function deleteTicketFromMock(ticketId: number): boolean {
  const idx = allTickets.findIndex((t) => t.ticketId === ticketId)
  if (idx === -1) return false
  allTickets.splice(idx, 1)
  return true
}

export function mockGetTicketList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  priority?: string
  type?: string
  tabType?: string
}): Promise<TicketListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateTicketList(params))
    }, 300)
  })
}
