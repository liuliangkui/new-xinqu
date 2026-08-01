/**
 * 日程签到 DTO
 */
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CheckInCalendarEventDto {
  @ApiProperty({ description: '签到时间 yyyy-MM-dd HH:mm:ss' })
  @IsString()
  @IsNotEmpty()
  signInTime: string

  @ApiProperty({ description: '签到位置描述' })
  @IsString()
  @IsNotEmpty()
  signInLocation: string

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number
}
