import { IsString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class MessageQueryDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  @IsString()
  type?: string
}
