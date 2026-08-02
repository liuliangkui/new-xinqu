import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { SystemConfigService } from './system-config.service'
import { SystemConfigQueryDto } from './dto/system-config-query.dto'
import { CreateSystemConfigDto } from './dto/create-system-config.dto'
import { UpdateSystemConfigDto } from './dto/update-system-config.dto'

@ApiTags('应用配置')
@ApiBearerAuth()
@Controller('system-configs')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  @Permissions('config:read')
  @ApiOperation({ summary: '查询配置列表' })
  findAll(@Query() query: SystemConfigQueryDto) {
    return this.systemConfigService.findAll(query)
  }

  @Post()
  @Permissions('config:create')
  @ApiOperation({ summary: '创建配置' })
  create(@Body() dto: CreateSystemConfigDto) {
    return this.systemConfigService.create(dto)
  }

  @Put(':id')
  @Permissions('config:update')
  @ApiOperation({ summary: '更新配置' })
  update(@Param('id') id: string, @Body() dto: UpdateSystemConfigDto) {
    return this.systemConfigService.update(id, dto)
  }
}
