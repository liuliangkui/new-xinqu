/**
 * 意向管理 — API 层
 * 对接后端 /intentions REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { Intention, IntentionForm, IntentionListParams, IntentionListResult } from './types'

const BASE = '/intentions'

/** 获取意向列表 */
export function getIntentionList(params: IntentionListParams): Promise<IntentionListResult> {
  return get<IntentionListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    businessType: params.businessType,
    status: params.status,
    tabType: params.tabType,
  })
}

/** 获取意向详情 */
export function getIntentionDetail(intentionId: string | number): Promise<Intention> {
  return get<Intention>(`${BASE}/${intentionId}`)
}

/** 新建意向 */
export function createIntention(data: IntentionForm): Promise<Intention> {
  return post<Intention>(BASE, data)
}

/** 更新意向 */
export function updateIntention(
  intentionId: string | number,
  data: Partial<IntentionForm>,
): Promise<Intention> {
  return put<Intention>(`${BASE}/${intentionId}`, data)
}

/** 删除意向 */
export function deleteIntention(intentionId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${intentionId}`)
}
