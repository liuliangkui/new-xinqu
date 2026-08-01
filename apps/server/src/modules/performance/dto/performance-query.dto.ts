import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class PerformanceQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页条数', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 12

  @ApiPropertyOptional({ description: '关键词（对象名称）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '维度页签', enum: ['my', 'team', 'region', 'product', 'channel'] })
  @IsOptional()
  @IsEnum(['my', 'team', 'region', 'product', 'channel'])
  tabType?: string = 'team'

  @ApiPropertyOptional({ description: '绩效周期', enum: ['month', 'quarter', 'year'] })
  @IsOptional()
  @IsEnum(['month', 'quarter', 'year'])
  period?: string = 'month'

  @ApiPropertyOptional({ description: '指标类型', enum: ['revenue', 'collection', 'quantity'] })
  @IsOptional()
  @IsEnum(['revenue', 'collection', 'quantity'])
  indicator?: string = 'revenue'

  @ApiPropertyOptional({ description: '区域编码' })
  @IsOptional()
  @IsString()
  regionCode?: string
}
