import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '密码' })
  @IsOptional()
  @IsString()
  password?: string

  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({ description: '部门ID' })
  @IsOptional()
  @IsString()
  departmentId?: string

  @ApiPropertyOptional({ description: '角色ID数组', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string
}
