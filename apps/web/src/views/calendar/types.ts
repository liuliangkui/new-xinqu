/**
 * 日历模块 — 类型定义
 */

/** 日程类型 */
export enum CalendarEventType {
  CUSTOMER_VISIT = 1,
  INTENTION_FOLLOW = 2,
  MEETING = 3,
  TASK_DEADLINE = 4,
  KEY_NODE = 5,
}

/** 日程状态 */
export enum CalendarEventStatus {
  DRAFT = 0,
  PENDING = 1,
  COMPLETED = 2,
  CANCELLED = 9,
}

/** 日程来源 */
export enum CalendarEventSource {
  MANUAL = 1,
  INTENTION = 2,
  TASK = 3,
  TICKET = 4,
  ACADEMIC = 5,
}

export const eventTypeColors: Record<number, string> = {
  [CalendarEventType.CUSTOMER_VISIT]: '#3370FF',
  [CalendarEventType.INTENTION_FOLLOW]: '#FF8800',
  [CalendarEventType.MEETING]: '#7C3AED',
  [CalendarEventType.TASK_DEADLINE]: '#34C724',
  [CalendarEventType.KEY_NODE]: '#F54A45',
}

export const eventTypeNames: Record<number, string> = {
  [CalendarEventType.CUSTOMER_VISIT]: '客户拜访',
  [CalendarEventType.INTENTION_FOLLOW]: '意向跟进',
  [CalendarEventType.MEETING]: '会议/学术',
  [CalendarEventType.TASK_DEADLINE]: '任务截止',
  [CalendarEventType.KEY_NODE]: '关键节点',
}

export interface CalendarEvent {
  id: string
  eventCode: string
  eventType: CalendarEventType
  eventStatus: CalendarEventStatus
  subject: string
  startTime: string
  endTime: string
  customerId?: string
  customerName?: string
  intentionId?: string
  intentionName?: string
  attendeeIds?: string[]
  attendeeNames?: string
  remark?: string
  sourceType: CalendarEventSource
  ownerId: string
  ownerName: string
  signInTime?: string
  signInLocation?: string
  longitude?: number
  latitude?: number
  completedTime?: string
  reminderFlag: boolean
  createTime?: string
  updateTime?: string
}

export interface CalendarEventForm {
  id?: string
  eventType?: CalendarEventType
  subject?: string
  startTime?: string
  endTime?: string
  customerId?: string
  customerName?: string
  intentionId?: string
  intentionName?: string
  attendeeIds?: string[]
  attendeeNames?: string
  remark?: string
  reminderFlag?: boolean
}

export interface CalendarEventListParams {
  queryDate: string
  ownerScope?: string
  eventType?: number
  keyword?: string
  pageNum: number
  pageSize: number
}

export interface CalendarEventListResult {
  list: CalendarEvent[]
  total: number
  pageNum: number
  pageSize: number
}

export interface CalendarMonthDotsResult {
  dateDotMap: Record<string, number[]>
}

export interface CalendarStatsResult {
  todayCount: number
  weekCount: number
  pendingCount: number
}

export interface CalendarSaveResult {
  id: string
  eventCode: string
}

export interface CalendarCheckInResult {
  success: boolean
  distance?: number
}

export interface CalendarCompleteResult {
  success: boolean
  completedTime?: string
}
