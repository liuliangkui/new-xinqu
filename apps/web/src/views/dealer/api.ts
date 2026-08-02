/**
 * 经销商协同 — API 层
 */
import { get, post, put, del } from '@/api/request'
import type { Dealer, DealerForm, DealerListResult, DealerListParams, DealerStats } from './types'

const BASE = '/dealers'

/** 获取经销商列表 */
export function getDealerList(params?: DealerListParams): Promise<DealerListResult> {
  return get<DealerListResult>(BASE, params)
}

/** 获取经销商统计 */
export function getDealerStats(): Promise<DealerStats> {
  return get<DealerStats>(`${BASE}/stats`)
}

/** 保存经销商 */
export function saveDealer(data: DealerForm): Promise<Dealer> {
  return data.dealerId ? put<Dealer>(`${BASE}/${data.dealerId}`, data) : post<Dealer>(BASE, data)
}

/** 删除经销商 */
export function deleteDealer(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${id}`)
}
