import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateWorkflowDefinitionDto {
  @ApiProperty({ description: '流程名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: '流程编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '所属模块', enum: ['APPROVAL', 'TICKET', 'TASK', 'CUSTOMER_LIFECYCLE'] })
  @IsString()
  @IsNotEmpty()
  module: string

  @ApiPropertyOptional({ description: '版本' })
  @IsOptional()
  @IsInt()
  version?: number

  @ApiPropertyOptional({ description: '节点定义（JSON）' })
  @IsOptional()
  nodes?: unknown

  @ApiPropertyOptional({ description: '连线定义（JSON）' })
  @IsOptional()
  edges?: unknown

  @ApiPropertyOptional({ description: 'BPMN 2.0 XML' })
  @IsOptional()
  @IsString()
  bpmnXml?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'ARCHIVED', 'DRAFT'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'ARCHIVED', 'DRAFT'])
  status?: string
}
