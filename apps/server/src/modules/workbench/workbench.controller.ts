import { Controller, Get, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { WorkbenchService } from './workbench.service'
import type { Request } from 'express'

@ApiTags('工作台')
@ApiBearerAuth()
@Controller('workbench')
export class WorkbenchController {
  constructor(private readonly workbenchService: WorkbenchService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('workbench:read')
  @ApiOperation({ summary: '获取工作台聚合数据' })
  @ApiResponse({ status: 200, description: '返回工作台数据' })
  findAll(@Req() req: Request) {
    const user = this.getCurrentUser(req)
    return this.workbenchService.findAll(user)
  }
}
