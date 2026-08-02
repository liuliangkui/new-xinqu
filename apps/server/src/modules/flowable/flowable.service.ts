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
}
