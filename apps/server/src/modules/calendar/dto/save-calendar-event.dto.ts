/**
 * 保存日历事件 DTO
 */
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsBoolean } from 'class-validator'
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class SaveCalendarEventDto {
  @ApiPropertyOptional({ description: '日程ID，编辑时传入' })
  @IsOptional()
  @IsString()
  id?: string

  @ApiProperty({ description: '日程类型 1-5' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  eventType: number

  @ApiProperty({ description: '日程主题' })
  @IsString()
  @IsNotEmpty()
  subject: string

  @ApiProperty({ description: '开始时间 yyyy-MM-dd HH:mm' })
  @IsString()
  @IsNotEmpty()
  startTime: string

  @ApiProperty({ description: '结束时间 yyyy-MM-dd HH:mm' })
  @IsString()
  @IsNotEmpty()
  endTime: string

  @ApiPropertyOptional({ description: '关联客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({ description: '关联客户名称' })
  @IsOptional()
  @IsString()
  customerName?: string

  @ApiPropertyOptional({ description: '关联意向ID' })
  @IsOptional()
  @IsString()
  intentionId?: string

  @ApiPropertyOptional({ description: '关联意向名称' })
  @IsOptional()
  @IsString()
  intentionName?: string

  @ApiPropertyOptional({ description: '参与人ID列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendeeIds?: string[]

  @ApiPropertyOptional({ description: '参与人姓名' })
  @IsOptional()
  @IsString()
  attendeeNames?: string

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiPropertyOptional({ description: '是否提醒', default: true })
  @IsOptional()
  @IsBoolean()
  reminderFlag?: boolean
}
