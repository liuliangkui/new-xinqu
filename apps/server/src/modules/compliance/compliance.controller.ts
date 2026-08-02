import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { ComplianceService } from './compliance.service'
import { CreateComplianceRecordDto } from './dto/create-compliance-record.dto'
import { UpdateComplianceRecordDto } from './dto/update-compliance-record.dto'
import { ComplianceRecordQueryDto } from './dto/compliance-record-query.dto'

@ApiTags('合规风控')
@ApiBearerAuth()
@Controller('compliance-records')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  @Permissions('compliance:read')
  @ApiOperation({ summary: '查询合规记录列表' })
  findAll(@Query() query: ComplianceRecordQueryDto) {
    return this.complianceService.findAll(query)
  }

  @Get(':id')
  @Permissions('compliance:read')
  @ApiOperation({ summary: '查询合规记录详情' })
  findOne(@Param('id') id: string) {
    return this.complianceService.findOne(id)
  }

  @Post()
  @Permissions('compliance:create')
  @ApiOperation({ summary: '创建合规记录' })
  create(@Body() dto: CreateComplianceRecordDto) {
    return this.complianceService.create(dto)
  }

  @Put(':id')
  @Permissions('compliance:update')
  @ApiOperation({ summary: '更新合规记录' })
  update(@Param('id') id: string, @Body() dto: UpdateComplianceRecordDto) {
    return this.complianceService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('compliance:delete')
  @ApiOperation({ summary: '删除合规记录' })
  remove(@Param('id') id: string) {
    return this.complianceService.remove(id)
  }
}
