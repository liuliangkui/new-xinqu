/**
 * 日历事件查询 DTO
 */
import { IsString, IsOptional, IsInt, Min } from 'class-validator'
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CalendarEventListQueryDto {
  @ApiProperty({ description: '查询日期 yyyy-MM-dd' })
  @IsString()
  queryDate: string

  @ApiPropertyOptional({ description: '数据范围 self/subordinate/region/company' })
  @IsOptional()
  @IsString()
  ownerScope?: string

  @ApiPropertyOptional({ description: '日程类型 1-5' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  eventType?: number

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiProperty({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNum: number = 1

  @ApiProperty({ description: '每页条数', default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 50
}

export class CalendarMonthDotsQueryDto {
  @ApiProperty({ description: '年月 yyyy-MM' })
  @IsString()
  yearMonth: string

  @ApiPropertyOptional({ description: '数据范围' })
  @IsOptional()
  @IsString()
  ownerScope?: string
}

export class CalendarStatsQueryDto {
  @ApiProperty({ description: '查询日期 yyyy-MM-dd' })
  @IsString()
  queryDate: string

  @ApiPropertyOptional({ description: '数据范围' })
  @IsOptional()
  @IsString()
  ownerScope?: string
}
