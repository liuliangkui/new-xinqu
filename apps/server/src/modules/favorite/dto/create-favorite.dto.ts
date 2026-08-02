import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateFavoriteDto {
  @ApiProperty({ description: '收藏目标类型', enum: ['APP', 'CUSTOMER', 'LEAD', 'INTENTION', 'REPORT'] })
  @IsString()
  @IsNotEmpty()
  targetType: string

  @ApiProperty({ description: '收藏目标 ID' })
  @IsString()
  @IsNotEmpty()
  targetId: string

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number
}
