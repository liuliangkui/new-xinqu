import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name: string

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
