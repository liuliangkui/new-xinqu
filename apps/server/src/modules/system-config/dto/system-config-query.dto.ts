import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class SystemConfigQueryDto {
  @ApiPropertyOptional({ description: '模块' })
  @IsOptional()
  @IsString()
  module?: string

  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string
}
