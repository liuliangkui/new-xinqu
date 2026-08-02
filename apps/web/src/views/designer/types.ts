/**
 * 流程设计器 — 类型定义
 */

export type WorkflowStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT'

export interface WorkflowNode {
  id: string
  name: string
  type: string
  approvers?: string[]
}

export interface WorkflowDefinition {
  id: string
  name: string
  code: string
  module: string
  version: number
  status: WorkflowStatus
  bpmnXml?: string
  nodes: WorkflowNode[]
  flowableDeploymentId?: string
  flowableDefinitionId?: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowForm {
  id?: string
  name: string
  code: string
  module: string
  status?: WorkflowStatus
  bpmnXml?: string
}

export interface WorkflowListResult {
  list: WorkflowDefinition[]
  total: number
}
