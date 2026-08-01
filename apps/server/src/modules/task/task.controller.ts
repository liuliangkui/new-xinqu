import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { TaskService } from './task.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TaskQueryDto } from './dto/task-query.dto'
import type { Request } from 'express'

@ApiTags('任务管理')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('task:read')
  @ApiOperation({ summary: '查询任务列表' })
  @ApiResponse({ status: 200, description: '返回分页任务列表' })
  findAll(@Req() req: Request, @Query() query: TaskQueryDto) {
    const user = this.getCurrentUser(req)
    return this.taskService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('task:read')
  @ApiOperation({ summary: '查询任务详情' })
  @ApiResponse({ status: 200, description: '返回任务详情' })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id)
  }

  @Post()
  @Permissions('task:create')
  @ApiOperation({ summary: '创建任务' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const user = this.getCurrentUser(req)
    return this.taskService.create(user.userId, dto)
  }

  @Put(':id')
  @Permissions('task:update')
  @ApiOperation({ summary: '更新任务' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('task:delete')
  @ApiOperation({ summary: '删除任务（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id)
  }
}
