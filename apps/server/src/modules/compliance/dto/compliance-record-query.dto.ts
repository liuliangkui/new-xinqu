import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ComplianceRecordQueryDto {
  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  @IsString()
  type?: string
}
