import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { IntentionService } from './intention.service'
import { CreateIntentionDto } from './dto/create-intention.dto'
import { UpdateIntentionDto } from './dto/update-intention.dto'
import { IntentionQueryDto } from './dto/intention-query.dto'
import type { Request } from 'express'

@ApiTags('意向管理')
@ApiBearerAuth()
@Controller('intentions')
export class IntentionController {
  constructor(private readonly intentionService: IntentionService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('intention:read')
  @ApiOperation({ summary: '查询意向列表' })
  @ApiResponse({ status: 200, description: '返回分页意向列表' })
  findAll(@Req() req: Request, @Query() query: IntentionQueryDto) {
    const user = this.getCurrentUser(req)
    return this.intentionService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('intention:read')
  @ApiOperation({ summary: '查询意向详情' })
  @ApiResponse({ status: 200, description: '返回意向详情及阶段记录' })
  findOne(@Param('id') id: string) {
    return this.intentionService.findOne(id)
  }

  @Post()
  @Permissions('intention:create')
  @ApiOperation({ summary: '创建意向' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateIntentionDto) {
    return this.intentionService.create(dto)
  }

  @Put(':id')
  @Permissions('intention:update')
  @ApiOperation({ summary: '更新意向' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateIntentionDto) {
    return this.intentionService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('intention:delete')
  @ApiOperation({ summary: '删除意向（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.intentionService.remove(id)
  }
}
