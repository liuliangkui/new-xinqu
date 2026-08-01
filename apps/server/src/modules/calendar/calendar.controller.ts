/**
 * 日历事件控制器
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { CalendarService } from './calendar.service'
import {
  CalendarEventListQueryDto,
  CalendarMonthDotsQueryDto,
  CalendarStatsQueryDto,
} from './dto/calendar-event-query.dto'
import { SaveCalendarEventDto } from './dto/save-calendar-event.dto'
import { CheckInCalendarEventDto } from './dto/check-in.dto'
import type { Request } from 'express'

@ApiTags('日历')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; username?: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Post('event/list')
  @Permissions('calendar:read')
  @ApiOperation({ summary: '查询日程列表' })
  @ApiResponse({ status: 200, description: '返回分页日程列表' })
  findAll(@Req() req: Request, @Body() query: CalendarEventListQueryDto) {
    const user = this.getCurrentUser(req)
    return this.calendarService.findAll(user, query)
  }

  @Post('event/month-dots')
  @Permissions('calendar:read')
  @ApiOperation({ summary: '查询月历事件圆点' })
  @ApiResponse({ status: 200, description: '返回日期圆点映射' })
  findMonthDots(@Req() req: Request, @Body() query: CalendarMonthDotsQueryDto) {
    const user = this.getCurrentUser(req)
    return this.calendarService.findMonthDots(user, query)
  }

  @Post('event/save')
  @Permissions('calendar:create', 'calendar:update')
  @ApiOperation({ summary: '保存日程' })
  @ApiResponse({ status: 200, description: '保存成功' })
  save(@Req() req: Request, @Body() dto: SaveCalendarEventDto) {
    const user = this.getCurrentUser(req)
    return this.calendarService.save(user, dto)
  }

  @Post('event/delete/:id')
  @Permissions('calendar:delete')
  @ApiOperation({ summary: '删除日程' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = this.getCurrentUser(req)
    return this.calendarService.remove(user, id)
  }

  @Get('event/detail/:id')
  @Permissions('calendar:read')
  @ApiOperation({ summary: '查询日程详情' })
  @ApiResponse({ status: 200, description: '返回日程详情' })
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id)
  }

  @Post('event/check-in/:id')
  @Permissions('calendar:update')
  @ApiOperation({ summary: '日程签到' })
  @ApiResponse({ status: 200, description: '签到成功' })
  checkIn(@Req() req: Request, @Param('id') id: string, @Body() dto: CheckInCalendarEventDto) {
    const user = this.getCurrentUser(req)
    return this.calendarService.checkIn(user, id, dto)
  }

  @Post('event/complete/:id')
  @Permissions('calendar:update')
  @ApiOperation({ summary: '标记日程完成' })
  @ApiResponse({ status: 200, description: '标记成功' })
  complete(@Req() req: Request, @Param('id') id: string) {
    const user = this.getCurrentUser(req)
    return this.calendarService.complete(user, id)
  }

  @Get('stats')
  @Permissions('calendar:read')
  @ApiOperation({ summary: '查询日历统计' })
  @ApiResponse({ status: 200, description: '返回统计信息' })
  getStats(@Req() req: Request, @Query() query: CalendarStatsQueryDto) {
    const user = this.getCurrentUser(req)
    return this.calendarService.getStats(user, query)
  }
}
