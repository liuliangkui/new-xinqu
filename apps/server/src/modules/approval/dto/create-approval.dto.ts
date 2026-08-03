import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class ApprovalStageApproverDto {
  @ApiProperty({ description: '审批人ID' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiPropertyOptional({ description: '审批人姓名' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '审批人头像' })
  @IsOptional()
  @IsString()
  avatar?: string
}

class ApprovalStageDto {
  @ApiProperty({ description: '阶段ID' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiPropertyOptional({ description: '阶段名称' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ description: '阶段模式', enum: ['serial', 'parallel'] })
  @IsEnum(['serial', 'parallel'])
  mode: 'serial' | 'parallel'

  @ApiProperty({ description: '阶段审批人列表', type: [ApprovalStageApproverDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStageApproverDto)
  approvers: ApprovalStageApproverDto[]
}

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

  @ApiPropertyOptional({ description: '阶段化审批流（串/并行混合），优先级最高', type: [ApprovalStageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStageDto)
  stages?: ApprovalStageDto[]

  @ApiPropertyOptional({ description: '指定审批人ID列表（顺序即串行顺序，旧版兼容）' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  approverIds?: string[]

  @ApiPropertyOptional({ description: '指定单个审批人ID（兼容旧版，优先级低于 stages / approverIds）' })
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
