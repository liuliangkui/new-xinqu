/**
 * 设备管理 — Mock
 */
import type { Equipment, EquipmentForm, EquipmentListResult, EquipmentStats } from './types'
import { EquipmentStatus } from './types'

const customers = [
  '昆明市一院',
  '云南省一院',
  '大理州医院',
  '曲靖市一院',
  '玉溪市医院',
  '楚雄州医院',
]
const products = ['XN-550 生化分析仪', 'XQ-MRI 1.5T', 'XQ-ECG Pro', 'XT-100 试剂套装']
const statuses = Object.values(EquipmentStatus)

function makeEquipment(id: number): Equipment {
  const status = statuses[id % statuses.length]!
  return {
    equipmentId: id,
    equipmentCode: `EQ${String(id).padStart(6, '0')}`,
    equipmentName: products[id % products.length]!,
    customerName: customers[id % customers.length]!,
    productLine: products[id % products.length]!,
    serialNo: `SN${String(id).padStart(8, '0')}`,
    installDate: new Date(2024, 0, 1 + (id % 365)).toISOString().slice(0, 10),
    warrantyExpire: new Date(2027, 0, 1 + (id % 365)).toISOString().slice(0, 10),
    status,
    ownerName: id % 3 === 0 ? '张三' : '李四',
    createTime: new Date(2024, 0, 1 + id).toISOString(),
    updateTime: new Date(2026, 6, 28 - (id % 20)).toISOString(),
  }
}

export const allEquipments = Array.from({ length: 28 }, (_, i) => makeEquipment(i + 1))

function filterEquipments(params: {
  keyword?: string
  status?: string
  tabType?: string
}): Equipment[] {
  let filtered = [...allEquipments]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.equipmentName.toLowerCase().includes(kw) ||
        e.equipmentCode.toLowerCase().includes(kw) ||
        (e.serialNo && e.serialNo.toLowerCase().includes(kw)),
    )
  }
  if (params.status) filtered = filtered.filter((e) => e.status === params.status)
  if (params.tabType === 'my') filtered = filtered.filter((e) => e.ownerName === '张三')
  if (params.tabType === 'running')
    filtered = filtered.filter((e) => e.status === EquipmentStatus.RUNNING)
  if (params.tabType === 'maintaining')
    filtered = filtered.filter((e) => e.status === EquipmentStatus.MAINTAINING)
  if (params.tabType === 'expiring') {
    const near = new Date()
    near.setMonth(near.getMonth() + 3)
    filtered = filtered.filter((e) => e.warrantyExpire && new Date(e.warrantyExpire) <= near)
  }
  return filtered
}

function buildStats(filtered: Equipment[]): EquipmentStats {
  return {
    totalCount: filtered.length,
    runningCount: filtered.filter((e) => e.status === EquipmentStatus.RUNNING).length,
    maintainingCount: filtered.filter((e) => e.status === EquipmentStatus.MAINTAINING).length,
    scrappedCount: filtered.filter((e) => e.status === EquipmentStatus.SCRAPPED).length,
  }
}

export function generateEquipmentList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  tabType?: string
}): EquipmentListResult {
  const filtered = filterEquipments(params)
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

function nextEquipmentId(): number {
  return allEquipments.length > 0 ? Math.max(...allEquipments.map((e) => e.equipmentId)) + 1 : 1
}

export function createEquipmentInMock(data: Partial<EquipmentForm>): Equipment {
  const now = new Date().toISOString()
  const id = nextEquipmentId()
  const equipment: Equipment = {
    equipmentId: id,
    equipmentCode: data.equipmentCode || `EQ${String(id).padStart(6, '0')}`,
    equipmentName: data.equipmentName || '新建设备',
    customerName: data.customerName,
    productLine: data.productLine,
    serialNo: data.serialNo,
    installDate: data.installDate,
    warrantyExpire: data.warrantyExpire,
    status: data.status ?? EquipmentStatus.RUNNING,
    ownerName: data.ownerName || '张三',
    createTime: now,
    updateTime: now,
  }
  allEquipments.unshift(equipment)
  return equipment
}

export function updateEquipmentInMock(
  equipmentId: number,
  data: Partial<EquipmentForm>,
): Equipment | null {
  const idx = allEquipments.findIndex((e) => e.equipmentId === equipmentId)
  if (idx === -1) return null
  const existing = allEquipments[idx]!
  const updated: Equipment = {
    ...existing,
    ...data,
    equipmentId: existing.equipmentId,
    equipmentCode: existing.equipmentCode,
    createTime: existing.createTime,
    updateTime: new Date().toISOString(),
  }
  allEquipments[idx] = updated
  return updated
}

export function deleteEquipmentFromMock(equipmentId: number): boolean {
  const idx = allEquipments.findIndex((e) => e.equipmentId === equipmentId)
  if (idx === -1) return false
  allEquipments.splice(idx, 1)
  return true
}

export function mockGetEquipmentList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  tabType?: string
}): Promise<EquipmentListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateEquipmentList(params))
    }, 300)
  })
}
