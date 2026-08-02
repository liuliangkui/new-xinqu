import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSystemConfigDto {
  @ApiProperty({ description: '模块' })
  @IsString()
  @IsNotEmpty()
  module: string

  @ApiProperty({ description: '配置键' })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({ description: '配置值' })
  @IsString()
  @IsNotEmpty()
  value: string

  @ApiPropertyOptional({ description: '值类型', enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] })
  @IsOptional()
  @IsEnum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
  valueType?: string

  @ApiPropertyOptional({ description: '说明' })
  @IsOptional()
  @IsString()
  description?: string
}
