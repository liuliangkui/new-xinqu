import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DataScopeHelper, type CurrentUser } from '@/common/helpers/data-scope.helper'
import { FlowableService } from '@/modules/flowable/flowable.service'
import { CreateApprovalDto } from './dto/create-approval.dto'
import { UpdateApprovalDto } from './dto/update-approval.dto'
import type { ApprovalQueryDto } from './dto/approval-query.dto'

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name)
  private readonly defaultApproverId = 'user_admin'

  constructor(
    private prisma: PrismaService,
    private dataScope: DataScopeHelper,
    private flowable: FlowableService,
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
    if (status) baseWhere.status = status.toUpperCase()

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
          template: true,
          tasks: { orderBy: { createdAt: 'asc' } },
          ccRecords: true,
        },
      }),
      this.prisma.approvalInstance.count({ where }),
      this.prisma.approvalInstance.findMany({
        where,
        select: { status: true },
      }),
    ])

    let filteredList = list
    if (tabType === 'pending') {
      filteredList = list.filter((item) => item.tasks.some((t) => t.assigneeId === user.userId && !t.action))
    } else if (tabType === 'approved') {
      filteredList = list.filter((item) => item.tasks.some((t) => t.assigneeId === user.userId && t.action))
    } else if (tabType === 'cc') {
      filteredList = list.filter((item) => item.ccRecords.some((cc) => cc.userId === user.userId))
    }

    const userMap = await this.buildUserMap(filteredList)
    const dtoList = filteredList.map((item) => this.toApprovalDto(item, userMap))

    const stats = {
      totalCount: total,
      pendingCount: allForStats.filter((a) => a.status === 'PENDING').length,
      approvedCount: allForStats.filter((a) => a.status === 'APPROVED').length,
      rejectedCount: allForStats.filter((a) => a.status === 'REJECTED').length,
      withdrawnCount: allForStats.filter((a) => a.status === 'WITHDRAWN').length,
    }

    return { list: dtoList, total: dtoList.length, page, pageSize, stats }
  }

  async findOne(id: string) {
    const approval = await this.prisma.approvalInstance.findUnique({
      where: { id },
      include: {
        template: true,
        tasks: { orderBy: { createdAt: 'asc' } },
        ccRecords: true,
      },
    })
    if (!approval) throw new NotFoundException('审批不存在')
    const userMap = await this.buildUserMap(approval)
    return this.toApprovalDto(approval, userMap)
  }

  async create(userId: string, dto: CreateApprovalDto) {
    const module = dto.module || 'other'
    let template = dto.templateCode
      ? await this.prisma.approvalTemplate.findUnique({ where: { code: dto.templateCode } })
      : await this.prisma.approvalTemplate.findFirst({
          where: { module, status: 'ACTIVE', deletedAt: null },
        })

    if (!template) {
      const defaultDef = await this.getDefaultWorkflowDefinition()
      template = await this.prisma.approvalTemplate.create({
        data: {
          name: this.moduleName(module),
          code: `${module}-${Date.now()}`,
          module,
          formSchema: {},
          flowNodes: [],
          workflowDefinitionId: defaultDef.id,
          status: 'ACTIVE',
        },
      })
    }

    if (!template.workflowDefinitionId) {
      const defaultDef = await this.getDefaultWorkflowDefinition()
      template = await this.prisma.approvalTemplate.update({
        where: { id: template.id },
        data: { workflowDefinitionId: defaultDef.id },
      })
    }

    const workflowDef = await this.prisma.workflowDefinition.findUnique({
      where: { id: template.workflowDefinitionId },
    })
    if (!workflowDef) throw new Error('关联工作流定义不存在')

    const approverId = dto.approverId || this.defaultApproverId

    const instance = await this.prisma.approvalInstance.create({
      data: {
        title: dto.title,
        businessKey: dto.businessKey,
        applicantId: userId,
        templateId: template.id,
        status: 'PENDING',
        payload: { ...(dto.payload || {}), priority: dto.priority || 'normal' },
        ccRecords: dto.ccUserIds?.length ? { create: dto.ccUserIds.map((uid) => ({ userId: uid })) } : undefined,
      },
      include: { template: true, tasks: true, ccRecords: true },
    })

    try {
      const processInstance = await this.startWorkflowInstance(
        workflowDef,
        { applicant: userId, approver: approverId, module, ...(instance.payload as Record<string, unknown>) },
        instance.id,
      )
      await this.prisma.approvalInstance.update({
        where: { id: instance.id },
        data: { workflowInstanceId: processInstance.id },
      })
      await this.syncTasks(instance.id, processInstance.id)
    } catch (e) {
      this.logger.error(`审批工作流启动失败: ${e instanceof Error ? e.message : String(e)}`)
    }

    const refreshed = await this.prisma.approvalInstance.findUnique({
      where: { id: instance.id },
      include: { template: true, tasks: true, ccRecords: true },
    })
    const userMap = await this.buildUserMap(refreshed!)
    return this.toApprovalDto(refreshed!, userMap)
  }

  async update(id: string, dto: UpdateApprovalDto) {
    const existing = await this.prisma.approvalInstance.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('审批不存在')
    if (existing.status !== 'PENDING') throw new ConflictException('只有进行中的审批可编辑')

    const data: Record<string, unknown> = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.businessKey !== undefined) data.businessKey = dto.businessKey
    if (dto.payload !== undefined) data.payload = JSON.parse(JSON.stringify(dto.payload))

    const updated = await this.prisma.approvalInstance.update({
      where: { id },
      data,
      include: { template: true, tasks: true, ccRecords: true },
    })
    const userMap = await this.buildUserMap(updated)
    return this.toApprovalDto(updated, userMap)
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.approvalInstance.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }

  async action(id: string, userId: string, action: 'APPROVE' | 'REJECT', comment?: string) {
    const instance = await this.prisma.approvalInstance.findUnique({
      where: { id },
      include: { tasks: true, template: true },
    })
    if (!instance) throw new NotFoundException('审批不存在')
    if (instance.status !== 'PENDING') throw new ConflictException('审批已结束')

    if (instance.workflowInstanceId) {
      const tasks = await this.flowable.getTasks({
        processInstanceId: instance.workflowInstanceId,
      })
      const task = tasks.find((t) => t.assignee === userId) || tasks[0]
      if (!task?.id) throw new ConflictException('当前没有可审批的任务')
      await this.flowable.completeTask(task.id, {
        approved: action === 'APPROVE',
        comment: comment || '',
      })
    }

    const existingTask =
      (await this.prisma.approvalTask.findFirst({
        where: { instanceId: id, assigneeId: userId, action: null },
      })) || instance.tasks.find((t) => !t.action)

    const taskAction = action === 'APPROVE' ? 'approve' : 'reject'
    if (existingTask) {
      await this.prisma.approvalTask.update({
        where: { id: existingTask.id },
        data: { action: taskAction, comment, completedAt: new Date() },
      })
    } else {
      await this.prisma.approvalTask.create({
        data: {
          instanceId: id,
          nodeId: 'manual',
          assigneeId: userId,
          action: taskAction,
          comment,
          completedAt: new Date(),
        },
      })
    }

    let ended = true
    if (instance.workflowInstanceId) {
      try {
        const pi = await this.flowable.getProcessInstance(instance.workflowInstanceId)
        ended = pi.ended
      } catch {
        ended = true
      }
    }

    if (ended) {
      await this.prisma.approvalInstance.update({
        where: { id },
        data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', completedAt: new Date() },
      })
    }

    return this.findOne(id)
  }

  async withdraw(id: string) {
    const instance = await this.prisma.approvalInstance.findUnique({ where: { id } })
    if (!instance) throw new NotFoundException('审批不存在')
    if (instance.status !== 'PENDING') throw new ConflictException('只有进行中的审批可撤回')

    if (instance.workflowInstanceId) {
      await this.flowable.deleteProcessInstance(instance.workflowInstanceId, 'withdrawn')
    }

    await this.prisma.approvalInstance.update({
      where: { id },
      data: { status: 'WITHDRAWN', completedAt: new Date() },
    })
    return { success: true }
  }

  private async getDefaultWorkflowDefinition() {
    const def = await this.prisma.workflowDefinition.findFirst({
      where: { code: 'approval-generic', status: 'ACTIVE', deletedAt: null },
    })
    if (!def) throw new Error('默认审批工作流定义不存在')
    return def
  }

  private moduleName(module: string): string {
    const map: Record<string, string> = {
      leave: '请假审批',
      expense: '报销审批',
      contract: '合同审批',
      discount: '折扣审批',
      purchase: '采购审批',
      other: '其他审批',
    }
    return map[module] || '其他审批'
  }

  private async ensureWorkflowDefinitionDeployed(def: {
    id: string
    code: string
    bpmnXml: string | null
    flowableDeploymentId?: string | null
    flowableDefinitionId?: string | null
  }) {
    if (def.flowableDefinitionId && def.flowableDeploymentId) return def
    if (!def.bpmnXml) throw new Error('工作流定义缺少 BPMN XML')

    const deployment = await this.flowable.deploy(def.code, def.bpmnXml)
    const definitions = await this.flowable.getProcessDefinitions(deployment.id)
    const definitionId = definitions[0]?.id
    if (!definitionId) throw new Error('未找到部署后的流程定义')

    const updated = await this.prisma.workflowDefinition.update({
      where: { id: def.id },
      data: {
        flowableDeploymentId: deployment.id,
        flowableDefinitionId: definitionId,
      },
    })
    return updated
  }

  private async startWorkflowInstance(
    def: {
      id: string
      code: string
      bpmnXml: string | null
      flowableDeploymentId?: string | null
      flowableDefinitionId?: string | null
    },
    variables: Record<string, unknown>,
    businessKey: string,
  ) {
    const deployed = await this.ensureWorkflowDefinitionDeployed(def)
    if (!deployed.flowableDefinitionId) throw new Error('流程定义未部署')
    return this.flowable.startProcessInstance(deployed.flowableDefinitionId, variables, businessKey)
  }

  private async syncTasks(instanceId: string, workflowInstanceId: string) {
    const tasks = await this.flowable.getTasks({ processInstanceId: workflowInstanceId })
    for (const task of tasks) {
      if (!task.id) continue
      const exists = await this.prisma.approvalTask.findFirst({
        where: { instanceId, nodeId: task.taskDefinitionKey || task.id, action: null },
      })
      if (!exists) {
        await this.prisma.approvalTask.create({
          data: {
            instanceId,
            nodeId: task.taskDefinitionKey || task.id,
            assigneeId: task.assignee || '',
            createdAt: task.created ? new Date(task.created) : new Date(),
          },
        })
      }
    }
  }

  private async buildUserMap(instance: any | any[]) {
    const list = Array.isArray(instance) ? instance : [instance]
    const ids = new Set<string>()
    for (const item of list) {
      ids.add(item.applicantId)
      for (const t of item.tasks || []) {
        if (t.assigneeId) ids.add(t.assigneeId)
      }
      for (const c of item.ccRecords || []) {
        if (c.userId) ids.add(c.userId)
      }
    }
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true },
    })
    return new Map(users.map((u) => [u.id, u.name]))
  }

  private toApprovalDto(instance: any, userMap?: Map<string, string | null>) {
    const map = userMap || new Map<string, string | null>()
    const currentTask = (instance.tasks || []).find((t: any) => !t.action)
    return {
      approvalId: instance.id,
      approvalCode: instance.businessKey || instance.id,
      title: instance.title,
      businessKey: instance.businessKey,
      module: instance.template?.module || 'other',
      status: instance.status,
      priority: instance.payload?.priority || 'normal',
      applicantId: instance.applicantId,
      applicantName: map.get(instance.applicantId) || instance.applicantId,
      currentApproverName: currentTask ? map.get(currentTask.assigneeId) || currentTask.assigneeId : '-',
      payload: instance.payload,
      tasks: (instance.tasks || []).map((t: any) => ({
        taskId: t.id,
        nodeId: t.nodeId,
        assigneeId: t.assigneeId,
        assigneeName: map.get(t.assigneeId) || t.assigneeId,
        action: t.action,
        comment: t.comment,
        createdAt: t.createdAt?.toISOString(),
        completedAt: t.completedAt?.toISOString(),
      })),
      ccRecords: (instance.ccRecords || []).map((c: any) => ({
        ccRecordId: c.id,
        userId: c.userId,
        userName: map.get(c.userId) || c.userId,
        readAt: c.readAt?.toISOString(),
      })),
      createdAt: instance.createdAt?.toISOString(),
      updatedAt: instance.updatedAt?.toISOString(),
      completedAt: instance.completedAt?.toISOString(),
    }
  }
}
