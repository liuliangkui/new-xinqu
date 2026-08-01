/**
 * 日历模块 — API 层
 * 对接后端 /calendar 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post } from '@/api/request'
import type {
  CalendarEvent,
  CalendarEventForm,
  CalendarEventListParams,
  CalendarEventListResult,
  CalendarMonthDotsResult,
  CalendarStatsResult,
  CalendarSaveResult,
  CalendarCheckInResult,
  CalendarCompleteResult,
} from './types'

const BASE = '/calendar'

/** 查询日程列表 */
export function getCalendarEventList(params: CalendarEventListParams): Promise<CalendarEventListResult> {
  return post<CalendarEventListResult>(`${BASE}/event/list`, params)
}

/** 查询月历事件圆点 */
export function getCalendarMonthDots(yearMonth: string, ownerScope?: string): Promise<CalendarMonthDotsResult> {
  return post<CalendarMonthDotsResult>(`${BASE}/event/month-dots`, { yearMonth, ownerScope })
}

/** 保存日程 */
export function saveCalendarEvent(data: CalendarEventForm): Promise<CalendarSaveResult> {
  return post<CalendarSaveResult>(`${BASE}/event/save`, data)
}

/** 删除日程 */
export function deleteCalendarEvent(id: string): Promise<{ success: boolean }> {
  return post<{ success: boolean }>(`${BASE}/event/delete/${id}`)
}

/** 查询日程详情 */
export function getCalendarEventDetail(id: string): Promise<CalendarEvent> {
  return get<CalendarEvent>(`${BASE}/event/detail/${id}`)
}

/** 日程签到 */
export function checkInCalendarEvent(
  id: string,
  data: { signInTime: string; signInLocation: string; longitude?: number; latitude?: number },
): Promise<CalendarCheckInResult> {
  return post<CalendarCheckInResult>(`${BASE}/event/check-in/${id}`, data)
}

/** 标记日程完成 */
export function completeCalendarEvent(id: string): Promise<CalendarCompleteResult> {
  return post<CalendarCompleteResult>(`${BASE}/event/complete/${id}`)
}

/** 查询日历统计 */
export function getCalendarStats(queryDate: string, ownerScope?: string): Promise<CalendarStatsResult> {
  return get<CalendarStatsResult>(`${BASE}/stats`, { queryDate, ownerScope })
}
