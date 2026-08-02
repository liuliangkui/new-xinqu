import { Controller, Get, Post, Put, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { MessageService } from './message.service'
import { MessageQueryDto } from './dto/message-query.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import type { Request } from 'express'

@ApiTags('消息中心')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  private getUserId(req: Request) {
    return (req as Request & { user: { userId: string } }).user.userId
  }

  @Get()
  @Permissions('message:read')
  @ApiOperation({ summary: '查询消息列表' })
  findAll(@Req() req: Request, @Query() query: MessageQueryDto) {
    return this.messageService.findAll(this.getUserId(req), query)
  }

  @Post()
  @Permissions('message:create')
  @ApiOperation({ summary: '创建消息' })
  create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto)
  }

  @Put(':id/read')
  @Permissions('message:update')
  @ApiOperation({ summary: '标记已读' })
  markRead(@Req() req: Request, @Param('id') id: string) {
    return this.messageService.markRead(this.getUserId(req), id)
  }

  @Post('read-all')
  @Permissions('message:update')
  @ApiOperation({ summary: '全部已读' })
  markAllRead(@Req() req: Request) {
    return this.messageService.markAllRead(this.getUserId(req))
  }
}
