import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { TicketService } from './ticket.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { UpdateTicketDto } from './dto/update-ticket.dto'
import { TicketQueryDto } from './dto/ticket-query.dto'
import type { Request } from 'express'

@ApiTags('工单管理')
@ApiBearerAuth()
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('ticket:read')
  @ApiOperation({ summary: '查询工单列表' })
  @ApiResponse({ status: 200, description: '返回分页工单列表' })
  findAll(@Req() req: Request, @Query() query: TicketQueryDto) {
    const user = this.getCurrentUser(req)
    return this.ticketService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('ticket:read')
  @ApiOperation({ summary: '查询工单详情' })
  @ApiResponse({ status: 200, description: '返回工单详情及处理记录' })
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id)
  }

  @Post()
  @Permissions('ticket:create')
  @ApiOperation({ summary: '创建工单' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto)
  }

  @Put(':id')
  @Permissions('ticket:update')
  @ApiOperation({ summary: '更新工单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('ticket:delete')
  @ApiOperation({ summary: '删除工单（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id)
  }
}
