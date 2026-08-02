import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateComplianceRecordDto } from './dto/create-compliance-record.dto'
import type { UpdateComplianceRecordDto } from './dto/update-compliance-record.dto'
import type { ComplianceRecordQueryDto } from './dto/compliance-record-query.dto'

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  private genCode() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `COMP-${date}-${random}`
  }

  private toRecord(item: Record<string, unknown>) {
    const payload = (item.remark ? JSON.parse(String(item.remark)) : {}) as {
      title?: string
      customerName?: string
      amount?: number
      riskTips?: string
      type?: string
    }
    const evidences = (item.evidences as Array<Record<string, unknown>>) || []
    const passedCount = evidences.filter((e) => e.fileId).length
    return {
      recordId: item.id as string,
      recordCode: payload.title ? this.genCode() : (item.id as string),
      title: payload.title || '未命名审查',
      type: payload.type || (item.recordType as string),
      customerName: payload.customerName || '',
      amount: payload.amount || 0,
      status: item.result as string,
      riskTips: payload.riskTips || '',
      evidenceCount: evidences.length,
      requiredCount: evidences.length,
      passedCount,
      evidences: evidences.map((e) => ({
        evidenceId: e.id as string,
        evidenceName: (e.description as string) || '证据',
        uploaded: !!e.fileId,
        fileUrl: e.fileId as string,
      })),
      createdAt: item.createdAt,
      updatedAt: item.checkedAt,
    }
  }

  async findAll(query: ComplianceRecordQueryDto) {
    const { keyword, status, type } = query
    const records = await this.prisma.complianceRecord.findMany({
      where: { deletedAt: null },
      include: { evidences: true },
      orderBy: { createdAt: 'desc' },
    })

    let list = records.map((r) => this.toRecord(r))
    if (status) list = list.filter((r) => r.status === status)
    if (type) list = list.filter((r) => r.type === type)
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(kw) ||
          r.recordCode.toLowerCase().includes(kw) ||
          r.customerName.toLowerCase().includes(kw),
      )
    }

    return { list, total: list.length }
  }

  async findOne(id: string) {
    const item = await this.prisma.complianceRecord.findUnique({
      where: { id },
      include: { evidences: true },
    })
    if (!item) throw new NotFoundException('记录不存在')
    return this.toRecord(item)
  }

  async create(dto: CreateComplianceRecordDto) {
    const rule = await this.prisma.complianceRule.findFirst({ where: { module: dto.type, deletedAt: null } })
    const ruleId = rule?.id || 'unknown'
    const status = dto.status || 'PENDING'
    const result = status === 'RISK' ? 'FAIL' : status

    const record = await this.prisma.complianceRecord.create({
      data: {
        ruleId,
        recordType: dto.type,
        recordId: dto.customerName,
        result,
        remark: JSON.stringify({
          title: dto.title,
          customerName: dto.customerName,
          amount: dto.amount,
          riskTips: dto.riskTips,
          type: dto.type,
        }),
        checkerId: 'system',
        evidences: {
          create:
            dto.evidences?.map((e) => ({
              fileId: e.fileId || '',
              description: e.evidenceName,
            })) || [],
        },
      },
      include: { evidences: true },
    })
    return this.toRecord(record)
  }

  async update(id: string, dto: UpdateComplianceRecordDto) {
    await this.findOne(id)
    const existing = await this.prisma.complianceRecord.findUnique({ where: { id } })
    const payload = existing?.remark ? JSON.parse(existing.remark) : {}
    const result = dto.status === 'RISK' ? 'FAIL' : dto.status || 'PENDING'

    const record = await this.prisma.complianceRecord.update({
      where: { id },
      data: {
        result,
        remark: JSON.stringify({
          ...payload,
          title: dto.title ?? payload.title,
          customerName: dto.customerName ?? payload.customerName,
          amount: dto.amount ?? payload.amount,
          riskTips: dto.riskTips ?? payload.riskTips,
          type: dto.type ?? payload.type,
        }),
      },
      include: { evidences: true },
    })
    return this.toRecord(record)
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.complianceRecord.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
