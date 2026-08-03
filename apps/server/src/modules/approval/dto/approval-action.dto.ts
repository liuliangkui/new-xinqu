import { IsNumber, IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class ApprovalActionDto {
  @ApiPropertyOptional({ description: '审批意见' })
  @IsOptional()
  @IsString()
  comment?: string

  @ApiPropertyOptional({ description: '驳回到指定节点下标（从 0 开始），不传则直接结束' })
  @IsOptional()
  @IsNumber()
  targetNodeIndex?: number
}
