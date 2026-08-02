import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMessageDto {
  @ApiProperty({ description: '消息标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: '消息内容' })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty({ description: '消息类型', enum: ['SYSTEM', 'TASK', 'APPROVAL', 'REMIND'] })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiPropertyOptional({ description: '接收人 ID' })
  @IsOptional()
  @IsString()
  receiverId?: string

  @ApiPropertyOptional({ description: '业务载荷' })
  @IsOptional()
  payload?: unknown
}
