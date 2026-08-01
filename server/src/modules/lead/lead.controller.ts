import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { LeadService } from './lead.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'

@ApiTags('线索管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @ApiOperation({ summary: '查询线索列表' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('poolType') poolType?: string,
  ) {
    return this.leadService.findAll({ page, pageSize, keyword, status, poolType })
  }

  @Get(':id')
  @ApiOperation({ summary: '查询线索详情' })
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '创建线索' })
  create(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新线索' })
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除线索' })
  remove(@Param('id') id: string) {
    return this.leadService.remove(id)
  }
}
