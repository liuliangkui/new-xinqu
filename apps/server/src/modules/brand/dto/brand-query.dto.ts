import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class BrandQueryDto {
  @ApiPropertyOptional({ description: '关键词' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '品类' })
  @IsOptional()
  @IsString()
  category?: string
}
