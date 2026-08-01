/**
 * 线索管理 — Mock
 */
import type { Lead, LeadListResult, LeadStats } from './types'
import { LeadSource, LeadStatus } from './types'

function makeLead(id: number): Lead {
  const names = ['昆明市一院', '云南省一院', '大理州医院', '曲靖市一院', '玉溪市医院', '楚雄州医院']
  const products = ['XN-550 生化', 'XQ-MRI', 'XQ-ECG Pro', 'XT-100 试剂', 'XQ-CT']
  const sources = Object.values(LeadSource).filter((v) => typeof v === 'number') as number[]
  const statuses: LeadStatus[] = [LeadStatus.PENDING, LeadStatus.FOLLOWING, LeadStatus.CONVERTED, LeadStatus.FOLLOWING, LeadStatus.PENDING]

  return {
    leadId: id,
    leadCode: `LD${String(id).padStart(6, '0')}`,
    customerName: names[id % names.length]!,
    department: ['检验科', '影像科', '心内科', '急诊科'][id % 4]!,
    productLine: products[id % products.length]!,
    leadSummary: id % 3 === 0 ? '院方计划更新生化设备，预算已批复' : '客户对现有设备不满意，有更换意向',
    sourceType: sources[id % sources.length]!,
    status: statuses[id % statuses.length]!,
    amount: id % 4 !== 0 ? 50000 + ((id * 17000) % 500000) : undefined,
    decisionDate: new Date(2026, 8 + (id % 3), 1 + (id % 28)).toISOString().slice(0, 10),
    assigneeId: 1,
    assigneeName: id % 3 === 0 ? undefined : '张三',
    followDeadline: new Date(2026, 7, 5 + (id % 25)).toISOString().slice(0, 10),
    creatorName: id % 2 === 0 ? '张三' : '李四',
    createTime: new Date(2026, 6, 28 - id).toISOString(),
    updateTime: new Date(2026, 6, 28 - (id % 10)).toISOString(),
    remark: id % 5 === 0 ? '重点线索，需加强跟进' : undefined,
    followRecords:
      id % 2 === 0
        ? [
            { id: 1, followType: '电话', content: '了解客户需求和预算情况', nextPlan: '安排拜访', creatorName: '张三', createTime: '2026-07-20' },
            { id: 2, followType: '拜访', content: '讨论设备方案和商务条款', nextPlan: '准备报价', creatorName: '张三', createTime: '2026-07-25' },
          ]
        : undefined,
  }
}

const allLeads = Array.from({ length: 30 }, (_, i) => makeLead(i + 1))

export function mockGetLeadList(params: {
  pageNum: number; pageSize: number; keyword?: string; sourceType?: number; status?: string; tabType?: string
}): Promise<LeadListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...allLeads]
      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        filtered = filtered.filter((l) => l.customerName.toLowerCase().includes(kw) || l.leadSummary.toLowerCase().includes(kw))
      }
      if (params.sourceType) filtered = filtered.filter((l) => l.sourceType === params.sourceType)
      if (params.status) filtered = filtered.filter((l) => l.status === params.status)
      if (params.tabType === 'my') filtered = filtered.filter((l) => l.assigneeName === '张三')
      if (params.tabType === 'pool') filtered = filtered.filter((l) => l.status === LeadStatus.PENDING)
      if (params.tabType === 'team') filtered = filtered.filter((l) => l.creatorName === '张三' || l.assigneeName === '张三')

      const total = filtered.length
      const start = (params.pageNum - 1) * params.pageSize
      const list = filtered.slice(start, start + params.pageSize)
      const stats: LeadStats = {
        monthNewCount: total,
        pendingCount: filtered.filter((l) => l.status === LeadStatus.PENDING).length,
        followingCount: filtered.filter((l) => l.status === LeadStatus.FOLLOWING).length,
        conversionRate: filtered.length ? Math.round((filtered.filter((l) => l.status === LeadStatus.CONVERTED).length / filtered.length) * 100) : 0,
      }
      resolve({ list, total, pageNum: params.pageNum, pageSize: params.pageSize, stats })
    }, 300)
  })
}
