/**
 * 消息中心 — API 层
 */
import { get, post, put } from '@/api/request'
import type { Message, MessageListResult, MessageListParams } from './types'

const BASE = '/messages'

/** 获取消息列表 */
export function getMessageList(params?: MessageListParams): Promise<MessageListResult> {
  return get<MessageListResult>(BASE, params)
}

/** 标记已读 */
export function markMessageRead(id: string): Promise<Message> {
  return put<Message>(`${BASE}/${id}/read`, {})
}

/** 全部已读 */
export function markAllRead(): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`${BASE}/read-all`, {})
}
