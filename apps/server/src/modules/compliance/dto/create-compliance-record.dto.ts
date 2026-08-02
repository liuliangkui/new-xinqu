import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class ComplianceEvidenceDto {
  @ApiProperty({ description: '证据名称' })
  @IsString()
  @IsNotEmpty()
  evidenceName: string

  @ApiPropertyOptional({ description: '是否已上传' })
  @IsOptional()
  uploaded?: boolean

  @ApiPropertyOptional({ description: '文件 ID' })
  @IsOptional()
  @IsString()
  fileId?: string
}

export class CreateComplianceRecordDto {
  @ApiProperty({ description: '审查标题' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: '合规类型', enum: ['CONTRACT', 'BID', 'SAMPLE', 'REBATE', 'PRICE'] })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({ description: '客户名称' })
  @IsString()
  @IsNotEmpty()
  customerName: string

  @ApiPropertyOptional({ description: '涉及金额' })
  @IsOptional()
  @IsNumber()
  amount?: number

  @ApiPropertyOptional({ description: '状态', enum: ['PASS', 'FAIL', 'PENDING', 'RISK'] })
  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'PENDING', 'RISK'])
  status?: string

  @ApiPropertyOptional({ description: '风险提示' })
  @IsOptional()
  @IsString()
  riskTips?: string

  @ApiPropertyOptional({ description: '合规证据链' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComplianceEvidenceDto)
  evidences?: ComplianceEvidenceDto[]
}
