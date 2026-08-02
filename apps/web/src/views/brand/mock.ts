/**
 * 品牌库管理 — Mock
 */
import type { Brand, BrandForm, BrandListResult, BrandListParams, BrandStats } from './types'

export let allBrands: Brand[] = [
  {
    brandId: 'b1',
    brandName: '迈瑞',
    brandCode: 'MINDRAY',
    manufacturer: '深圳迈瑞生物医疗电子股份有限公司',
    category: '检验设备',
    productCount: 12,
    status: 'ACTIVE',
    remark: '核心合作品牌',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    brandId: 'b2',
    brandName: '西门子',
    brandCode: 'SIEMENS',
    manufacturer: 'Siemens Healthineers',
    category: '影像设备',
    productCount: 8,
    status: 'ACTIVE',
    remark: '',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    brandId: 'b3',
    brandName: '罗氏',
    brandCode: 'ROCHE',
    manufacturer: 'Roche Diagnostics',
    category: '试剂',
    productCount: 35,
    status: 'ACTIVE',
    remark: '试剂主力品牌',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
  },
  {
    brandId: 'b4',
    brandName: '贝克曼',
    brandCode: 'BECKMAN',
    manufacturer: 'Beckman Coulter',
    category: '检验设备',
    productCount: 6,
    status: 'INACTIVE',
    remark: '已暂停合作',
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z',
  },
]

export function generateBrandList(params?: BrandListParams): BrandListResult {
  let list = [...allBrands]
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (b) =>
        b.brandName.toLowerCase().includes(kw) ||
        b.brandCode.toLowerCase().includes(kw) ||
        b.manufacturer.toLowerCase().includes(kw),
    )
  }
  if (params?.status) {
    list = list.filter((b) => b.status === params.status)
  }
  if (params?.category) {
    list = list.filter((b) => b.category === params.category)
  }
  return { list, total: list.length }
}

export function generateBrandStats(): BrandStats {
  return {
    totalCount: allBrands.length,
    activeCount: allBrands.filter((b) => b.status === 'ACTIVE').length,
    inactiveCount: allBrands.filter((b) => b.status === 'INACTIVE').length,
    productCount: allBrands.reduce((sum, b) => sum + b.productCount, 0),
  }
}

export function createBrandInMock(data: Partial<BrandForm>): Brand {
  const item: Brand = {
    brandId: `b${Date.now()}`,
    brandName: data.brandName || '未命名品牌',
    brandCode: data.brandCode || '',
    manufacturer: data.manufacturer || '',
    category: data.category || '其他',
    productCount: 0,
    status: data.status || 'ACTIVE',
    remark: data.remark,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  allBrands.unshift(item)
  return item
}

export function updateBrandInMock(id: string, data: Partial<BrandForm>): Brand | null {
  const idx = allBrands.findIndex((b) => b.brandId === id)
  if (idx === -1) return null
  allBrands[idx] = { ...allBrands[idx], ...data, updatedAt: new Date().toISOString() } as Brand
  return allBrands[idx]
}

export function deleteBrandFromMock(id: string): boolean {
  const idx = allBrands.findIndex((b) => b.brandId === id)
  if (idx === -1) return false
  allBrands.splice(idx, 1)
  return true
}
