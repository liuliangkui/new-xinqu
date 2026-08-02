/**
 * 合规风控 — 类型定义
 */

export type ComplianceStatus = 'PASS' | 'FAIL' | 'PENDING' | 'RISK'
export type ComplianceType = 'CONTRACT' | 'BID' | 'SAMPLE' | 'REBATE' | 'PRICE'

export interface ComplianceEvidence {
  evidenceId: string
  evidenceName: string
  required: boolean
  uploaded: boolean
  fileUrl?: string
}

export interface ComplianceRecord {
  recordId: string
  recordCode: string
  title: string
  type: ComplianceType
  customerName: string
  amount: number
  evidenceCount: number
  requiredCount: number
  passedCount: number
  status: ComplianceStatus
  riskTips?: string
  createdAt: string
  updatedAt: string
  evidences: ComplianceEvidence[]
}

export interface ComplianceForm {
  recordId?: string
  title: string
  type: ComplianceType
  customerName: string
  amount: number
}

export interface ComplianceListResult {
  list: ComplianceRecord[]
  total: number
}

export interface ComplianceStats {
  totalCount: number
  passCount: number
  failCount: number
  pendingCount: number
  riskCount: number
}

export interface ComplianceListParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: string
  type?: string
  [key: string]: unknown
}
