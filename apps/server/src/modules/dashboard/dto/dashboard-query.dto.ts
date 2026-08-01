/**
 * 驾驶舱查询 DTO
 */
import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class DashboardOverviewQueryDto {
  @ApiPropertyOptional({ description: '时间范围 today/week/month/quarter/year' })
  @IsOptional()
  @IsString()
  period?: string = 'month'

  @ApiPropertyOptional({ description: '区域编码' })
  @IsOptional()
  @IsString()
  regionCode?: string
}
