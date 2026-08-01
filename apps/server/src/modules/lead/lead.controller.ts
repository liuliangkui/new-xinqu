import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { LeadService } from './lead.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { LeadQueryDto } from './dto/lead-query.dto'
import type { Request } from 'express'

@ApiTags('线索管理')
@ApiBearerAuth()
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('lead:read')
  @ApiOperation({ summary: '查询线索列表' })
  @ApiResponse({ status: 200, description: '返回分页线索列表' })
  findAll(@Req() req: Request, @Query() query: LeadQueryDto) {
    const user = this.getCurrentUser(req)
    return this.leadService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('lead:read')
  @ApiOperation({ summary: '查询线索详情' })
  @ApiResponse({ status: 200, description: '返回线索详情及跟进记录' })
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(id)
  }

  @Post()
  @Permissions('lead:create')
  @ApiOperation({ summary: '创建线索' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto)
  }

  @Put(':id')
  @Permissions('lead:update')
  @ApiOperation({ summary: '更新线索' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('lead:delete')
  @ApiOperation({ summary: '删除线索（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.leadService.remove(id)
  }
}
