import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ApprovalQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20

  @ApiPropertyOptional({ description: '关键字（标题/业务关键字）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({
    description: '审批类型',
    enum: ['leave', 'expense', 'contract', 'discount', 'purchase', 'other'],
  })
  @IsOptional()
  @IsEnum(['leave', 'expense', 'contract', 'discount', 'purchase', 'other'])
  module?: string

  @ApiPropertyOptional({ description: '状态', enum: ['pending', 'approved', 'rejected', 'withdrawn'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'withdrawn'])
  status?: string

  @ApiPropertyOptional({ description: '标签页类型', enum: ['all', 'pending', 'approved', 'cc', 'initiated'] })
  @IsOptional()
  @IsEnum(['all', 'pending', 'approved', 'cc', 'initiated'])
  tabType?: string
}
