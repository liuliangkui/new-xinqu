import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import type { CreateWorkflowDefinitionDto } from './dto/create-workflow-definition.dto'
import type { UpdateWorkflowDefinitionDto } from './dto/update-workflow-definition.dto'
import type { WorkflowDefinitionQueryDto } from './dto/workflow-definition-query.dto'

@Injectable()
export class WorkflowDefinitionService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.workflowDefinition.create({
      data: {
        name: dto.name,
        code: dto.code,
        module: dto.module,
        version: dto.version,
        status: dto.status,
        nodes: (dto.nodes ?? []) as unknown as Prisma.InputJsonValue,
        edges: (dto.edges ?? []) as unknown as Prisma.InputJsonValue,
      },
    })
  }

  async update(id: string, dto: UpdateWorkflowDefinitionDto) {
    await this.findOne(id)
    return this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        module: dto.module,
        version: dto.version,
        status: dto.status,
        nodes: dto.nodes as unknown as Prisma.InputJsonValue,
        edges: dto.edges as unknown as Prisma.InputJsonValue,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.workflowDefinition.update({ where: { id }, data: { deletedAt: new Date() } })
    return { success: true }
  }
}
