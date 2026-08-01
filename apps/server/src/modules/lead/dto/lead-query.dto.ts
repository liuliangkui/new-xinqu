import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class LeadQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（名称/联系人/电话/公司）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'FOLLOWING', 'CONVERTED', 'INVALID'] })
  @IsOptional()
  @IsEnum(['PENDING', 'FOLLOWING', 'CONVERTED', 'INVALID'])
  status?: string

  @ApiPropertyOptional({ description: '线索池类型', enum: ['MINE', 'PUBLIC', 'TEAM'] })
  @IsOptional()
  @IsEnum(['MINE', 'PUBLIC', 'TEAM'])
  poolType?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string

  @ApiPropertyOptional({ description: '所属区域' })
  @IsOptional()
  @IsString()
  region?: string
}
