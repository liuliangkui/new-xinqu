import { Controller, Get, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { PerformanceService } from './performance.service'
import { PerformanceQueryDto } from './dto/performance-query.dto'
import type { Request } from 'express'

@ApiTags('目标绩效')
@ApiBearerAuth()
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get('overview')
  @Permissions('performance:read')
  @ApiOperation({ summary: '绩效全局概览' })
  @ApiResponse({ status: 200, description: '返回目标绩效全局指标与趋势' })
  getOverview(@Req() req: Request, @Query() query: PerformanceQueryDto) {
    const user = this.getCurrentUser(req)
    return this.performanceService.getOverview(user, query)
  }

  @Get('list')
  @Permissions('performance:read')
  @ApiOperation({ summary: '查询绩效明细列表' })
  @ApiResponse({ status: 200, description: '返回分页绩效明细' })
  findAll(@Req() req: Request, @Query() query: PerformanceQueryDto) {
    const user = this.getCurrentUser(req)
    return this.performanceService.findAll(user, query)
  }
}
