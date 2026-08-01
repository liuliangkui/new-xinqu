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
  nodes: WorkflowNode[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowForm {
  id?: string
  name: string
  code: string
  module: string
  status?: WorkflowStatus
}

export interface WorkflowListResult {
  list: WorkflowDefinition[]
  total: number
}
