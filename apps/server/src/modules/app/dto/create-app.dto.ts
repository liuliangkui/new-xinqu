import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsInt } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAppDto {
  @ApiProperty({ description: '应用编码' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ description: '应用名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  icon?: string

  @ApiPropertyOptional({ description: '路由路径' })
  @IsOptional()
  @IsString()
  route?: string

  @ApiPropertyOptional({ description: '分类', enum: ['PLATFORM', 'BUSINESS', 'PROCESS', 'ANALYSIS', 'SYSTEM'] })
  @IsOptional()
  @IsEnum(['PLATFORM', 'BUSINESS', 'PROCESS', 'ANALYSIS', 'SYSTEM'])
  category?: string

  @ApiPropertyOptional({ description: '权限列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[]

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string
}
