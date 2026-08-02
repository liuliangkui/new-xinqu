import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { DealerService } from './dealer.service'
import { CreateDealerDto } from './dto/create-dealer.dto'
import { UpdateDealerDto } from './dto/update-dealer.dto'
import { DealerQueryDto } from './dto/dealer-query.dto'

@ApiTags('经销商协同')
@ApiBearerAuth()
@Controller('dealers')
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Get()
  @Permissions('dealer:read')
  @ApiOperation({ summary: '查询经销商列表' })
  findAll(@Query() query: DealerQueryDto) {
    return this.dealerService.findAll(query)
  }

  @Get(':id')
  @Permissions('dealer:read')
  @ApiOperation({ summary: '查询经销商详情' })
  findOne(@Param('id') id: string) {
    return this.dealerService.findOne(id)
  }

  @Post()
  @Permissions('dealer:create')
  @ApiOperation({ summary: '创建经销商' })
  create(@Body() dto: CreateDealerDto) {
    return this.dealerService.create(dto)
  }

  @Put(':id')
  @Permissions('dealer:update')
  @ApiOperation({ summary: '更新经销商' })
  update(@Param('id') id: string, @Body() dto: UpdateDealerDto) {
    return this.dealerService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('dealer:delete')
  @ApiOperation({ summary: '删除经销商' })
  remove(@Param('id') id: string) {
    return this.dealerService.remove(id)
  }
}
