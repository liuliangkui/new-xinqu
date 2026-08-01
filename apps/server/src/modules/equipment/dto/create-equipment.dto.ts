import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateEquipmentDto {
  @ApiProperty({ description: '设备编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '设备名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '产品ID' })
  @IsOptional()
  @IsString()
  productId?: string

  @ApiPropertyOptional({ description: '客户ID' })
  @IsOptional()
  @IsString()
  customerId?: string

  @ApiPropertyOptional({ description: '序列号' })
  @IsOptional()
  @IsString()
  serialNo?: string

  @ApiPropertyOptional({ description: '装机日期' })
  @IsOptional()
  @IsString()
  installDate?: string

  @ApiPropertyOptional({ description: '保修到期日' })
  @IsOptional()
  @IsString()
  warrantyExpire?: string

  @ApiPropertyOptional({ description: '状态', enum: ['RUNNING', 'MAINTAINING', 'SCRAPPED'] })
  @IsOptional()
  @IsEnum(['RUNNING', 'MAINTAINING', 'SCRAPPED'])
  status?: string

  @ApiPropertyOptional({ description: '负责人ID' })
  @IsOptional()
  @IsString()
  ownerId?: string
}
