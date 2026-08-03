import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsNumber, ArrayMinSize } from 'class-validator'
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

  @ApiPropertyOptional({ description: '审批模式', enum: ['serial', 'parallel'] })
  @IsOptional()
  @IsEnum(['serial', 'parallel'])
  mode?: 'serial' | 'parallel'

  @ApiPropertyOptional({ description: '驳回策略', enum: ['end', 'prev', 'node'] })
  @IsOptional()
  @IsEnum(['end', 'prev', 'node'])
  rejectAction?: 'end' | 'prev' | 'node'

  @ApiPropertyOptional({ description: 'rejectAction=node 时，驳回到的节点下标（从 0 开始）' })
  @IsOptional()
  @IsNumber()
  rejectTargetIndex?: number

  @ApiPropertyOptional({ description: '指定审批人ID列表（顺序即串行顺序）' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  approverIds?: string[]

  @ApiPropertyOptional({ description: '指定单个审批人ID（兼容旧版，优先级低于 approverIds）' })
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
