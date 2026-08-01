/**
 * 流程设计器 — API 层
 */
import { get, post, put, del } from '@/api/request'
import type { WorkflowDefinition, WorkflowForm, WorkflowListResult } from './types'

const BASE = '/workflow-definitions'

/** 获取流程列表 */
export function getWorkflowList(params?: {
  module?: string
  keyword?: string
}): Promise<WorkflowListResult> {
  return get<WorkflowListResult>(BASE, params)
}

/** 保存流程 */
export function saveWorkflow(data: WorkflowForm): Promise<WorkflowDefinition> {
  return data.id
    ? put<WorkflowDefinition>(`${BASE}/${data.id}`, data)
    : post<WorkflowDefinition>(BASE, data)
}

/** 删除流程 */
export function deleteWorkflow(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${id}`)
}
