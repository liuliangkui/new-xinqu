import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTicketDto {
  @ApiProperty({ description: '工单标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional({ description: '工单类型', enum: ['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'] })
  @IsOptional()
  @IsEnum(['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'])
  type?: string

  @ApiPropertyOptional({ description: '优先级', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

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

  @ApiProperty({ description: '报单人ID' })
  @IsString()
  @IsNotEmpty()
  reporterId: string

  @ApiPropertyOptional({ description: '处理人ID' })
  @IsOptional()
  @IsString()
  assigneeId?: string

  @ApiPropertyOptional({ description: '来源', enum: ['PHONE', 'WECHAT', 'APP', 'AGENT'] })
  @IsOptional()
  @IsEnum(['PHONE', 'WECHAT', 'APP', 'AGENT'])
  source?: string

  @ApiProperty({ description: '工单内容' })
  @IsString()
  @IsNotEmpty()
  content: string
}
