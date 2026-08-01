/**
 * 工单管理 — API 层
 * 对接后端 /tickets REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { Ticket, TicketForm, TicketListParams, TicketListResult } from './types'

const BASE = '/tickets'

/** 获取工单列表 */
export function getTicketList(params: TicketListParams): Promise<TicketListResult> {
  return get<TicketListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    status: params.status,
    priority: params.priority,
    type: params.type,
    tabType: params.tabType,
  })
}

/** 获取工单详情 */
export function getTicketDetail(ticketId: string | number): Promise<Ticket> {
  return get<Ticket>(`${BASE}/${ticketId}`)
}

/** 创建工单 */
export function createTicket(data: TicketForm): Promise<Ticket> {
  return post<Ticket>(BASE, data)
}

/** 更新工单 */
export function updateTicket(
  ticketId: string | number,
  data: Partial<TicketForm>,
): Promise<Ticket> {
  return put<Ticket>(`${BASE}/${ticketId}`, data)
}

/** 删除工单 */
export function deleteTicket(ticketId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${ticketId}`)
}
