/**
 * 日历事件服务
 */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import type {
  CalendarEventListQueryDto,
  CalendarMonthDotsQueryDto,
  CalendarStatsQueryDto,
} from './dto/calendar-event-query.dto'
import type { SaveCalendarEventDto } from './dto/save-calendar-event.dto'
import type { CheckInCalendarEventDto } from './dto/check-in.dto'

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  private genEventCode(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(1000 + Math.random() * 9000)
    return `EV${date}${random}`
  }

  private parseDate(dateStr: string): Date {
    return new Date(dateStr.replace(' ', 'T'))
  }

  private buildDateRange(dateStr: string): { gte: Date; lt: Date } {
    const d = new Date(dateStr + 'T00:00:00')
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    return { gte: d, lt: next }
  }

  private buildMonthRange(yearMonth: string): { gte: Date; lt: Date } {
    const [year, month] = yearMonth.split('-').map(Number)
    const gte = new Date(year, month - 1, 1, 0, 0, 0)
    const lt = new Date(year, month, 1, 0, 0, 0)
    return { gte, lt }
  }

  async findAll(user: CurrentUser, query: CalendarEventListQueryDto) {
    const { queryDate, eventType, keyword, pageNum, pageSize } = query

    const baseWhere: Record<string, unknown> = {
      deletedAt: null,
      startTime: this.buildDateRange(queryDate),
    }

    if (eventType !== undefined) baseWhere.eventType = eventType
    if (keyword) {
      baseWhere.OR = [
        { subject: { contains: keyword } },
        { customerName: { contains: keyword } },
        { intentionName: { contains: keyword } },
      ]
    }

    const where = await this.dataScope.apply(user, 'calendarEvent', baseWhere)

    const [list, total] = await Promise.all([
      this.prisma.calendarEvent.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: [{ startTime: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.calendarEvent.count({ where }),
    ])

    return { list, total, pageNum, pageSize }
  }

  async findMonthDots(user: CurrentUser, query: CalendarMonthDotsQueryDto) {
    const { yearMonth } = query
    const baseWhere: Record<string, unknown> = {
      deletedAt: null,
      startTime: this.buildMonthRange(yearMonth),
    }

    const where = await this.dataScope.apply(user, 'calendarEvent', baseWhere)
    const events = await this.prisma.calendarEvent.findMany({
      where,
      select: { startTime: true, eventType: true },
    })

    const dateDotMap: Record<string, number[]> = {}
    events.forEach((e) => {
      const dateKey = e.startTime.toISOString().slice(0, 10)
      if (!dateDotMap[dateKey]) dateDotMap[dateKey] = []
      if (!dateDotMap[dateKey].includes(e.eventType)) {
        dateDotMap[dateKey].push(e.eventType)
      }
    })

    return { dateDotMap }
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } })
    if (!event) throw new NotFoundException('日程不存在')
    return event
  }

  async save(user: CurrentUser, dto: SaveCalendarEventDto) {
    const start = this.parseDate(dto.startTime)
    const end = this.parseDate(dto.endTime)
    if (end <= start) {
      throw new BadRequestException('结束时间不能早于开始时间')
    }

    if ((dto.eventType === 1 || dto.eventType === 2 || dto.eventType === 3) && !dto.customerId) {
      throw new BadRequestException('请关联客户')
    }

    const data = {
      eventType: dto.eventType,
      subject: dto.subject,
      startTime: start,
      endTime: end,
      customerId: dto.customerId,
      customerName: dto.customerName,
      intentionId: dto.intentionId,
      intentionName: dto.intentionName,
      attendeeIds: dto.attendeeIds ?? [],
      attendeeNames: dto.attendeeNames,
      remark: dto.remark,
      reminderFlag: dto.reminderFlag ?? true,
    }

    if (dto.id) {
      const existing = await this.findOne(dto.id)
      if (existing.ownerId !== user.userId) {
        throw new ForbiddenException('无权限编辑该日程')
      }
      return this.prisma.calendarEvent.update({
        where: { id: dto.id },
        data: { ...data, updatedAt: new Date() },
      })
    }

    return this.prisma.calendarEvent.create({
      data: {
        ...data,
        eventCode: this.genEventCode(),
        eventStatus: 1,
        sourceType: 1,
        ownerId: user.userId,
        ownerName: user.username || '',
      },
    })
  }

  async remove(user: CurrentUser, id: string) {
    const event = await this.findOne(id)
    if (event.ownerId !== user.userId) {
      throw new ForbiddenException('无权限删除该日程')
    }
    if (event.sourceType !== 1) {
      throw new ForbiddenException('系统自动生成的日程不可删除')
    }
    await this.prisma.calendarEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }

  async checkIn(user: CurrentUser, id: string, dto: CheckInCalendarEventDto) {
    const event = await this.findOne(id)
    if (event.ownerId !== user.userId) {
      throw new ForbiddenException('无权限签到')
    }
    if (![1, 4].includes(event.eventType)) {
      throw new BadRequestException('该类型日程不支持签到')
    }

    // 距离计算占位，后续接入地图服务
    const distance = 0

    await this.prisma.calendarEvent.update({
      where: { id },
      data: {
        signInTime: this.parseDate(dto.signInTime),
        signInLocation: dto.signInLocation,
        longitude: dto.longitude ?? null,
        latitude: dto.latitude ?? null,
      },
    })

    return { success: true, distance }
  }

  async complete(user: CurrentUser, id: string) {
    const event = await this.findOne(id)
    if (event.ownerId !== user.userId) {
      throw new ForbiddenException('无权限标记完成')
    }
    if (event.eventStatus === 2) {
      throw new BadRequestException('日程已完成')
    }

    const completedTime = new Date()
    await this.prisma.calendarEvent.update({
      where: { id },
      data: { eventStatus: 2, completedTime },
    })

    return { success: true, completedTime: completedTime.toISOString() }
  }

  async getStats(user: CurrentUser, query: CalendarStatsQueryDto) {
    const { queryDate } = query
    const dateRange = this.buildDateRange(queryDate)

    const baseWhere: Record<string, unknown> = {
      deletedAt: null,
      startTime: dateRange,
    }
    const where = await this.dataScope.apply(user, 'calendarEvent', baseWhere)

    const todayCount = await this.prisma.calendarEvent.count({ where })

    const weekStart = new Date(queryDate + 'T00:00:00')
    const day = weekStart.getDay()
    const diff = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + diff)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekWhere = await this.dataScope.apply(user, 'calendarEvent', {
      deletedAt: null,
      startTime: { gte: weekStart, lt: weekEnd },
    })

    const [weekCount, pendingCount] = await Promise.all([
      this.prisma.calendarEvent.count({ where: weekWhere }),
      this.prisma.calendarEvent.count({
        where: await this.dataScope.apply(user, 'calendarEvent', {
          deletedAt: null,
          eventStatus: 1,
          startTime: { gte: new Date(queryDate + 'T00:00:00') },
        }),
      }),
    ])

    return { todayCount, weekCount, pendingCount }
  }
}
