/**
 * 合规风控 — Mock
 */
import type {
  ComplianceRecord,
  ComplianceForm,
  ComplianceListResult,
  ComplianceListParams,
  ComplianceStats,
} from './types'

const evidenceNames = ['资质审查', '价格审批', '合同备案', '样品登记', '返利协议']

function createEvidences(uploadedCount = 5): ComplianceRecord['evidences'] {
  return evidenceNames.map((name, idx) => ({
    evidenceId: `e${idx + 1}`,
    evidenceName: name,
    required: true,
    uploaded: idx < uploadedCount,
  }))
}

export let allComplianceRecords: ComplianceRecord[] = [
  {
    recordId: 'c1',
    recordCode: 'COMP-20260728-001',
    title: 'XN-550 采购合规审查',
    type: 'CONTRACT',
    customerName: '昆明市第一人民医院',
    amount: 1200000,
    evidenceCount: 5,
    requiredCount: 5,
    passedCount: 5,
    status: 'PASS',
    riskTips: '',
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
    evidences: createEvidences(5),
  },
  {
    recordId: 'c2',
    recordCode: 'COMP-20260729-002',
    title: '区域代理返利合规审查',
    type: 'REBATE',
    customerName: '云南康达医疗器械有限公司',
    amount: 850000,
    evidenceCount: 5,
    requiredCount: 5,
    passedCount: 3,
    status: 'RISK',
    riskTips: '缺少返利协议与价格审批',
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
    evidences: createEvidences(3),
  },
  {
    recordId: 'c3',
    recordCode: 'COMP-20260730-003',
    title: '生化试剂招标合规审查',
    type: 'BID',
    customerName: '曲靖市第二人民医院',
    amount: 560000,
    evidenceCount: 5,
    requiredCount: 5,
    passedCount: 2,
    status: 'PENDING',
    riskTips: '待补充资质审查与合同备案',
    createdAt: '2026-07-30T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
    evidences: createEvidences(2),
  },
]

export function generateComplianceList(params?: ComplianceListParams): ComplianceListResult {
  let list = [...allComplianceRecords]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(kw) ||
        c.recordCode.toLowerCase().includes(kw) ||
        c.customerName.toLowerCase().includes(kw),
    )
  }
  if (params?.status) {
    list = list.filter((c) => c.status === params.status)
  }
  if (params?.type) {
    list = list.filter((c) => c.type === params.type)
  }
  return { list, total: list.length }
}

export function generateComplianceStats(): ComplianceStats {
  return {
    totalCount: allComplianceRecords.length,
    passCount: allComplianceRecords.filter((c) => c.status === 'PASS').length,
    failCount: allComplianceRecords.filter((c) => c.status === 'FAIL').length,
    pendingCount: allComplianceRecords.filter((c) => c.status === 'PENDING').length,
    riskCount: allComplianceRecords.filter((c) => c.status === 'RISK').length,
  }
}

export function createComplianceInMock(data: Partial<ComplianceForm>): ComplianceRecord {
  const item: ComplianceRecord = {
    recordId: `c${Date.now()}`,
    recordCode: `COMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(allComplianceRecords.length + 1).padStart(3, '0')}`,
    title: data.title || '未命名审查',
    type: data.type || 'CONTRACT',
    customerName: data.customerName || '',
    amount: data.amount ?? 0,
    evidenceCount: 5,
    requiredCount: 5,
    passedCount: 0,
    status: 'PENDING',
    riskTips: '待补充合规证据链',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evidences: createEvidences(0),
  }
  allComplianceRecords.unshift(item)
  return item
}

export function updateComplianceInMock(
  id: string,
  data: Partial<ComplianceForm>,
): ComplianceRecord | null {
  const idx = allComplianceRecords.findIndex((c) => c.recordId === id)
  if (idx === -1) return null
  allComplianceRecords[idx] = {
    ...allComplianceRecords[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  } as ComplianceRecord
  return allComplianceRecords[idx]
}

export function deleteComplianceFromMock(id: string): boolean {
  const idx = allComplianceRecords.findIndex((c) => c.recordId === id)
  if (idx === -1) return false
  allComplianceRecords.splice(idx, 1)
  return true
}
