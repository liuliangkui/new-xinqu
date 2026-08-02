/**
 * 消息中心 — Mock
 */
import type { Message, MessageListResult, MessageListParams } from './types'

let messages: Message[] = [
  {
    messageId: 'm1',
    title: '折扣审批已通过',
    content: '您提交的「XN-550 采购折扣审批」已通过销售总监审批，请尽快跟进合同签订。',
    type: 'APPROVAL',
    status: 'UNREAD',
    senderName: '系统',
    businessType: 'APPROVAL',
    businessId: 'a1',
    route: '/approval',
    createdAt: '2026-07-30T09:00:00Z',
  },
  {
    messageId: 'm2',
    title: '任务即将到期',
    content: '您负责的「昆明市第一人民医院回访」任务将于今日 18:00 到期。',
    type: 'TASK',
    status: 'UNREAD',
    senderName: '系统',
    businessType: 'TASK',
    businessId: 't1',
    route: '/tasks',
    createdAt: '2026-07-30T08:00:00Z',
  },
  {
    messageId: 'm3',
    title: '系统维护通知',
    content: '系统将于本周六 02:00-04:00 进行例行维护，请提前保存工作。',
    type: 'SYSTEM',
    status: 'READ',
    senderName: '系统管理员',
    createdAt: '2026-07-29T10:00:00Z',
  },
  {
    messageId: 'm4',
    title: '库存预警',
    content: '「生化试剂 B」当前库存 85，已低于安全库存 120，请及时补货。',
    type: 'REMIND',
    status: 'UNREAD',
    senderName: '系统',
    businessType: 'REAGENT',
    businessId: 'r2',
    route: '/reagent',
    createdAt: '2026-07-29T14:00:00Z',
  },
]

export function generateMessageList(params?: MessageListParams): MessageListResult {
  let list = [...messages]
  if (params?.status) {
    list = list.filter((m) => m.status === params.status)
  }
  if (params?.type) {
    list = list.filter((m) => m.type === params.type)
  }
  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length
  return { list, total: list.length, unreadCount }
}

export function markMessageReadInMock(id: string): Message | null {
  const idx = messages.findIndex((m) => m.messageId === id)
  if (idx === -1) return null
  messages[idx] = { ...messages[idx], status: 'READ' } as Message
  return messages[idx]
}

export function markAllReadInMock(): boolean {
  messages = messages.map((m) => ({ ...m, status: 'READ' }))
  return true
}
