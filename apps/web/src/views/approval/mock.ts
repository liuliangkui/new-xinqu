/**
 * 审批中心 — Mock
 */
import type { Approval, ApprovalForm, ApprovalListResult, ApprovalStats } from './types'
import { ApprovalModule, ApprovalStatus, ApprovalPriority } from './types'

const applicants = ['张三', '李四', '王五']
const modules = Object.values(ApprovalModule)
const statuses = Object.values(ApprovalStatus)

function makeApproval(id: number): Approval {
  const status = statuses[id % statuses.length]!
  return {
    approvalId: `apv-${id}`,
    approvalCode: `APV${String(id).padStart(6, '0')}`,
    title: `${['请假申请', '费用报销', '合同审批', '折扣申请', '采购申请', '其他申请'][id % 6]}-${id}`,
    businessKey: `BIZ-${20260000 + id}`,
    module: modules[id % modules.length]!,
    status,
    priority: id % 3 === 0 ? ApprovalPriority.URGENT : ApprovalPriority.NORMAL,
    applicantName: applicants[id % applicants.length]!,
    applicantId: String((id % 3) + 1),
    currentApproverName: id % 2 === 0 ? '张三' : '李四',
    payload: {
      amount: (id + 1) * 1000,
      reason: '业务需要，请审批。',
    },
    tasks: [
      {
        taskId: `task-${id}-1`,
        nodeId: 'node-1',
        assigneeId: '1',
        assigneeName: '张三',
        action: status !== ApprovalStatus.PENDING ? 'approve' : undefined,
        comment: status !== ApprovalStatus.PENDING ? '同意' : undefined,
        createdAt: new Date(2026, 6, 28 - (id % 10)).toISOString(),
        completedAt:
          status !== ApprovalStatus.PENDING ? new Date(2026, 6, 29).toISOString() : undefined,
      },
    ],
    ccRecords:
      id % 2 === 0 ? [{ ccRecordId: `cc-${id}`, userId: '3', userName: '王五' }] : undefined,
    createdAt: new Date(2026, 6, 28 - (id % 20)).toISOString(),
    updatedAt: new Date(2026, 6, 28 - (id % 10)).toISOString(),
    completedAt:
      status !== ApprovalStatus.PENDING ? new Date(2026, 6, 29).toISOString() : undefined,
  }
}

export const allApprovals = Array.from({ length: 24 }, (_, i) => makeApproval(i + 1))

function filterApprovals(params: {
  keyword?: string
  module?: string
  status?: string
  tabType?: string
}): Approval[] {
  let filtered = [...allApprovals]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(kw) ||
        a.approvalCode.toLowerCase().includes(kw) ||
        (a.businessKey && a.businessKey.toLowerCase().includes(kw)),
    )
  }
  if (params.module) filtered = filtered.filter((a) => a.module === params.module)
  if (params.status) filtered = filtered.filter((a) => a.status === params.status)
  if (params.tabType === 'pending')
    filtered = filtered.filter((a) => a.status === ApprovalStatus.PENDING)
  if (params.tabType === 'approved')
    filtered = filtered.filter((a) => a.status === ApprovalStatus.APPROVED)
  if (params.tabType === 'initiated') filtered = filtered.filter((a) => a.applicantName === '张三')
  if (params.tabType === 'cc')
    filtered = filtered.filter((a) => a.ccRecords && a.ccRecords.length > 0)
  return filtered
}

function buildStats(filtered: Approval[]): ApprovalStats {
  return {
    totalCount: filtered.length,
    pendingCount: filtered.filter((a) => a.status === ApprovalStatus.PENDING).length,
    approvedCount: filtered.filter((a) => a.status === ApprovalStatus.APPROVED).length,
    rejectedCount: filtered.filter((a) => a.status === ApprovalStatus.REJECTED).length,
    withdrawnCount: filtered.filter((a) => a.status === ApprovalStatus.WITHDRAWN).length,
  }
}

export function generateApprovalList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  module?: string
  status?: string
  tabType?: string
}): ApprovalListResult {
  const filtered = filterApprovals(params)
  const total = filtered.length
  const start = (params.pageNum - 1) * params.pageSize
  return {
    list: filtered.slice(start, start + params.pageSize),
    total,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    stats: buildStats(filtered),
  }
}

function nextApprovalId(): number {
  return allApprovals.length > 0
    ? Math.max(...allApprovals.map((a) => Number(a.approvalId.split('-')[1]))) + 1
    : 1
}

export function createApprovalInMock(data: Partial<ApprovalForm>): Approval {
  const now = new Date().toISOString()
  const id = nextApprovalId()
  const approval: Approval = {
    approvalId: `apv-${id}`,
    approvalCode: `APV${String(id).padStart(6, '0')}`,
    title: data.title || '新建审批',
    businessKey: data.businessKey,
    module: data.module ?? ApprovalModule.OTHER,
    status: ApprovalStatus.PENDING,
    priority: data.priority ?? ApprovalPriority.NORMAL,
    applicantName: '张三',
    applicantId: '1',
    currentApproverName: '张三',
    payload: data.payload || {},
    tasks: [],
    createdAt: now,
    updatedAt: now,
  }
  allApprovals.unshift(approval)
  return approval
}

export function updateApprovalInMock(
  approvalId: string,
  data: Partial<ApprovalForm>,
): Approval | null {
  const idx = allApprovals.findIndex((a) => a.approvalId === approvalId)
  if (idx === -1) return null
  const existing = allApprovals[idx]!
  const updated: Approval = {
    ...existing,
    ...data,
    approvalId: existing.approvalId,
    approvalCode: existing.approvalCode,
    updatedAt: new Date().toISOString(),
  }
  allApprovals[idx] = updated
  return updated
}

export function deleteApprovalFromMock(approvalId: string): boolean {
  const idx = allApprovals.findIndex((a) => a.approvalId === approvalId)
  if (idx === -1) return false
  allApprovals.splice(idx, 1)
  return true
}

export function mockGetApprovalList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  module?: string
  status?: string
  tabType?: string
}): Promise<ApprovalListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateApprovalList(params))
    }, 300)
  })
}
