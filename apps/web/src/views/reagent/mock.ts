/**
 * 试剂运营 — Mock
 */
import type {
  Reagent,
  ReagentForm,
  ReagentListResult,
  ReagentListParams,
  ReagentStats,
} from './types'

export const allReagents: Reagent[] = [
  {
    reagentId: 'r1',
    reagentName: '血常规试剂 A',
    reagentCode: 'XN-550-A',
    brandName: '希森美康',
    category: '血球试剂',
    specification: '500T/盒',
    unit: '盒',
    price: 1200,
    stock: 320,
    safetyStock: 100,
    status: 'ACTIVE',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    reagentId: 'r2',
    reagentName: '生化试剂 B',
    reagentCode: 'BS-2800-B',
    brandName: '迈瑞',
    category: '生化试剂',
    specification: '1000T/盒',
    unit: '盒',
    price: 2800,
    stock: 85,
    safetyStock: 120,
    status: 'ACTIVE',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    reagentId: 'r3',
    reagentName: '免疫试剂 C',
    reagentCode: 'CL-8000-C',
    brandName: '迈瑞',
    category: '免疫试剂',
    specification: '200T/盒',
    unit: '盒',
    price: 5600,
    stock: 45,
    safetyStock: 50,
    status: 'ACTIVE',
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  },
  {
    reagentId: 'r4',
    reagentName: '凝血试剂 D',
    reagentCode: 'CS-130-D',
    brandName: '思塔高',
    category: '凝血试剂',
    specification: '100T/盒',
    unit: '盒',
    price: 1800,
    stock: 12,
    safetyStock: 30,
    status: 'DISCONTINUED',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z',
  },
]

export function generateReagentList(params?: ReagentListParams): ReagentListResult {
  let list = [...allReagents]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (r) =>
        r.reagentName.toLowerCase().includes(kw) ||
        r.reagentCode.toLowerCase().includes(kw) ||
        r.brandName.toLowerCase().includes(kw),
    )
  }
  if (params?.status) {
    list = list.filter((r) => r.status === params.status)
  }
  if (params?.category) {
    list = list.filter((r) => r.category === params.category)
  }
  return { list, total: list.length }
}

export function generateReagentStats(): ReagentStats {
  return {
    totalCount: allReagents.length,
    activeCount: allReagents.filter((r) => r.status === 'ACTIVE').length,
    lowStockCount: allReagents.filter((r) => r.status === 'ACTIVE' && r.stock < r.safetyStock)
      .length,
    discontinuedCount: allReagents.filter((r) => r.status === 'DISCONTINUED').length,
  }
}

export function createReagentInMock(data: Partial<ReagentForm>): Reagent {
  const item: Reagent = {
    reagentId: `r${Date.now()}`,
    reagentName: data.reagentName || '未命名试剂',
    reagentCode: data.reagentCode || '',
    brandName: data.brandName || '',
    category: data.category || '其他',
    specification: data.specification || '',
    unit: data.unit || '盒',
    price: data.price ?? 0,
    stock: data.stock ?? 0,
    safetyStock: data.safetyStock ?? 0,
    status: data.status || 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  allReagents.unshift(item)
  return item
}

export function updateReagentInMock(id: string, data: Partial<ReagentForm>): Reagent | null {
  const idx = allReagents.findIndex((r) => r.reagentId === id)
  if (idx === -1) return null
  allReagents[idx] = {
    ...allReagents[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  } as Reagent
  return allReagents[idx]
}

export function deleteReagentFromMock(id: string): boolean {
  const idx = allReagents.findIndex((r) => r.reagentId === id)
  if (idx === -1) return false
  allReagents.splice(idx, 1)
  return true
}
