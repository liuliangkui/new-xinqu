/**
 * 流程设计器 — Mock
 */
import type { WorkflowDefinition, WorkflowForm, WorkflowListResult } from './types'

const workflows: WorkflowDefinition[] = [
  {
    id: '1',
    name: '折扣审批流程',
    code: 'DISCOUNT_APPROVAL',
    module: 'APPROVAL',
    version: 1,
    status: 'ACTIVE',
    nodes: [
      { id: 'n1', name: '直属上级审批', type: 'approval' },
      { id: 'n2', name: '销售总监审批', type: 'approval' },
    ],
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: '2',
    name: '样品出库流程',
    code: 'SAMPLE_OUTBOUND',
    module: 'APPROVAL',
    version: 1,
    status: 'ACTIVE',
    nodes: [
      { id: 'n1', name: '申请人提交', type: 'start' },
      { id: 'n2', name: '合规负责人审批', type: 'approval' },
    ],
    createdAt: '2026-07-21T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    id: '3',
    name: '客户合同审批',
    code: 'CONTRACT_APPROVAL',
    module: 'APPROVAL',
    version: 2,
    status: 'ACTIVE',
    nodes: [
      { id: 'n1', name: '法务审核', type: 'approval' },
      { id: 'n2', name: '财务审核', type: 'approval' },
      { id: 'n3', name: '总经理审批', type: 'approval' },
    ],
    createdAt: '2026-07-22T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  },
]

export function generateWorkflowList(params?: {
  module?: string
  keyword?: string
}): WorkflowListResult {
  let list = [...workflows]
  if (params?.module) {
    list = list.filter((w) => w.module === params.module)
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (w) => w.name.toLowerCase().includes(kw) || w.code.toLowerCase().includes(kw),
    )
  }
  return { list, total: list.length }
}

export function createWorkflowInMock(data: Partial<WorkflowForm>): WorkflowDefinition {
  const item: WorkflowDefinition = {
    id: String(workflows.length + 1),
    name: data.name || '未命名流程',
    code: data.code || '',
    module: data.module || 'APPROVAL',
    version: 1,
    status: data.status || 'DRAFT',
    nodes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  workflows.unshift(item)
  return item
}

export function updateWorkflowInMock(
  id: string,
  data: Partial<WorkflowForm>,
): WorkflowDefinition | null {
  const idx = workflows.findIndex((w) => w.id === id)
  if (idx === -1) return null
  workflows[idx] = {
    ...workflows[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  } as WorkflowDefinition
  return workflows[idx]
}

export function deleteWorkflowFromMock(id: string): boolean {
  const idx = workflows.findIndex((w) => w.id === id)
  if (idx === -1) return false
  workflows.splice(idx, 1)
  return true
}
