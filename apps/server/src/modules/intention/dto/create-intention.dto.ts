import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateIntentionDto {
  @ApiProperty({ description: '客户ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string

  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsString()
  productId?: string

  @ApiPropertyOptional({ description: '预计金额' })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiPropertyOptional({ description: '所处阶段', enum: ['INITIAL', 'NEGOTIATION', 'QUOTATION', 'CONTRACT', 'WON'] })
  @IsOptional()
  @IsEnum(['INITIAL', 'NEGOTIATION', 'QUOTATION', 'CONTRACT', 'WON'])
  stage?: string

  @ApiPropertyOptional({ description: '赢单概率 0-100' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number

  @ApiPropertyOptional({ description: '预计成交时间' })
  @IsOptional()
  @IsString()
  expectedAt?: string

  @ApiProperty({ description: '负责人ID' })
  @IsString()
  @IsNotEmpty()
  ownerId: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'WON', 'LOST', 'STALLED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'WON', 'LOST', 'STALLED'])
  status?: string

  @ApiPropertyOptional({ description: '输单原因' })
  @IsOptional()
  @IsString()
  lostReason?: string
}
