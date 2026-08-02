import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateSettingDto {
  @ApiProperty({ description: '设置值' })
  @IsNotEmpty()
  value: string | number | boolean

  @ApiPropertyOptional({ description: '设置项类型' })
  @IsOptional()
  @IsString()
  valueType?: string
}
