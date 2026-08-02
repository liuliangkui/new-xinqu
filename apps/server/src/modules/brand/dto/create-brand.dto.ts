import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBrandDto {
  @ApiProperty({ description: '品牌编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '品牌名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '品类' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: '说明' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string
}
