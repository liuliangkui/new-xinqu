import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FavoriteQueryDto {
  @ApiPropertyOptional({ description: '目标类型' })
  @IsOptional()
  @IsString()
  targetType?: string
}
