import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { CreateApprovalDto } from './dto/create-approval.dto'
import { UpdateApprovalDto } from './dto/update-approval.dto'
import type { ApprovalQueryDto } from './dto/approval-query.dto'

@Injectable()
export class ApprovalService {
  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
  ) {}

  async findAll(user: CurrentUser, query: ApprovalQueryDto) {
    const { page = 1, pageSize = 20, keyword, module, status, tabType } = query

    const baseWhere: {
      OR?: unknown[]
      module?: string
      status?: string
      applicantId?: string
      deletedAt?: null
    } = { deletedAt: null }

    if (keyword) {
      baseWhere.OR = [{ title: { contains: keyword } }, { businessKey: { contains: keyword } }]
    }
    if (module) baseWhere.module = module
    if (status) baseWhere.status = status

    if (tabType === 'initiated') {
      baseWhere.applicantId = user.userId
    }

    const where = await this.dataScope.apply(user, 'approval', baseWhere)

    const [list, total, allForStats] = await Promise.all([
      this.prisma.approvalInstance.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          tasks: { select: { id: true, assigneeId: true, action: true, completedAt: true } },
          ccRecords: { select: { userId: true, readAt: true } },
        },
      }),
      this.prisma.approvalInstance.count({ where }),
      this.prisma.approvalInstance.findMany({
        where,
        select: { status: true },
      }),
    ])

    // 根据 tabType 在前端视图层过滤更直观；这里先做基础过滤
    let filteredList = list
    if (tabType === 'pending') {
      filteredList = list.filter((item) => item.tasks.some((t) => t.assigneeId === user.userId && !t.action))
    } else if (tabType === 'approved') {
      filteredList = list.filter((item) => item.tasks.some((t) => t.assigneeId === user.userId && t.action))
    } else if (tabType === 'cc') {
      filteredList = list.filter((item) => item.ccRecords.some((cc) => cc.userId === user.userId))
    }

    const stats = {
      totalCount: total,
      pendingCount: allForStats.filter((a) => a.status === 'pending').length,
      approvedCount: allForStats.filter((a) => a.status === 'approved').length,
      rejectedCount: allForStats.filter((a) => a.status === 'rejected').length,
      withdrawnCount: allForStats.filter((a) => a.status === 'withdrawn').length,
    }

    return { list: filteredList, total: filteredList.length, page, pageSize, stats }
  }

  async findOne(id: string) {
    const approval = await this.prisma.approvalInstance.findUnique({
      where: { id },
      include: {
        tasks: true,
        ccRecords: true,
      },
    })
    if (!approval) throw new NotFoundException('审批不存在')
    return approval
  }

  async create(userId: string, dto: CreateApprovalDto) {
    const template = dto.templateCode
      ? await this.prisma.approvalTemplate.findUnique({ where: { code: dto.templateCode } })
      : null

    return this.prisma.approvalInstance.create({
      data: {
        title: dto.title,
        businessKey: dto.businessKey,
        payload: JSON.parse(JSON.stringify(dto.payload || {})),

        status: 'pending',
        applicantId: userId,
        templateId: template?.id,
        ccRecords: dto.ccUserIds?.length ? { create: dto.ccUserIds.map((userId) => ({ userId })) } : undefined,
      },
      include: {
        tasks: true,
        ccRecords: true,
      },
    })
  }

  async update(id: string, dto: UpdateApprovalDto) {
    await this.findOne(id)
    return this.prisma.approvalInstance.update({
      where: { id },
      data: {
        ...dto,
        payload: dto.payload ? JSON.parse(JSON.stringify(dto.payload)) : undefined,
      },
      include: {
        tasks: true,
        ccRecords: true,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.approvalInstance.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }
}
