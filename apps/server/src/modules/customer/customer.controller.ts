import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { CustomerService } from './customer.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { CustomerQueryDto } from './dto/customer-query.dto'
import type { Request } from 'express'

@ApiTags('客户管理')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  private getCurrentUser(req: Request) {
    return (req as Request & { user: { userId: string; roleIds: string[]; departmentId?: string; region?: string } })
      .user
  }

  @Get()
  @Permissions('customer:read')
  @ApiOperation({ summary: '查询客户列表' })
  @ApiResponse({ status: 200, description: '返回分页客户列表' })
  findAll(@Req() req: Request, @Query() query: CustomerQueryDto) {
    const user = this.getCurrentUser(req)
    return this.customerService.findAll(user, query)
  }

  @Get(':id')
  @Permissions('customer:read')
  @ApiOperation({ summary: '查询客户详情' })
  @ApiResponse({ status: 200, description: '返回客户详情及关联数据' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id)
  }

  @Post()
  @Permissions('customer:create')
  @ApiOperation({ summary: '创建客户' })
  @ApiResponse({ status: 200, description: '创建成功' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto)
  }

  @Put(':id')
  @Permissions('customer:update')
  @ApiOperation({ summary: '更新客户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('customer:delete')
  @ApiOperation({ summary: '删除客户（软删除）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id)
  }
}
