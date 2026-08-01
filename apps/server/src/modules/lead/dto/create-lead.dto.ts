import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateLeadDto {
  @ApiProperty({ description: '线索名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: '线索来源' })
  @IsString()
  @IsNotEmpty()
  source: string

  @ApiPropertyOptional({ description: '来源明细' })
  @IsOptional()
  @IsString()
  sourceDetail?: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'FOLLOWING', 'CONVERTED', 'INVALID'] })
  @IsOptional()
  @IsEnum(['PENDING', 'FOLLOWING', 'CONVERTED', 'INVALID'])
  status?: string

  @ApiPropertyOptional({ description: '线索池类型', enum: ['MINE', 'PUBLIC', 'TEAM'] })
  @IsOptional()
  @IsEnum(['MINE', 'PUBLIC', 'TEAM'])
  poolType?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string

  @ApiPropertyOptional({ description: '所属区域' })
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional({ description: '联系人姓名' })
  @IsOptional()
  @IsString()
  contactName?: string

  @ApiPropertyOptional({ description: '联系人电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string

  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  companyName?: string

  @ApiPropertyOptional({ description: '需求描述' })
  @IsOptional()
  @IsString()
  demand?: string

  @ApiPropertyOptional({ description: '预计金额' })
  @IsOptional()
  estimatedAmount?: number

  @ApiPropertyOptional({ description: '意向等级', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  @IsOptional()
  @IsEnum(['HIGH', 'MEDIUM', 'LOW'])
  intentionLevel?: string
}
