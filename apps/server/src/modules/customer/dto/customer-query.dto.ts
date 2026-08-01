import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CustomerQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（名称/标签）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '状态', enum: ['POTENTIAL', 'COOPERATING', 'LOST'] })
  @IsOptional()
  @IsEnum(['POTENTIAL', 'COOPERATING', 'LOST'])
  status?: string

  @ApiPropertyOptional({ description: '客户级别', enum: ['STRATEGIC', 'NORMAL'] })
  @IsOptional()
  @IsEnum(['STRATEGIC', 'NORMAL'])
  level?: string

  @ApiPropertyOptional({ description: '区域ID' })
  @IsOptional()
  @IsString()
  regionId?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string
}
