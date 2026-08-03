import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateApprovalDto {
  @ApiProperty({ description: '审批标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ description: '业务关键字' })
  @IsOptional()
  @IsString()
  businessKey?: string

  @ApiPropertyOptional({ description: '审批模板编码' })
  @IsOptional()
  @IsString()
  templateCode?: string

  @ApiPropertyOptional({
    description: '审批类型',
    enum: ['leave', 'expense', 'contract', 'discount', 'purchase', 'other'],
  })
  @IsOptional()
  @IsEnum(['leave', 'expense', 'contract', 'discount', 'purchase', 'other'])
  module?: string

  @ApiPropertyOptional({ description: '紧急程度', enum: ['normal', 'urgent'] })
  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  priority?: string

  @ApiPropertyOptional({ description: '指定审批人ID（为空则默认系统管理员）' })
  @IsOptional()
  @IsString()
  approverId?: string

  @ApiPropertyOptional({ description: '表单数据' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>

  @ApiPropertyOptional({ description: '抄送人ID列表' })
  @IsOptional()
  ccUserIds?: string[]
}
