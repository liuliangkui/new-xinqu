import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDealerDto {
  @ApiProperty({ description: '经销商编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '经销商名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '地区 ID' })
  @IsOptional()
  @IsString()
  regionId?: string

  @ApiPropertyOptional({ description: '等级', enum: ['NORMAL', 'CORE', 'STRATEGIC'] })
  @IsOptional()
  @IsEnum(['NORMAL', 'CORE', 'STRATEGIC'])
  level?: string

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contactName?: string

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string

  @ApiPropertyOptional({ description: '授权开始日期' })
  @IsOptional()
  @IsDateString()
  authorizedAt?: string

  @ApiPropertyOptional({ description: '授权结束日期' })
  @IsOptional()
  @IsDateString()
  expireAt?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'EXPIRED'])
  status?: string
}
