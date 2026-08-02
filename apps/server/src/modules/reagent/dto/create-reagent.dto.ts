import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateReagentDto {
  @ApiProperty({ description: '试剂编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '试剂名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '品牌 ID' })
  @IsOptional()
  @IsString()
  brandId?: string

  @ApiPropertyOptional({ description: '规格' })
  @IsOptional()
  @IsString()
  specification?: string

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string

  @ApiPropertyOptional({ description: '单价' })
  @IsOptional()
  @IsNumber()
  price?: number

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'DISCONTINUED'])
  status?: string
}
