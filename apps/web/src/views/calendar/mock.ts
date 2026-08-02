/**
 * 日历模块 — Mock
 */
import dayjs from 'dayjs'
import type {
  CalendarEvent,
  CalendarEventListResult,
  CalendarMonthDotsResult,
  CalendarStatsResult,
  CalendarCheckInResult,
  CalendarCompleteResult,
  CalendarEventForm,
} from './types'
import { CalendarEventType, CalendarEventStatus, CalendarEventSource } from './types'

let idCounter = 100

function genId(): string {
  return `cal_${Date.now()}_${++idCounter}`
}

function genCode(): string {
  const date = dayjs().format('YYYYMMDD')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `EV${date}${random}`
}

function createBaseEvents(): CalendarEvent[] {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

  return [
    {
      id: genId(),
      eventCode: genCode(),
      eventType: CalendarEventType.CUSTOMER_VISIT,
      eventStatus: CalendarEventStatus.PENDING,
      subject: '昆明市第一人民医院方案汇报',
      startTime: `${today} 09:00`,
      endTime: `${today} 10:30`,
      customerId: '1',
      customerName: '昆明市第一人民医院',
      attendeeIds: ['1'],
      attendeeNames: '张三',
      sourceType: CalendarEventSource.MANUAL,
      ownerId: '1',
      ownerName: '当前用户',
      reminderFlag: true,
    },
    {
      id: genId(),
      eventCode: genCode(),
      eventType: CalendarEventType.INTENTION_FOLLOW,
      eventStatus: CalendarEventStatus.PENDING,
      subject: '玉溪市人民医院意向跟进',
      startTime: `${today} 10:45`,
      endTime: `${today} 11:30`,
      customerId: '2',
      customerName: '玉溪市人民医院',
      intentionId: '1',
      intentionName: 'XN-550 采购意向',
      sourceType: CalendarEventSource.MANUAL,
      ownerId: '1',
      ownerName: '当前用户',
      reminderFlag: true,
    },
    {
      id: genId(),
      eventCode: genCode(),
      eventType: CalendarEventType.MEETING,
      eventStatus: CalendarEventStatus.PENDING,
      subject: '科室会血液科产品培训',
      startTime: `${today} 14:00`,
      endTime: `${today} 15:30`,
      customerId: '3',
      customerName: '云南省肿瘤医院',
      attendeeIds: ['1', '2'],
      attendeeNames: '张三, 李四',
      sourceType: CalendarEventSource.ACADEMIC,
      ownerId: '1',
      ownerName: '当前用户',
      reminderFlag: true,
    },
    {
      id: genId(),
      eventCode: genCode(),
      eventType: CalendarEventType.TASK_DEADLINE,
      eventStatus: CalendarEventStatus.PENDING,
      subject: '提交本周拜访周报',
      startTime: `${today} 16:00`,
      endTime: `${today} 17:00`,
      sourceType: CalendarEventSource.TASK,
      ownerId: '1',
      ownerName: '当前用户',
      reminderFlag: true,
    },
    {
      id: genId(),
      eventCode: genCode(),
      eventType: CalendarEventType.KEY_NODE,
      eventStatus: CalendarEventStatus.PENDING,
      subject: '曲靖市一院招标截止',
      startTime: `${tomorrow} 10:00`,
      endTime: `${tomorrow} 10:30`,
      customerId: '4',
      customerName: '曲靖市第一人民医院',
      sourceType: CalendarEventSource.INTENTION,
      ownerId: '1',
      ownerName: '当前用户',
      reminderFlag: true,
    },
  ]
}

let allEvents = createBaseEvents()

export function resetCalendarMock(): void {
  allEvents = createBaseEvents()
}

export function generateCalendarEventList(queryDate: string): CalendarEventListResult {
  const list = allEvents
    .filter((e) => !e.startTime || e.startTime.startsWith(queryDate))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return {
    list,
    total: list.length,
    pageNum: 1,
    pageSize: 50,
  }
}

export function generateCalendarMonthDots(yearMonth: string): CalendarMonthDotsResult {
  const dateDotMap: Record<string, number[]> = {}
  allEvents.forEach((e) => {
    const dateKey = e.startTime ? e.startTime.slice(0, 10) : ''
    if (dateKey.startsWith(yearMonth)) {
      if (!dateDotMap[dateKey]) dateDotMap[dateKey] = []
      if (!dateDotMap[dateKey].includes(e.eventType)) {
        dateDotMap[dateKey].push(e.eventType)
      }
    }
  })
  return { dateDotMap }
}

export function generateCalendarStats(queryDate: string): CalendarStatsResult {
  const todayCount = allEvents.filter(
    (e) => e.startTime && e.startTime.startsWith(queryDate),
  ).length
  const weekStart = dayjs(queryDate).startOf('week').add(1, 'day')
  const weekEnd = weekStart.add(7, 'day')
  const weekCount = allEvents.filter((e) => {
    if (!e.startTime) return false
    const d = dayjs(e.startTime)
    return d.isAfter(weekStart.subtract(1, 'millisecond')) && d.isBefore(weekEnd)
  }).length
  const pendingCount = allEvents.filter((e) => e.eventStatus === CalendarEventStatus.PENDING).length
  return { todayCount, weekCount, pendingCount }
}

export function getCalendarEventById(id: string): CalendarEvent | null {
  return allEvents.find((e) => e.id === id) || null
}

export function createCalendarEventInMock(data: CalendarEventForm): CalendarEvent {
  const event: CalendarEvent = {
    id: genId(),
    eventCode: genCode(),
    eventType: data.eventType ?? CalendarEventType.CUSTOMER_VISIT,
    eventStatus: CalendarEventStatus.PENDING,
    subject: data.subject ?? '',
    startTime: data.startTime ?? '',
    endTime: data.endTime ?? '',
    customerId: data.customerId,
    customerName: data.customerName,
    intentionId: data.intentionId,
    intentionName: data.intentionName,
    attendeeIds: data.attendeeIds ?? [],
    attendeeNames: data.attendeeNames,
    remark: data.remark,
    sourceType: CalendarEventSource.MANUAL,
    ownerId: '1',
    ownerName: '当前用户',
    reminderFlag: data.reminderFlag ?? true,
  }
  allEvents.unshift(event)
  return event
}

export function updateCalendarEventInMock(
  id: string,
  data: CalendarEventForm,
): CalendarEvent | null {
  const idx = allEvents.findIndex((e) => e.id === id)
  if (idx === -1) return null
  allEvents[idx] = { ...allEvents[idx], ...data } as CalendarEvent
  return allEvents[idx]
}

export function deleteCalendarEventFromMock(id: string): boolean {
  const idx = allEvents.findIndex((e) => e.id === id)
  if (idx === -1) return false
  allEvents.splice(idx, 1)
  return true
}

export function checkInCalendarEventInMock(id: string): CalendarCheckInResult {
  const event = getCalendarEventById(id)
  if (!event) return { success: false }
  event.signInTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  event.signInLocation = '客户现场'
  return { success: true, distance: 0 }
}

export function completeCalendarEventInMock(id: string): CalendarCompleteResult {
  const event = getCalendarEventById(id)
  if (!event) return { success: false }
  event.eventStatus = CalendarEventStatus.COMPLETED
  event.completedTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return { success: true, completedTime: event.completedTime }
}

export { eventTypeColors, eventTypeNames } from './types'
