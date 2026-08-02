import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Permissions } from '@/common/decorators/permissions.decorator'
import { WorkflowDefinitionService } from './workflow-definition.service'
import { CreateWorkflowDefinitionDto } from './dto/create-workflow-definition.dto'
import { UpdateWorkflowDefinitionDto } from './dto/update-workflow-definition.dto'
import { WorkflowDefinitionQueryDto } from './dto/workflow-definition-query.dto'

@ApiTags('流程设计器')
@ApiBearerAuth()
@Controller('workflow-definitions')
export class WorkflowDefinitionController {
  constructor(private readonly workflowDefinitionService: WorkflowDefinitionService) {}

  @Get()
  @Permissions('workflow:read')
  @ApiOperation({ summary: '查询流程定义列表' })
  findAll(@Query() query: WorkflowDefinitionQueryDto) {
    return this.workflowDefinitionService.findAll(query)
  }

  @Get(':id')
  @Permissions('workflow:read')
  @ApiOperation({ summary: '查询流程定义详情' })
  findOne(@Param('id') id: string) {
    return this.workflowDefinitionService.findOne(id)
  }

  @Post()
  @Permissions('workflow:create')
  @ApiOperation({ summary: '创建流程定义' })
  create(@Body() dto: CreateWorkflowDefinitionDto) {
    return this.workflowDefinitionService.create(dto)
  }

  @Put(':id')
  @Permissions('workflow:update')
  @ApiOperation({ summary: '更新流程定义' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDefinitionDto) {
    return this.workflowDefinitionService.update(id, dto)
  }

  @Delete(':id')
  @Permissions('workflow:delete')
  @ApiOperation({ summary: '删除流程定义' })
  remove(@Param('id') id: string) {
    return this.workflowDefinitionService.remove(id)
  }
}
