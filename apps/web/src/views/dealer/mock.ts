/**
 * 经销商协同 — Mock
 */
import type { Dealer, DealerForm, DealerListResult, DealerListParams, DealerStats } from './types'

export let allDealers: Dealer[] = [
  {
    dealerId: 'd1',
    dealerName: '云南康达医疗器械有限公司',
    dealerCode: 'YNKD',
    regionName: '云南省',
    level: 'CORE',
    contactName: '张强',
    contactPhone: '13800138001',
    authorizedStartDate: '2025-01-01',
    authorizedEndDate: '2027-12-31',
    inventoryCount: 156,
    orderCount: 48,
    status: 'ACTIVE',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    dealerId: 'd2',
    dealerName: '昆明瑞康医疗设备有限公司',
    dealerCode: 'KMRK',
    regionName: '昆明市',
    level: 'AUTHORIZED',
    contactName: '李丽',
    contactPhone: '13900139002',
    authorizedStartDate: '2025-06-01',
    authorizedEndDate: '2026-08-31',
    inventoryCount: 78,
    orderCount: 23,
    status: 'ACTIVE',
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    dealerId: 'd3',
    dealerName: '曲靖恒远医疗器械有限公司',
    dealerCode: 'QJHY',
    regionName: '曲靖市',
    level: 'GENERAL',
    contactName: '王勇',
    contactPhone: '13700137003',
    authorizedStartDate: '2025-03-01',
    authorizedEndDate: '2026-05-31',
    inventoryCount: 32,
    orderCount: 12,
    status: 'EXPIRED',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z',
  },
]

export function generateDealerList(params?: DealerListParams): DealerListResult {
  let list = [...allDealers]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (d) =>
        d.dealerName.toLowerCase().includes(kw) ||
        d.dealerCode.toLowerCase().includes(kw) ||
        d.regionName.toLowerCase().includes(kw),
    )
  }
  if (params?.status) {
    list = list.filter((d) => d.status === params.status)
  }
  if (params?.level) {
    list = list.filter((d) => d.level === params.level)
  }
  return { list, total: list.length }
}

export function generateDealerStats(): DealerStats {
  return {
    totalCount: allDealers.length,
    coreCount: allDealers.filter((d) => d.level === 'CORE').length,
    authorizedCount: allDealers.filter((d) => d.level === 'AUTHORIZED').length,
    expiredCount: allDealers.filter((d) => d.status === 'EXPIRED').length,
  }
}

export function createDealerInMock(data: Partial<DealerForm>): Dealer {
  const item: Dealer = {
    dealerId: `d${Date.now()}`,
    dealerName: data.dealerName || '未命名经销商',
    dealerCode: data.dealerCode || '',
    regionName: data.regionName || '',
    level: data.level || 'GENERAL',
    contactName: data.contactName || '',
    contactPhone: data.contactPhone || '',
    authorizedStartDate: data.authorizedStartDate || new Date().toISOString().slice(0, 10),
    authorizedEndDate: data.authorizedEndDate || new Date().toISOString().slice(0, 10),
    inventoryCount: 0,
    orderCount: 0,
    status: data.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  allDealers.unshift(item)
  return item
}

export function updateDealerInMock(id: string, data: Partial<DealerForm>): Dealer | null {
  const idx = allDealers.findIndex((d) => d.dealerId === id)
  if (idx === -1) return null
  allDealers[idx] = { ...allDealers[idx], ...data, updatedAt: new Date().toISOString() } as Dealer
  return allDealers[idx]
}

export function deleteDealerFromMock(id: string): boolean {
  const idx = allDealers.findIndex((d) => d.dealerId === id)
  if (idx === -1) return false
  allDealers.splice(idx, 1)
  return true
}
