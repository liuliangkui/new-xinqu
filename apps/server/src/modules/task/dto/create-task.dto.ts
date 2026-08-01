import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty({ description: '任务标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ description: '任务内容' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ description: '任务类型', enum: ['TODO', 'FOLLOW_UP', 'APPROVAL', 'REVIEW'] })
  @IsOptional()
  @IsEnum(['TODO', 'FOLLOW_UP', 'APPROVAL', 'REVIEW'])
  type?: string

  @ApiPropertyOptional({ description: '优先级', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string

  @ApiPropertyOptional({ description: '截止时间' })
  @IsOptional()
  @IsString()
  dueAt?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string

  @ApiPropertyOptional({ description: '执行人ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[]

  @ApiPropertyOptional({ description: '参与人ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[]

  @ApiPropertyOptional({ description: '关联业务类型', enum: ['CUSTOMER', 'LEAD', 'INTENTION', 'TICKET'] })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'LEAD', 'INTENTION', 'TICKET'])
  relatedType?: string

  @ApiPropertyOptional({ description: '关联业务ID' })
  @IsOptional()
  @IsString()
  relatedId?: string

  @ApiPropertyOptional({ description: '创建人ID' })
  @IsOptional()
  @IsString()
  createdBy?: string
}
