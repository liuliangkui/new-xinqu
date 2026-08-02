/**
 * 消息中心 — 类型定义
 */

export type MessageType = 'SYSTEM' | 'TASK' | 'APPROVAL' | 'REMIND' | 'NOTICE'
export type MessageStatus = 'READ' | 'UNREAD'

export interface Message {
  messageId: string
  title: string
  content: string
  type: MessageType
  status: MessageStatus
  senderName: string
  businessType?: string
  businessId?: string
  route?: string
  createdAt: string
}

export interface MessageListResult {
  list: Message[]
  total: number
  unreadCount: number
}

export interface MessageListParams {
  pageNum?: number
  pageSize?: number
  status?: string
  type?: string
  [key: string]: unknown
}
