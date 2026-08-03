import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { ApprovalService } from './approval.service'
import { CreateApprovalDto } from './dto/create-approval.dto'
import { UpdateApprovalDto } from './dto/update-approval.dto'
import { ApprovalQueryDto } from './dto/approval-query.dto'
import { ApprovalActionDto } from './dto/approval-action.dto'
import type { Request } from 'express'

@ApiTags('审批中心')
@ApiBearerAuth()
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('approval:read')
  @ApiOperation({ summary: '查询审批列表' })
  @ApiResponse({ status: 200, description: '返回分页审批列表' })
  findAll(@Req() req: Request, @Query() query: ApprovalQueryDto) {
    const user = this.getCurrentUser(req)
    return this.approvalService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('approval:read')
  @ApiOperation({ summary: '查询审批详情' })
  @ApiResponse({ status: 200, description: '返回审批详情' })
  findOne(@Param('id') id: string) {
    return this.approvalService.findOne(id)
  }

  @Post()
  @Permissions('approval:create')
  @ApiOperation({ summary: '创建审批' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Req() req: Request, @Body() dto: CreateApprovalDto) {
    const user = this.getCurrentUser(req)
    return this.approvalService.create(user.userId, dto)
  }

  @Put(':id')
  @Permissions('approval:update')
  @ApiOperation({ summary: '更新审批' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateApprovalDto) {
    return this.approvalService.update(id, dto)
  }

  @Post(':id/approve')
  @Permissions('approval:update')
  @ApiOperation({ summary: '审批通过' })
  @ApiResponse({ status: 200, description: '审批通过成功' })
  approve(@Req() req: Request, @Param('id') id: string, @Body() dto: ApprovalActionDto) {
    const user = this.getCurrentUser(req)
    return this.approvalService.action(id, user.userId, 'APPROVE', dto.comment)
  }

  @Post(':id/reject')
  @Permissions('approval:update')
  @ApiOperation({ summary: '审批驳回' })
  @ApiResponse({ status: 200, description: '审批驳回成功' })
  reject(@Req() req: Request, @Param('id') id: string, @Body() dto: ApprovalActionDto) {
    const user = this.getCurrentUser(req)
    return this.approvalService.action(id, user.userId, 'REJECT', dto.comment)
  }

  @Post(':id/withdraw')
  @Permissions('approval:update')
  @ApiOperation({ summary: '撤回审批' })
  @ApiResponse({ status: 200, description: '撤回成功' })
  withdraw(@Param('id') id: string) {
    return this.approvalService.withdraw(id)
  }

  @Delete(':id')
  @Permissions('approval:delete')
  @ApiOperation({ summary: '删除审批（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.approvalService.remove(id)
  }
}
