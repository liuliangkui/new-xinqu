import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class TaskQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（任务标题/内容）' })
  @IsOptional()
  @IsString()
  keyword?: string

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

  @ApiPropertyOptional({ description: '标签页类型', enum: ['my', 'team', 'collaboration', 'overdue'] })
  @IsOptional()
  @IsEnum(['my', 'team', 'collaboration', 'overdue'])
  tabType?: string
}
