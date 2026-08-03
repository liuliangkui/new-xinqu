import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import type { CurrentUser } from '@/common/helpers/data-scope.helper'
import { FlowableService, type FlowableHistoricVariableInstance } from '@/modules/flowable/flowable.service'
import { CreateApprovalDto } from './dto/create-approval.dto'
import { UpdateApprovalDto } from './dto/update-approval.dto'
import type { ApprovalQueryDto } from './dto/approval-query.dto'
import {
  generateApprovalBpmn,
  type ApprovalFlowMode,
  type ApprovalRejectAction,
  type ApprovalFlowStage,
} from './approval-workflow.generator'

@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name)
  private readonly defaultApproverId = 'user_admin'

  constructor(
    private prisma: PrismaService,
    private flowable: FlowableService,
  ) {}

  async findAll(user: CurrentUser, query: ApprovalQueryDto) {
    const { page = 1, pageSize = 20, keyword, module, status, tabType = 'all' } = query

    // 基础查询条件（用于统计）：不包含 tabType/status 过滤，避免切换标签时数字变化
    const baseWhere: Record<string, unknown> = { deletedAt: null }
    if (keyword) {
      baseWhere.OR = [{ title: { contains: keyword } }, { businessKey: { contains: keyword } }]
    }
    if (module) {
      baseWhere.template = { module }
    }

    // 列表查询条件：在基础条件上叠加标签/状态过滤
    const listWhere = { ...baseWhere }

    let workflowInstanceIds: string[] | undefined
    if (tabType === 'pending') {
      workflowInstanceIds = await this.findPendingWorkflowInstanceIds(user.userId)
    } else if (tabType === 'approved') {
      workflowInstanceIds = await this.findApprovedWorkflowInstanceIds(user.userId)
    }

    if (workflowInstanceIds !== undefined) {
      if (workflowInstanceIds.length === 0) {
        // 没有引擎任务时，仍保留本地兜底
        const localInstanceIds =
          tabType === 'pending'
            ? await this.findLocalPendingInstanceIds(user.userId)
            : await this.findLocalApprovedInstanceIds(user.userId)
        if (localInstanceIds.length === 0) {
          return {
            list: [],
            total: 0,
            page,
            pageSize,
            stats: await this.buildStats(user.userId, baseWhere),
          }
        }
        listWhere.id = { in: localInstanceIds }
      } else {
        listWhere.workflowInstanceId = { in: workflowInstanceIds }
      }
    }

    if (tabType === 'initiated') {
      listWhere.applicantId = user.userId
    } else if (tabType === 'cc') {
      listWhere.ccRecords = { some: { userId: user.userId } }
    }

    if (status) {
      listWhere.status = status.toUpperCase()
    }
    if (tabType === 'pending') {
      listWhere.status = 'PENDING'
    }

    const [list, total] = await Promise.all([
      this.prisma.approvalInstance.findMany({
        where: listWhere,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          template: true,
          tasks: { orderBy: { createdAt: 'asc' } },
          ccRecords: true,
        },
      }),
      this.prisma.approvalInstance.count({ where: listWhere }),
    ])

    const userMap = await this.buildUserMap(list)
    const dtoList = list.map((item) => this.toApprovalDto(item, userMap))
    const stats = await this.buildStats(user.userId, baseWhere)

    return { list: dtoList, total, page, pageSize, stats }
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
    const stages = this.resolveStages(dto)
    const mode: ApprovalFlowMode = dto.mode === 'parallel' ? 'parallel' : 'serial'
    const rejectAction: ApprovalRejectAction = dto.rejectAction || 'end'
    const rejectTargetIndex = dto.rejectTargetIndex

    if (stages.length === 0) {
      throw new ConflictException('审批阶段不能为空')
    }

    // 1. 生成动态 BPMN 并持久化流程定义
    const workflowDef = await this.createDynamicWorkflowDefinition({
      title: dto.title,
      stages,
      rejectAction,
      rejectTargetIndex,
    })

    // 2. 创建专用模板（快照）
    const template = await this.prisma.approvalTemplate.create({
      data: {
        name: this.moduleName(module),
        code: `${module}-dynamic-${Date.now()}`,
        module,
        formSchema: this.buildFormSchema(dto),
        flowNodes: stages.map((stage, idx) => ({
          nodeId: stage.id,
          name: stage.name || `阶段 ${idx + 1}`,
          approverType: 'USER',
          approvers: stage.approvers.map((a) => a.id),
        })) as unknown as object[],
        workflowDefinitionId: workflowDef.id,
        status: 'ACTIVE',
      },
    })

    // 3. 创建审批实例
    const instance = await this.prisma.approvalInstance.create({
      data: {
        title: dto.title,
        businessKey: dto.businessKey,
        applicantId: userId,
        templateId: template.id,
        status: 'PENDING',
        payload: {
          ...(dto.payload || {}),
          priority: dto.priority || 'normal',
          stages: stages as unknown as Record<string, unknown>[],
          approverIds: stages.flatMap((s) => s.approvers.map((a) => a.id)),
          mode,
          rejectAction,
          rejectTargetIndex,
        } as any,
        ccRecords: dto.ccUserIds?.length ? { create: dto.ccUserIds.map((uid) => ({ userId: uid })) } : undefined,
      },
      include: { template: true, tasks: true, ccRecords: true },
    })

    // 4. 启动工作流（Camunda 不可用时降级为本地模式）
    try {
      const processInstance = await this.startWorkflowInstance(
        workflowDef,
        {
          applicant: userId,
          module,
          priority: dto.priority || 'normal',
          ...(instance.payload as Record<string, unknown>),
        },
        instance.id,
      )
      if (processInstance) {
        await this.prisma.approvalInstance.update({
          where: { id: instance.id },
          data: { workflowInstanceId: processInstance.id },
        })
        await this.syncTasks(instance.id, processInstance.id)
      }
    } catch (e) {
      this.logger.error(`审批工作流启动失败: ${e instanceof Error ? e.message : String(e)}`)
    }

    const refreshed = await this.prisma.approvalInstance.findUnique({
      where: { id: instance.id },
      include: { template: true, tasks: true, ccRecords: true },
    })
    if (!refreshed) throw new NotFoundException('审批实例创建后未找到')

    // 本地模式（Camunda 不可用时）：为第一阶段创建待审任务，使审批人能在待审清单中看到自己
    if (!refreshed.workflowInstanceId && stages.length > 0) {
      await this.createLocalTasksForStage(refreshed.id, 0, stages[0])
    }

    const userMap = await this.buildUserMap(refreshed)
    return this.toApprovalDto(refreshed, userMap)
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

  async action(id: string, userId: string, action: 'APPROVE' | 'REJECT', comment?: string, targetNodeIndex?: number) {
    const instance = await this.prisma.approvalInstance.findUnique({
      where: { id },
      include: { tasks: true, template: true },
    })
    if (!instance) throw new NotFoundException('审批不存在')
    if (instance.status !== 'PENDING') throw new ConflictException('审批已结束')

    let completedNodeId: string | undefined
    if (instance.workflowInstanceId) {
      const tasks = await this.flowable.getTasks({
        processInstanceId: instance.workflowInstanceId,
      })
      const task = tasks.find((t) => t.assignee === userId) || tasks[0]
      if (!task?.id) throw new ConflictException('当前没有可审批的任务')

      completedNodeId = task.taskDefinitionKey || task.id
      const approvalVarName = this.getApprovalVariableName(completedNodeId)
      const commentVarName = this.getCommentVariableName(completedNodeId)
      const variables: Record<string, unknown> = {
        [approvalVarName]: action === 'APPROVE',
        [commentVarName]: comment || '',
      }
      if (action === 'REJECT' && targetNodeIndex !== undefined) {
        variables.rejectTargetStageIndex = targetNodeIndex
      } else if (action === 'APPROVE') {
        // 通过时清空驳回目标，避免后续节点受旧变量影响
        variables.rejectTargetStageIndex = null
      }
      await this.flowable.completeTask(task.id, variables)
    }

    const taskAction = action === 'APPROVE' ? 'approve' : 'reject'
    if (completedNodeId) {
      const targetTask = instance.tasks.find((t) => t.nodeId === completedNodeId && !t.action)
      if (targetTask) {
        await this.prisma.approvalTask.update({
          where: { id: targetTask.id },
          data: { action: taskAction, comment, completedAt: new Date() },
        })
      } else {
        await this.prisma.approvalTask.create({
          data: {
            instanceId: id,
            nodeId: completedNodeId,
            assigneeId: userId,
            action: taskAction,
            comment,
            completedAt: new Date(),
          },
        })
      }
    } else {
      const activeTask = await this.findActiveLocalTask(id, userId)
      if (activeTask) {
        completedNodeId = activeTask.nodeId
        await this.prisma.approvalTask.update({
          where: { id: activeTask.id },
          data: { action: taskAction, comment, completedAt: new Date() },
        })
      } else {
        completedNodeId = 'manual'
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
    }

    if (instance.workflowInstanceId) {
      await this.syncTasks(instance.id, instance.workflowInstanceId)

      let ended = true
      try {
        const pi = await this.flowable.getProcessInstance(instance.workflowInstanceId)
        ended = pi.ended
      } catch {
        ended = true
      }

      if (ended) {
        await this.prisma.approvalInstance.update({
          where: { id },
          data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', completedAt: new Date() },
        })
      }
    } else {
      // 本地模式：按阶段推进
      await this.handleLocalActionProgress(id, userId, action, completedNodeId)
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

  async getTimeline(id: string) {
    const instance = await this.prisma.approvalInstance.findUnique({
      where: { id },
      include: { tasks: true, ccRecords: true },
    })
    if (!instance) throw new NotFoundException('审批不存在')

    if (!instance.workflowInstanceId) {
      return this.buildLocalTimeline(instance)
    }

    const [activities, variables] = await Promise.all([
      this.flowable.getHistoricActivityInstances({
        processInstanceId: instance.workflowInstanceId,
      }),
      this.flowable.getHistoricVariableInstances({
        processInstanceId: instance.workflowInstanceId,
      }),
    ])

    const variableMap = new Map<string, FlowableHistoricVariableInstance['value']>()
    for (const v of variables) {
      variableMap.set(v.name, v.value)
    }

    const userIds = new Set<string>([instance.applicantId])
    const taskActivities = activities.filter((a) => a.activityType === 'userTask')
    for (const a of taskActivities) {
      if (a.assignee) userIds.add(a.assignee)
    }
    const userMap = await this.buildUserMapByIds(userIds)

    const timeline = taskActivities.map((a) => {
      const index = this.getNodeIndex(a.activityId)
      const approvalVar = this.getApprovalVariableName(a.activityId)
      const commentVar = this.getCommentVariableName(a.activityId)
      const approved = variableMap.get(approvalVar)
      const cmt = variableMap.get(commentVar)
      const isFinished = !!a.endTime
      let action: 'approve' | 'reject' | undefined
      if (isFinished) {
        action = approved === true || approved === 'true' ? 'approve' : 'reject'
      }
      return {
        nodeId: a.activityId,
        nodeName: a.activityName || `审批节点 ${index + 1}`,
        assigneeId: a.assignee,
        assigneeName: a.assignee ? userMap.get(a.assignee) || a.assignee : '-',
        action,
        comment: cmt ? String(cmt) : undefined,
        startTime: a.startTime,
        endTime: a.endTime,
      }
    })

    return { instanceId: id, timeline }
  }

  // ---------------------------------------------------------------------------
  // 私有方法
  // ---------------------------------------------------------------------------

  private emptyStats() {
    return {
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      withdrawnCount: 0,
      initiatedCount: 0,
      ccCount: 0,
    }
  }

  private async buildStats(userId: string, baseWhere: Record<string, unknown>) {
    const [totalCount, rejectedCount, withdrawnCount, initiatedCount, ccCount] = await Promise.all([
      this.prisma.approvalInstance.count({ where: baseWhere }),
      this.prisma.approvalInstance.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      this.prisma.approvalInstance.count({ where: { ...baseWhere, status: 'WITHDRAWN' } }),
      this.prisma.approvalInstance.count({ where: { ...baseWhere, applicantId: userId } }),
      this.prisma.approvalInstance.count({
        where: { ...baseWhere, ccRecords: { some: { userId } } },
      }),
    ])

    const [pendingCount, approvedCount] = await Promise.all([
      this.countUserPending(userId, baseWhere),
      this.countUserApproved(userId, baseWhere),
    ])

    return {
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      withdrawnCount,
      initiatedCount,
      ccCount,
    }
  }

  private async countUserPending(userId: string, baseWhere: Record<string, unknown>): Promise<number> {
    const [workflowIds, localIds] = await Promise.all([
      this.findPendingWorkflowInstanceIds(userId).catch(() => [] as string[]),
      this.findLocalPendingInstanceIds(userId),
    ])
    const ids = [...new Set([...workflowIds, ...localIds])]
    if (ids.length === 0) return 0
    return this.prisma.approvalInstance.count({ where: { ...baseWhere, id: { in: ids } } })
  }

  private async countUserApproved(userId: string, baseWhere: Record<string, unknown>): Promise<number> {
    const [workflowIds, localIds] = await Promise.all([
      this.findApprovedWorkflowInstanceIds(userId).catch(() => [] as string[]),
      this.findLocalApprovedInstanceIds(userId),
    ])
    const ids = [...new Set([...workflowIds, ...localIds])]
    if (ids.length === 0) return 0
    return this.prisma.approvalInstance.count({ where: { ...baseWhere, id: { in: ids } } })
  }

  private async findPendingWorkflowInstanceIds(userId: string): Promise<string[]> {
    try {
      const tasks = await this.flowable.getTasks({ assignee: userId, active: true })
      const ids = tasks.map((t) => t.processInstanceId).filter((id): id is string => !!id)
      const instances = await this.prisma.approvalInstance.findMany({
        where: { workflowInstanceId: { in: [...new Set(ids)] } },
        select: { workflowInstanceId: true },
      })
      return instances.map((i) => i.workflowInstanceId).filter((id): id is string => !!id)
    } catch (e) {
      this.logger.warn(`查询待审工作流任务失败: ${e instanceof Error ? e.message : String(e)}`)
      return []
    }
  }

  private async findApprovedWorkflowInstanceIds(userId: string): Promise<string[]> {
    try {
      const tasks = await this.flowable.getHistoricTasks({ assignee: userId, finished: true })
      const ids = tasks.map((t) => t.processInstanceId).filter((id): id is string => !!id)
      const instances = await this.prisma.approvalInstance.findMany({
        where: { workflowInstanceId: { in: [...new Set(ids)] } },
        select: { workflowInstanceId: true },
      })
      return instances.map((i) => i.workflowInstanceId).filter((id): id is string => !!id)
    } catch (e) {
      this.logger.warn(`查询已审历史任务失败: ${e instanceof Error ? e.message : String(e)}`)
      return []
    }
  }

  private async findLocalPendingInstanceIds(userId: string): Promise<string[]> {
    const tasks = await this.prisma.approvalTask.findMany({
      where: { assigneeId: userId, action: null },
      select: { instanceId: true },
    })
    return [...new Set(tasks.map((t) => t.instanceId))]
  }

  private async findLocalApprovedInstanceIds(userId: string): Promise<string[]> {
    const tasks = await this.prisma.approvalTask.findMany({
      where: { assigneeId: userId, action: { not: null } },
      select: { instanceId: true },
    })
    return [...new Set(tasks.map((t) => t.instanceId))]
  }

  private async createLocalTasksForStage(
    instanceId: string,
    stageIndex: number,
    stage: ApprovalFlowStage,
  ): Promise<void> {
    const nodeId = `stage_${stageIndex}`
    const approvers = stage.approvers.filter((a) => a.id)
    if (approvers.length === 0) return
    await this.prisma.approvalTask.createMany({
      data: approvers.map((a) => ({
        instanceId,
        nodeId,
        assigneeId: a.id,
      })),
      skipDuplicates: true,
    })
  }

  private parseStageIndex(nodeId?: string): number {
    if (!nodeId) return 0
    const match = nodeId.match(/^stage_(\d+)$/)
    return match ? Number(match[1]) : 0
  }

  private async handleLocalActionProgress(
    instanceId: string,
    userId: string,
    action: 'APPROVE' | 'REJECT',
    completedNodeId?: string,
  ): Promise<void> {
    if (action === 'REJECT') {
      await this.prisma.approvalInstance.update({
        where: { id: instanceId },
        data: { status: 'REJECTED', completedAt: new Date() },
      })
      return
    }

    const instance = await this.prisma.approvalInstance.findUnique({
      where: { id: instanceId },
      include: { tasks: true },
    })
    if (!instance) return

    const payload = (instance.payload as Record<string, unknown>) || {}
    const stages = (payload.stages as unknown as ApprovalFlowStage[] | undefined) || []
    if (stages.length === 0) {
      await this.prisma.approvalInstance.update({
        where: { id: instanceId },
        data: { status: 'APPROVED', completedAt: new Date() },
      })
      return
    }

    const stageIndex = this.parseStageIndex(completedNodeId)
    const stageTasks = instance.tasks.filter((t) => t.nodeId === `stage_${stageIndex}`)
    const allCompleted = stageTasks.length > 0 && stageTasks.every((t) => !!t.action)

    if (!allCompleted) {
      // 会签/并行阶段尚未全部完成，保持 PENDING
      return
    }

    const nextStage = stages[stageIndex + 1]
    if (nextStage) {
      await this.createLocalTasksForStage(instanceId, stageIndex + 1, nextStage)
    } else {
      await this.prisma.approvalInstance.update({
        where: { id: instanceId },
        data: { status: 'APPROVED', completedAt: new Date() },
      })
    }
  }

  private async createDynamicWorkflowDefinition(input: {
    title: string
    stages: ApprovalFlowStage[]
    rejectAction: ApprovalRejectAction
    rejectTargetIndex?: number
  }) {
    const { title, stages, rejectAction, rejectTargetIndex } = input
    const key = `approval-dynamic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const bpmnXml = generateApprovalBpmn({
      processKey: key,
      name: `审批流程：${title}`,
      stages,
      rejectAction,
      rejectTargetIndex,
    })

    const def = await this.prisma.workflowDefinition.create({
      data: {
        name: `动态审批 - ${title}`,
        code: key,
        module: 'APPROVAL',
        status: 'ACTIVE',
        bpmnXml,
        nodes: [],
        edges: [],
      },
    })

    const deployed = await this.ensureWorkflowDefinitionDeployed(def)
    return deployed
  }

  private resolveStages(dto: CreateApprovalDto): ApprovalFlowStage[] {
    if (dto.stages && dto.stages.length > 0) {
      return dto.stages
        .map((s, idx) => ({
          id: s.id || `stage_${idx}`,
          name: s.name || `阶段 ${idx + 1}`,
          mode: s.mode === 'parallel' ? ('parallel' as const) : ('serial' as const),
          approvers: s.approvers.filter((a) => a.id),
        }))
        .filter((s) => s.approvers.length > 0)
    }
    // 兼容旧版：按全局 mode 把所有审批人作为一个阶段
    const approverIds = this.resolveApproverIds(dto)
    if (approverIds.length === 0) return []
    return [
      {
        id: 'stage_legacy',
        name: dto.mode === 'parallel' ? '并行审批' : '串行审批',
        mode: dto.mode === 'parallel' ? 'parallel' : 'serial',
        approvers: approverIds.map((id) => ({ id })),
      },
    ]
  }

  private resolveApproverIds(dto: CreateApprovalDto): string[] {
    if (dto.approverIds && dto.approverIds.length > 0) {
      return [...new Set(dto.approverIds.filter((id) => !!id))]
    }
    if (dto.approverId) {
      return [dto.approverId]
    }
    return [this.defaultApproverId]
  }

  private buildFormSchema(dto: CreateApprovalDto): object {
    return {
      title: dto.title,
      businessKey: dto.businessKey,
      priority: dto.priority || 'normal',
      payload: dto.payload || {},
    }
  }

  private async findActiveLocalTask(instanceId: string, assigneeId: string) {
    return this.prisma.approvalTask.findFirst({
      where: { instanceId, assigneeId, action: null },
    })
  }

  private getNodeIndex(nodeId?: string): number {
    if (!nodeId) return 0
    // 兼容旧版 task_N 以及新版 task_sN / task_sN_aM
    const match = nodeId.match(/^task_(?:s(\d+)(?:_a(\d+))?|\d+)$/)
    if (!match) return 0
    return Number(match[1] ?? match[0].replace(/^task_/, ''))
  }

  private getApprovalVariableName(nodeId?: string): string {
    if (!nodeId) return 'approved_0'
    if (nodeId.startsWith('task_s')) return `approved_${nodeId}`
    // 兼容旧版 task_N
    const legacy = nodeId.match(/^task_(\d+)$/)
    if (legacy) return `approved_${legacy[1]}`
    return `approved_${nodeId}`
  }

  private getCommentVariableName(nodeId?: string): string {
    const approvalVar = this.getApprovalVariableName(nodeId)
    return approvalVar.replace(/^approved_/, 'comment_')
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

    try {
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
    } catch (e) {
      this.logger.warn(`Camunda 部署失败，审批将降级为本地模式: ${e instanceof Error ? e.message : String(e)}`)
      return def
    }
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
    if (!deployed.flowableDefinitionId) {
      this.logger.warn('流程定义未部署到 Camunda，跳过工作流引擎启动')
      return null
    }
    return this.flowable.startProcessInstance(deployed.flowableDefinitionId, variables, businessKey)
  }

  private async syncTasks(instanceId: string, workflowInstanceId: string) {
    const tasks = await this.flowable.getTasks({ processInstanceId: workflowInstanceId })
    for (const task of tasks) {
      if (!task.id) continue
      const existsActive = await this.prisma.approvalTask.findFirst({
        where: {
          instanceId,
          nodeId: task.taskDefinitionKey || task.id,
          action: null,
        },
      })
      if (!existsActive) {
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

  private buildLocalTimeline(instance: any) {
    const userMap = new Map<string, string | null>()
    const timeline = (instance.tasks || []).map((t: any) => ({
      nodeId: t.nodeId,
      nodeName: `审批节点`,
      assigneeId: t.assigneeId,
      assigneeName: userMap.get(t.assigneeId) || t.assigneeId,
      action: t.action,
      comment: t.comment,
      startTime: t.createdAt?.toISOString(),
      endTime: t.completedAt?.toISOString(),
    }))
    return { instanceId: instance.id, timeline }
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
    return this.buildUserMapByIds(ids)
  }

  private async buildUserMapByIds(ids: Set<string> | Iterable<string>) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(ids) } },
      select: { id: true, name: true },
    })
    return new Map(users.map((u) => [u.id, u.name]))
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

  private toApprovalDto(instance: any, userMap?: Map<string, string | null>) {
    const map = userMap || new Map<string, string | null>()
    const currentTask = (instance.tasks || []).find((t: any) => !t.action)
    const payload = (instance.payload as Record<string, unknown> | undefined) || {}
    return {
      approvalId: instance.id,
      approvalCode: instance.businessKey || instance.id,
      title: instance.title,
      businessKey: instance.businessKey,
      module: instance.template?.module || 'other',
      status: instance.status,
      priority: payload.priority || 'normal',
      applicantId: instance.applicantId,
      applicantName: map.get(instance.applicantId) || instance.applicantId,
      currentApproverName: currentTask ? map.get(currentTask.assigneeId) || currentTask.assigneeId : '-',
      payload,
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
