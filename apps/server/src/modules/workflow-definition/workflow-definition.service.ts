import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { FlowableService } from '@/modules/flowable/flowable.service'
import type { CreateWorkflowDefinitionDto } from './dto/create-workflow-definition.dto'
import type { UpdateWorkflowDefinitionDto } from './dto/update-workflow-definition.dto'
import type { WorkflowDefinitionQueryDto } from './dto/workflow-definition-query.dto'

@Injectable()
export class WorkflowDefinitionService {
  constructor(
    private prisma: PrismaService,
    private flowable: FlowableService,
  ) {}

  async findAll(query: WorkflowDefinitionQueryDto) {
    const { module, keyword } = query
    const where: { module?: string; deletedAt: null; OR?: unknown[] } = { deletedAt: null }
    if (module) where.module = module
    if (keyword) {
      where.OR = [{ name: { contains: keyword } }, { code: { contains: keyword } }]
    }

    const list = await this.prisma.workflowDefinition.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })
    return { list, total: list.length }
  }

  async findOne(id: string) {
    const item = await this.prisma.workflowDefinition.findUnique({ where: { id } })
    if (!item) throw new NotFoundException('流程定义不存在')
    return item
  }

  async create(dto: CreateWorkflowDefinitionDto) {
    const exists = await this.prisma.workflowDefinition.findUnique({ where: { code: dto.code } })
    if (exists) throw new ConflictException('流程编码已存在')

    let flowableDeploymentId: string | undefined
    let flowableDefinitionId: string | undefined

    if (dto.bpmnXml && dto.status === 'ACTIVE') {
      const deployment = await this.flowable.deploy(dto.code, dto.bpmnXml)
      flowableDeploymentId = deployment.id
      const definitions = await this.flowable.getProcessDefinitions(flowableDeploymentId)
      flowableDefinitionId = definitions[0]?.id
    }

    return this.prisma.workflowDefinition.create({
      data: {
        name: dto.name,
        code: dto.code,
        module: dto.module,
        version: dto.version,
        status: dto.status,
        bpmnXml: dto.bpmnXml,
        nodes: (dto.nodes ?? []) as unknown as Prisma.InputJsonValue,
        edges: (dto.edges ?? []) as unknown as Prisma.InputJsonValue,
        flowableDeploymentId,
        flowableDefinitionId,
      },
    })
  }

  async update(id: string, dto: UpdateWorkflowDefinitionDto) {
    const existing = await this.findOne(id)

    let flowableDeploymentId = existing.flowableDeploymentId
    let flowableDefinitionId = existing.flowableDefinitionId

    if (
      dto.bpmnXml &&
      dto.status === 'ACTIVE' &&
      (!existing.flowableDefinitionId || dto.bpmnXml !== existing.bpmnXml)
    ) {
      const deployment = await this.flowable.deploy(dto.code || existing.code, dto.bpmnXml)
      flowableDeploymentId = deployment.id
      const definitions = await this.flowable.getProcessDefinitions(flowableDeploymentId)
      flowableDefinitionId = definitions[0]?.id
    }

    return this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        module: dto.module,
        version: dto.version,
        status: dto.status,
        bpmnXml: dto.bpmnXml,
        nodes: dto.nodes as unknown as Prisma.InputJsonValue,
        edges: dto.edges as unknown as Prisma.InputJsonValue,
        flowableDeploymentId,
        flowableDefinitionId,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.workflowDefinition.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }

  async deploy(id: string) {
    const existing = await this.findOne(id)
    if (!existing.bpmnXml) {
      throw new ConflictException('流程缺少 BPMN XML，无法发布')
    }

    const deployment = await this.flowable.deploy(existing.code, existing.bpmnXml)
    const definitions = await this.flowable.getProcessDefinitions(deployment.id)
    const definitionId = definitions[0]?.id

    await this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        flowableDeploymentId: deployment.id,
        flowableDefinitionId: definitionId,
        status: 'ACTIVE',
        version: { increment: 1 },
      },
    })

    return {
      deploymentId: deployment.id,
      definitionId,
      version: existing.version + 1,
    }
  }

  async startInstance(id: string, businessKey?: string, variables?: Record<string, unknown>) {
    const existing = await this.findOne(id)
    if (!existing.flowableDefinitionId) {
      throw new ConflictException('流程尚未发布到工作流引擎')
    }

    const instance = await this.flowable.startProcessInstance(existing.flowableDefinitionId, variables, businessKey)

    await this.prisma.workflowInstance.create({
      data: {
        definitionId: existing.id,
        businessType: existing.module,
        businessKey: businessKey || instance.id,
        payload: (variables ?? {}) as Prisma.InputJsonValue,
        status: instance.ended ? 'COMPLETED' : 'RUNNING',
        flowableProcessInstanceId: instance.id,
      },
    })

    return instance
  }
}
