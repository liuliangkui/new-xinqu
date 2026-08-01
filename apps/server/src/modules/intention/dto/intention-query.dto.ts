import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class IntentionQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（客户名称/项目名称）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'WON', 'LOST', 'STALLED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'WON', 'LOST', 'STALLED'])
  status?: string

  @ApiPropertyOptional({ description: '所处阶段', enum: ['INITIAL', 'NEGOTIATION', 'QUOTATION', 'CONTRACT', 'WON'] })
  @IsOptional()
  @IsEnum(['INITIAL', 'NEGOTIATION', 'QUOTATION', 'CONTRACT', 'WON'])
  stage?: string
}
