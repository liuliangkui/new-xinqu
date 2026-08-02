/**
 * 合规风控 — API 层
 */
import { get, post, put, del } from '@/api/request'
import type {
  ComplianceRecord,
  ComplianceForm,
  ComplianceListResult,
  ComplianceListParams,
  ComplianceStats,
} from './types'

const BASE = '/compliance-records'

/** 获取合规记录列表 */
export function getComplianceList(params?: ComplianceListParams): Promise<ComplianceListResult> {
  return get<ComplianceListResult>(BASE, params)
}

/** 获取合规统计 */
export function getComplianceStats(): Promise<ComplianceStats> {
  return get<ComplianceStats>(`${BASE}/stats`)
}

/** 保存合规记录 */
export function saveCompliance(data: ComplianceForm): Promise<ComplianceRecord> {
  return data.recordId
    ? put<ComplianceRecord>(`${BASE}/${data.recordId}`, data)
    : post<ComplianceRecord>(BASE, data)
}

/** 删除合规记录 */
export function deleteCompliance(id: string): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${id}`)
}
