import { IsString, IsOptional, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: '工单标题' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ description: '工单类型', enum: ['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'] })
  @IsOptional()
  @IsEnum(['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'])
  type?: string

  @ApiPropertyOptional({ description: '优先级', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'PROCESSING', 'WAITING', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'WAITING', 'RESOLVED', 'CLOSED'])
  status?: string

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({ description: '联系人ID' })
  @IsOptional()
  @IsString()
  contactId?: string

  @ApiPropertyOptional({ description: '设备ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string

  @ApiPropertyOptional({ description: '处理人ID' })
  @IsOptional()
  @IsString()
  assigneeId?: string

  @ApiPropertyOptional({ description: '来源', enum: ['PHONE', 'WECHAT', 'APP', 'AGENT'] })
  @IsOptional()
  @IsEnum(['PHONE', 'WECHAT', 'APP', 'AGENT'])
  source?: string

  @ApiPropertyOptional({ description: '工单内容' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ description: '解决方案' })
  @IsOptional()
  @IsString()
  solution?: string
}
