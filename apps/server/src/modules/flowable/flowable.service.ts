import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

export interface FlowableProcessDefinition {
  id: string
  url?: string
  key: string
  version: number
  name?: string
  description?: string
  deploymentId: string
  tenantId?: string
  resourceName?: string
  diagramResourceName?: string
  category?: string
  suspended: boolean
}

export interface FlowableDeployment {
  id: string
  name: string
  deploymentTime?: string
  category?: string
  tenantId?: string
}

export interface FlowableProcessInstance {
  id: string
  url?: string
  name?: string
  businessKey?: string
  processDefinitionId: string
  processDefinitionUrl?: string
  startTime?: string
  endTime?: string
  durationInMillis?: number
  startUserId?: string
  tenantId?: string
  ended: boolean
  suspended: boolean
}

export interface FlowableTask {
  id: string
  url?: string
  name?: string
  taskDefinitionKey?: string
  assignee?: string
  owner?: string
  created?: string
  due?: string
  followUp?: string
  delegationState?: string
  description?: string
  executionId?: string
  processInstanceId?: string
  processDefinitionId?: string
  caseExecutionId?: string
  caseInstanceId?: string
  caseDefinitionId?: string
  suspended?: boolean
  formKey?: string
  tenantId?: string
}

export interface FlowableHistoricProcessInstance {
  id: string
  businessKey?: string
  processDefinitionId: string
  processDefinitionKey?: string
  startTime?: string
  endTime?: string
  durationInMillis?: number
  startUserId?: string
  startActivityId?: string
  endActivityId?: string
  deleteReason?: string
  state?: string // ACTIVE / COMPLETED / INTERNALLY_TERMINATED
}

export interface FlowableHistoricTaskInstance {
  id: string
  taskDefinitionKey?: string
  name?: string
  assignee?: string
  owner?: string
  processInstanceId?: string
  processDefinitionId?: string
  startTime?: string
  endTime?: string
  durationInMillis?: number
  deleteReason?: string
}

export interface FlowableHistoricActivityInstance {
  id: string
  activityId: string
  activityName?: string
  activityType: string
  processInstanceId: string
  processDefinitionId: string
  taskId?: string
  assignee?: string
  startTime?: string
  endTime?: string
  durationInMillis?: number
}

export interface FlowableHistoricVariableInstance {
  id: string
  name: string
  type: string
  value: unknown
  processInstanceId: string
  executionId?: string
  taskId?: string
}

/**
 * 工作流引擎 REST 客户端
 *
 * 当前实现基于 Camunda 7 (engine-rest)。历史文件名/字段名保留为 flowable*，
 * 仅内部 HTTP 路径与报文结构按 Camunda 7 REST API 实现，避免数据库字段与外部调用方改动。
 */
