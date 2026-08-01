import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { AppService } from './app.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import { AppQueryDto } from './dto/app-query.dto'
import type { Request } from 'express'

@ApiTags('应用中心')
@ApiBearerAuth()
@Controller('apps')
export class AppController {
  constructor(private readonly appService: AppService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('app:read')
  @ApiOperation({ summary: '查询应用列表' })
  @ApiResponse({ status: 200, description: '返回应用列表' })
  findAll(@Req() req: Request, @Query() query: AppQueryDto) {
    const user = this.getCurrentUser(req)
    return this.appService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('app:read')
  @ApiOperation({ summary: '查询应用详情' })
  @ApiResponse({ status: 200, description: '返回应用详情' })
  findOne(@Param('id') id: string) {
    return this.appService.findOne(id)
  }

  @Post()
  @Permissions('app:create')
  @ApiOperation({ summary: '创建应用' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateAppDto) {
    return this.appService.create(dto)
  }

  @Put(':id')
  @Permissions('app:update')
  @ApiOperation({ summary: '更新应用' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateAppDto) {
    return this.appService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('app:delete')
  @ApiOperation({ summary: '删除应用（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.appService.remove(id)
  }
}
