/**
 * 意向管理 — Mock
 */
import type { Intention, IntentionForm, IntentionListResult, IntentionStats } from './types'
import { BusinessType, IntentionStatus } from './types'

const customers = ['昆明市一院', '云南省一院', '大理州医院', '曲靖市一院', '玉溪市医院']
const products = ['XN-550 生化分析仪', 'XQ-MRI 1.5T', 'XQ-ECG Pro', 'XT-100 试剂套装']
const statuses = Object.values(IntentionStatus)
const types = Object.values(BusinessType).filter((v) => typeof v === 'number') as number[]

function makeIntention(id: number): Intention {
  return {
    intentionId: id,
    intentionCode: `INT${String(id).padStart(6, '0')}`,
    customerName: customers[id % customers.length]!,
    projectName: `${customers[id % customers.length]!} ${products[(id * 3) % products.length]!}采购项目`,
    businessType: types[id % types.length]!,
    status: statuses[id % statuses.length]!,
    amount: 50000 + ((id * 37000) % 900000),
    productLine: products[(id * 3) % products.length]!,
    ownerName: id % 3 === 0 ? '张三' : '李四',
    createTime: new Date(2026, 5, 1 + id).toISOString(),
    updateTime: new Date(2026, 6, 28 - (id % 20)).toISOString(),
    approvalLog:
      id % 2 === 0
        ? [
            {
              time: '2026-07-15 09:30',
              operator: '王经理',
              action: '初审通过',
              comment: '项目信息完整，予以通过',
            },
          ]
        : undefined,
  }
}

export const allIntentions = Array.from({ length: 25 }, (_, i) => makeIntention(i + 1))

function filterIntentions(params: {
  keyword?: string
  businessType?: number
  status?: string
  tabType?: string
}): Intention[] {
  let filtered = [...allIntentions]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (i) => i.customerName.toLowerCase().includes(kw) || i.projectName.toLowerCase().includes(kw),
    )
  }
  if (params.businessType) filtered = filtered.filter((i) => i.businessType === params.businessType)
  if (params.status) filtered = filtered.filter((i) => i.status === params.status)
  if (params.tabType === 'my') filtered = filtered.filter((i) => i.ownerName === '张三')
  if (params.tabType === 'draft')
    filtered = filtered.filter((i) => i.status === IntentionStatus.DRAFT)
  if (params.tabType === 'approving')
    filtered = filtered.filter((i) => i.status === IntentionStatus.APPROVING)
  if (params.tabType === 'effective')
    filtered = filtered.filter((i) => i.status === IntentionStatus.EFFECTIVE)
  return filtered
}

function buildStats(filtered: Intention[]): IntentionStats {
  return {
    totalCount: filtered.length,
    draftCount: filtered.filter((i) => i.status === IntentionStatus.DRAFT).length,
    approvingCount: filtered.filter((i) => i.status === IntentionStatus.APPROVING).length,
    effectiveCount: filtered.filter((i) => i.status === IntentionStatus.EFFECTIVE).length,
    rejectedCount: filtered.filter((i) => i.status === IntentionStatus.REJECTED).length,
    closedCount: filtered.filter((i) => i.status === IntentionStatus.CLOSED).length,
  }
}

/** 同步生成分页结果（供 MSW 使用） */
export function generateIntentionList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  businessType?: number
  status?: string
  tabType?: string
}): IntentionListResult {
  const filtered = filterIntentions(params)
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

function nextIntentionId(): number {
  return allIntentions.length > 0 ? Math.max(...allIntentions.map((i) => i.intentionId)) + 1 : 1
}

/** 同步创建意向（供 MSW 使用） */
export function createIntentionInMock(data: Partial<IntentionForm>): Intention {
  const now = new Date().toISOString()
  const id = nextIntentionId()
  const intention: Intention = {
    intentionId: id,
    intentionCode: `INT${String(id).padStart(6, '0')}`,
    customerName: data.customerName || '新建意向客户',
    projectName: data.projectName || '新建项目',
    businessType: data.businessType ?? BusinessType.NON_BID,
    status: data.status ?? IntentionStatus.DRAFT,
    amount: data.amount,
    productLine: data.productLine || '未分类',
    ownerName: data.ownerName || '张三',
    createTime: now,
    updateTime: now,
  }
  allIntentions.unshift(intention)
  return intention
}

/** 同步更新意向（供 MSW 使用） */
export function updateIntentionInMock(
  intentionId: number,
  data: Partial<IntentionForm>,
): Intention | null {
  const idx = allIntentions.findIndex((i) => i.intentionId === intentionId)
  if (idx === -1) return null
  const existing = allIntentions[idx]!
  const updated: Intention = {
    ...existing,
    ...data,
    intentionId: existing.intentionId,
    intentionCode: existing.intentionCode,
    createTime: existing.createTime,
    updateTime: new Date().toISOString(),
  }
  allIntentions[idx] = updated
  return updated
}

/** 同步删除意向（供 MSW 使用） */
export function deleteIntentionFromMock(intentionId: number): boolean {
  const idx = allIntentions.findIndex((i) => i.intentionId === intentionId)
  if (idx === -1) return false
  allIntentions.splice(idx, 1)
  return true
}

export function mockGetIntentionList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  businessType?: number
  status?: string
  tabType?: string
}): Promise<IntentionListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateIntentionList(params))
    }, 300)
  })
}
