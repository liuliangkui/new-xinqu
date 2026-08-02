import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { BrandService } from './brand.service'
import { CreateBrandDto } from './dto/create-brand.dto'
import { UpdateBrandDto } from './dto/update-brand.dto'
import { BrandQueryDto } from './dto/brand-query.dto'

@ApiTags('品牌库管理')
@ApiBearerAuth()
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @Permissions('brand:read')
  @ApiOperation({ summary: '查询品牌列表' })
  findAll(@Query() query: BrandQueryDto) {
    return this.brandService.findAll(query)
  }

  @Get(':id')
  @Permissions('brand:read')
  @ApiOperation({ summary: '查询品牌详情' })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id)
  }

  @Post()
  @Permissions('brand:create')
  @ApiOperation({ summary: '创建品牌' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto)
  }

  @Put(':id')
  @Permissions('brand:update')
  @ApiOperation({ summary: '更新品牌' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('brand:delete')
  @ApiOperation({ summary: '删除品牌' })
  remove(@Param('id') id: string) {
    return this.brandService.remove(id)
  }
}
