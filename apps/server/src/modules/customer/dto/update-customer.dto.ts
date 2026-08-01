import { IsString, IsOptional, IsEnum, IsInt, IsArray, IsObject } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: '客户名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '客户类型' })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({ description: '医院等级' })
  @IsOptional()
  @IsString()
  hospitalLevel?: string

  @ApiPropertyOptional({ description: '客户级别', enum: ['STRATEGIC', 'NORMAL'] })
  @IsOptional()
  @IsEnum(['STRATEGIC', 'NORMAL'])
  level?: string

  @ApiPropertyOptional({ description: '健康评分' })
  @IsOptional()
  @IsInt()
  healthScore?: number

  @ApiPropertyOptional({ description: '所属区域' })
  @IsOptional()
  @IsString()
  region?: string

  @ApiPropertyOptional({ description: '地址信息', type: Object })
  @IsOptional()
  @IsObject()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  address?: any

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string

  @ApiPropertyOptional({ description: '状态', enum: ['POTENTIAL', 'COOPERATING', 'LOST'] })
  @IsOptional()
  @IsEnum(['POTENTIAL', 'COOPERATING', 'LOST'])
  status?: string

  @ApiPropertyOptional({ description: '标签数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string
}
