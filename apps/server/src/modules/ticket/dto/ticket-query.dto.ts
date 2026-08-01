import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class TicketQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20

  @ApiPropertyOptional({ description: '关键字（标题/内容）' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({ description: '处理人ID' })
  @IsOptional()
  @IsString()
  assigneeId?: string

  @ApiPropertyOptional({ description: '状态', enum: ['PENDING', 'PROCESSING', 'WAITING', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'WAITING', 'RESOLVED', 'CLOSED'])
  status?: string

  @ApiPropertyOptional({ description: '优先级', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string

  @ApiPropertyOptional({ description: '类型', enum: ['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'] })
  @IsOptional()
  @IsEnum(['REPAIR', 'MAINTENANCE', 'CONSULT', 'COMPLAINT'])
  type?: string
}
