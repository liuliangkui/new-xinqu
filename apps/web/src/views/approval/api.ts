/**
 * 审批中心 — API 层
 * 对接后端 /approvals REST 接口
 */
import { get, post, put, del } from '@/api/request'
import type {
  Approval,
  ApprovalForm,
  ApprovalListParams,
  ApprovalListResult,
  ApprovalTimelineResult,
} from './types'

const BASE = '/approvals'

/** 获取审批列表 */
export function getApprovalList(params: ApprovalListParams): Promise<ApprovalListResult> {
  return get<ApprovalListResult>(BASE, {
    page: params.pageNum,
    pageSize: params.pageSize,
    keyword: params.keyword,
    module: params.module,
    status: params.status,
    tabType: params.tabType,
  })
}

/** 获取审批详情 */
export function getApprovalDetail(approvalId: string): Promise<Approval> {
  return get<Approval>(`${BASE}/${approvalId}`)
}

/** 获取审批时间轴 */
export function getApprovalTimeline(approvalId: string): Promise<ApprovalTimelineResult> {
  return get<ApprovalTimelineResult>(`${BASE}/${approvalId}/timeline`)
}

/** 创建审批 */
export function createApproval(data: ApprovalForm): Promise<Approval> {
  return post<Approval>(BASE, data)
}

/** 更新审批 */
export function updateApproval(approvalId: string, data: Partial<ApprovalForm>): Promise<Approval> {
  return put<Approval>(`${BASE}/${approvalId}`, data)
}

/** 删除审批 */
export function deleteApproval(approvalId: string): Promise<unknown> {
  return del<unknown>(`${BASE}/${approvalId}`)
}

/** 审批通过 */
export function approveApproval(approvalId: string, comment?: string): Promise<Approval> {
  return post<Approval>(`${BASE}/${approvalId}/approve`, { comment })
}

/** 审批驳回 */
export function rejectApproval(
  approvalId: string,
  comment?: string,
  targetNodeIndex?: number,
): Promise<Approval> {
  return post<Approval>(`${BASE}/${approvalId}/reject`, { comment, targetNodeIndex })
}

/** 撤回审批 */
export function withdrawApproval(approvalId: string): Promise<unknown> {
  return post<unknown>(`${BASE}/${approvalId}/withdraw`, {})
}
