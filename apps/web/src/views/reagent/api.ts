/**
 * 试剂运营 — API 层
 */
import { get, post, put, del } from '@/api/request'
import type {
  Reagent,
  ReagentForm,
  ReagentListResult,
  ReagentListParams,
  ReagentStats,
} from './types'

const BASE = '/reagents'

/** 获取试剂列表 */
export function getReagentList(params?: ReagentListParams): Promise<ReagentListResult> {
  return get<ReagentListResult>(BASE, params)
}

/** 获取试剂统计 */
export function getReagentStats(): Promise<ReagentStats> {
  return get<ReagentStats>(`${BASE}/stats`)
}

/** 保存试剂 */
export function saveReagent(data: ReagentForm): Promise<Reagent> {
  return data.reagentId
    ? put<Reagent>(`${BASE}/${data.reagentId}`, data)
    : post<Reagent>(BASE, data)
}

/** 删除试剂 */
export function deleteReagent(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${id}`)
}
