import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { EquipmentService } from './equipment.service'
import { CreateEquipmentDto } from './dto/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/update-equipment.dto'
import { EquipmentQueryDto } from './dto/equipment-query.dto'
import type { Request } from 'express'

@ApiTags('设备管理')
@ApiBearerAuth()
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('equipment:read')
  @ApiOperation({ summary: '查询设备列表' })
  @ApiResponse({ status: 200, description: '返回分页设备列表' })
  findAll(@Req() req: Request, @Query() query: EquipmentQueryDto) {
    const user = this.getCurrentUser(req)
    return this.equipmentService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('equipment:read')
  @ApiOperation({ summary: '查询设备详情' })
  @ApiResponse({ status: 200, description: '返回设备详情' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id)
  }

  @Post()
  @Permissions('equipment:create')
  @ApiOperation({ summary: '创建设备' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto)
  }

  @Put(':id')
  @Permissions('equipment:update')
  @ApiOperation({ summary: '更新设备' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('equipment:delete')
  @ApiOperation({ summary: '删除设备（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id)
  }
}
