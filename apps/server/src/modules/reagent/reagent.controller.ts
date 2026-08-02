import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { ReagentService } from './reagent.service'
import { CreateReagentDto } from './dto/create-reagent.dto'
import { UpdateReagentDto } from './dto/update-reagent.dto'
import { ReagentQueryDto } from './dto/reagent-query.dto'

@ApiTags('试剂运营')
@ApiBearerAuth()
@Controller('reagents')
export class ReagentController {
  constructor(private readonly reagentService: ReagentService) {}

  @Get()
  @Permissions('reagent:read')
  @ApiOperation({ summary: '查询试剂列表' })
  findAll(@Query() query: ReagentQueryDto) {
    return this.reagentService.findAll(query)
  }

  @Get(':id')
  @Permissions('reagent:read')
  @ApiOperation({ summary: '查询试剂详情' })
  findOne(@Param('id') id: string) {
    return this.reagentService.findOne(id)
  }

  @Post()
  @Permissions('reagent:create')
  @ApiOperation({ summary: '创建试剂' })
  create(@Body() dto: CreateReagentDto) {
    return this.reagentService.create(dto)
  }

  @Put(':id')
  @Permissions('reagent:update')
  @ApiOperation({ summary: '更新试剂' })
  update(@Param('id') id: string, @Body() dto: UpdateReagentDto) {
    return this.reagentService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('reagent:delete')
  @ApiOperation({ summary: '删除试剂' })
  remove(@Param('id') id: string) {
    return this.reagentService.remove(id)
  }
}
