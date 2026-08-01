/**
 * 线索管理 — API 层
 * 对接后端 /leads REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { Lead, LeadForm, LeadListParams, LeadListResult } from './types'

const BASE = '/leads'

/** 获取线索列表 */
export function getLeadList(params: LeadListParams): Promise<LeadListResult> {
  return get<LeadListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    sourceType: params.sourceType,
    status: params.status,
    tabType: params.tabType,
  })
}

/** 获取线索详情 */
export function getLeadDetail(leadId: string | number): Promise<Lead> {
  return get<Lead>(`${BASE}/${leadId}`)
}

/** 新建线索 */
export function createLead(data: LeadForm): Promise<Lead> {
  return post<Lead>(BASE, data)
}

/** 更新线索 */
export function updateLead(leadId: string | number, data: Partial<LeadForm>): Promise<Lead> {
  return put<Lead>(`${BASE}/${leadId}`, data)
}

/** 删除线索 */
export function deleteLead(leadId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${leadId}`)
}
