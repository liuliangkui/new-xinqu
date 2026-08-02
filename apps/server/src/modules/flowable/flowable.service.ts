import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'

export interface FlowableProcessDefinition {
  id: string
  url: string
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
  url: string
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
    this.baseUrl = this.configService.get('FLOWABLE_URL', 'http://localhost:8080/flowable-rest')
    this.username = this.configService.get('FLOWABLE_USERNAME', 'rest-admin')
    this.password = this.configService.get('FLOWABLE_PASSWORD', 'test')
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
      this.logger.error(`Flowable ${context} failed: ${message}`, error.response?.data)
      throw new Error(`Flowable ${context} failed: ${message}`)
    }
    throw error
  }

  async health(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/service/management/engine`, {
          auth: this.auth,
          timeout: 5000,
        }),
      )
      return true
    } catch (error) {
      this.logger.warn(`Flowable health check failed: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  async deploy(name: string, bpmnXml: string): Promise<FlowableDeployment> {
    const formData = new FormData()
    const blob = new Blob([bpmnXml], { type: 'application/xml' })
    formData.append('deploymentKey', name)
    formData.append('deploymentName', name)
    formData.append('file', blob, `${name}.bpmn20.xml`)

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/repository/deployments`, formData, {
          auth: this.auth,
          headers: { 'Content-Type': 'multipart/form-data' },
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
        this.httpService.get(`${this.baseUrl}/repository/process-definitions`, {
          auth: this.auth,
          params: deploymentId ? { deploymentId } : {},
        }),
      )
      return (data.data || []) as FlowableProcessDefinition[]
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
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/runtime/process-instances`,
          {
            processDefinitionId,
            businessKey,
            variables: variables
              ? Object.entries(variables).map(([name, value]) => ({
                  name,
                  value,
                }))
              : [],
          },
          { auth: this.auth },
        ),
      )
      return data as FlowableProcessInstance
    } catch (error) {
      this.handleError(error, 'startProcessInstance')
    }
  }

  async getProcessInstance(instanceId: string): Promise<FlowableProcessInstance> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/runtime/process-instances/${instanceId}`, {
          auth: this.auth,
        }),
      )
      return data as FlowableProcessInstance
    } catch (error) {
      this.handleError(error, 'getProcessInstance')
    }
  }
}