@Injectable()
export class FlowableService {
  private readonly logger = new Logger(FlowableService.name)
  private readonly baseUrl: string
  private readonly username: string
  private readonly password: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get('CAMUNDA_URL', 'http://localhost:8080/engine-rest')
    this.username = this.configService.get('CAMUNDA_USERNAME', 'demo')
    this.password = this.configService.get('CAMUNDA_PASSWORD', 'demo')
  }

  private get auth() {
    return {
      username: this.username,
      password: this.password,
    }
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message
      this.logger.error(`Camunda ${context} failed: ${message}`, error.response?.data)
      throw new Error(`Camunda ${context} failed: ${message}`)
    }
    throw error
  }

  private toCamundaVariables(variables?: Record<string, unknown>): Record<string, { value: unknown; type?: string }> {
    if (!variables) return {}
    const result: Record<string, { value: unknown; type?: string }> = {}
    for (const [name, value] of Object.entries(variables)) {
      let type: string | undefined
      if (typeof value === 'boolean') type = 'Boolean'
      else if (typeof value === 'number') type = Number.isInteger(value) ? 'Integer' : 'Double'
      else if (value instanceof Date) type = 'Date'
      else if (typeof value === 'string') type = 'String'
      result[name] = { value, type }
    }
    return result
  }

  async health(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/engine`, {
          auth: this.auth,
          timeout: 5000,
        }),
      )
      return true
    } catch (error) {
      this.logger.warn(`Camunda health check failed: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  async deploy(name: string, bpmnXml: string): Promise<FlowableDeployment> {
    const formData = new FormData()
    const blob = new Blob([bpmnXml], { type: 'application/xml' })
    // Camunda 7 REST: part name 必须为 data，文件名决定 resourceName
    formData.append('data', blob, `${name}.bpmn20.xml`)

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/deployment/create`, formData, {
          auth: this.auth,
          params: { 'deployment-name': name },
        }),
      )
      return data as FlowableDeployment
    } catch (error) {
      this.handleError(error, 'deploy')
    }
  }

  async getProcessDefinitions(deploymentId?: string): Promise<FlowableProcessDefinition[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/process-definition`, {
          auth: this.auth,
          params: deploymentId ? { deploymentId } : {},
        }),
      )
      return (Array.isArray(data) ? data : data.data || []) as FlowableProcessDefinition[]
    } catch (error) {
      this.handleError(error, 'getProcessDefinitions')
    }
  }

  async startProcessInstance(
    processDefinitionId: string,
    variables?: Record<string, unknown>,
    businessKey?: string,
  ): Promise<FlowableProcessInstance> {
    try {
      const body: { businessKey?: string; variables?: Record<string, { value: unknown; type?: string }> } = {
        variables: this.toCamundaVariables(variables),
      }
      if (businessKey) body.businessKey = businessKey

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/process-definition/${processDefinitionId}/start`, body, {
          auth: this.auth,
        }),
      )
      return data as FlowableProcessInstance
    } catch (error) {
      this.handleError(error, 'startProcessInstance')
    }
  }

  async getProcessInstance(instanceId: string): Promise<FlowableProcessInstance> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/process-instance/${instanceId}`, {
          auth: this.auth,
        }),
      )
      return data as FlowableProcessInstance
    } catch (error) {
      this.handleError(error, 'getProcessInstance')
    }
  }

  async getTasks(params?: {
    processInstanceId?: string
    processDefinitionId?: string
    assignee?: string
    assigneeLike?: string
    candidateUser?: string
    candidateGroup?: string
    taskDefinitionKey?: string
    active?: boolean
  }): Promise<FlowableTask[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/task`, {
          auth: this.auth,
          params: params || {},
        }),
      )
      return (Array.isArray(data) ? data : data.data || []) as FlowableTask[]
    } catch (error) {
      this.handleError(error, 'getTasks')
    }
  }

  async completeTask(taskId: string, variables?: Record<string, unknown>): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/task/${taskId}/complete`,
          { variables: this.toCamundaVariables(variables) },
          { auth: this.auth },
        ),
      )
    } catch (error) {
      this.handleError(error, 'completeTask')
    }
  }

  async deleteProcessInstance(instanceId: string, reason = 'withdrawn'): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/process-instance/${instanceId}`, {
          auth: this.auth,
          params: { deleteReason: reason },
        }),
      )
    } catch (error) {
      this.handleError(error, 'deleteProcessInstance')
    }
  }

  async getHistoricProcessInstance(instanceId: string): Promise<FlowableHistoricProcessInstance | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/history/process-instance/${instanceId}`, {
          auth: this.auth,
        }),
      )
      return data as FlowableHistoricProcessInstance
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) return null
      this.handleError(error, 'getHistoricProcessInstance')
    }
  }

  async getHistoricTasks(params?: {
    processInstanceId?: string
    assignee?: string
    finished?: boolean
    taskDefinitionKey?: string
  }): Promise<FlowableHistoricTaskInstance[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/history/task`, {
          auth: this.auth,
          params: params || {},
        }),
      )
      return (Array.isArray(data) ? data : data.data || []) as FlowableHistoricTaskInstance[]
    } catch (error) {
      this.handleError(error, 'getHistoricTasks')
    }
  }

  async getHistoricActivityInstances(params?: {
    processInstanceId?: string
    activityId?: string
    activityType?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<FlowableHistoricActivityInstance[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/history/activity-instance`, {
          auth: this.auth,
          params: {
            ...(params || {}),
            sortBy: params?.sortBy || 'startTime',
            sortOrder: params?.sortOrder || 'asc',
          },
        }),
      )
      return (Array.isArray(data) ? data : data.data || []) as FlowableHistoricActivityInstance[]
    } catch (error) {
      this.handleError(error, 'getHistoricActivityInstances')
    }
  }

  async getHistoricVariableInstances(params?: {
    processInstanceId?: string
    variableName?: string
    variableNameLike?: string
  }): Promise<FlowableHistoricVariableInstance[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/history/variable-instance`, {
          auth: this.auth,
          params: params || {},
        }),
      )
      return (Array.isArray(data) ? data : data.data || []) as FlowableHistoricVariableInstance[]
    } catch (error) {
      this.handleError(error, 'getHistoricVariableInstances')
    }
  }

  async getProcessInstanceActivityInstances(instanceId: string): Promise<unknown> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/process-instance/${instanceId}/activity-instances`, {
          auth: this.auth,
        }),
      )
      return data
    } catch (error) {
      this.handleError(error, 'getProcessInstanceActivityInstances')
    }
  }
}
