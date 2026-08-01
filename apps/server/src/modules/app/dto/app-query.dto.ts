import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AppQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页条数', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 100

  @ApiPropertyOptional({ description: '关键字（应用名称/编码）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '分类', enum: ['PLATFORM', 'BUSINESS', 'PROCESS', 'ANALYSIS', 'SYSTEM'] })
  @IsOptional()
  @IsEnum(['PLATFORM', 'BUSINESS', 'PROCESS', 'ANALYSIS', 'SYSTEM'])
  category?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string
}
