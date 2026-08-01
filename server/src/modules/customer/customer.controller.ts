import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CustomerService } from './customer.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'

@ApiTags('客户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: '查询客户列表' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
  ) {
    return this.customerService.findAll({ page, pageSize, keyword, status, level })
  }

  @Get(':id')
  @ApiOperation({ summary: '查询客户详情' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: '创建客户' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id)
  }
}
