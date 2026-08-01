/**
 * 经营驾驶舱控制器
 */
import { Controller, Get, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { DashboardService } from './dashboard.service'
import { DashboardOverviewQueryDto } from './dto/dashboard-query.dto'
import type { Request } from 'express'

@ApiTags('经营驾驶舱')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; username?: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get('overview')
  @Permissions('dashboard:read')
  @ApiOperation({ summary: '高管综合看板概览' })
  @ApiResponse({ status: 200, description: '返回综合看板指标' })
  getOverview(@Req() req: Request, @Query() query: DashboardOverviewQueryDto) {
    const user = this.getCurrentUser(req)
    return this.dashboardService.getOverview(user, query)
  }
}
