/**
 * 设备管理模块 — 类型定义
 */

export enum EquipmentStatus {
  RUNNING = 'running',
  MAINTAINING = 'maintaining',
  SCRAPPED = 'scrapped',
}

export interface Equipment {
  equipmentId: number
  equipmentCode: string
  equipmentName: string
  customerName?: string
  productLine?: string
  serialNo?: string
  installDate?: string
  warrantyExpire?: string
  status: EquipmentStatus
  ownerName?: string
  createTime: string
  updateTime: string
}

export interface EquipmentForm {
  equipmentName: string
  equipmentCode?: string
  customerName?: string
  productLine?: string
  serialNo?: string
  installDate?: string
  warrantyExpire?: string
  status?: EquipmentStatus
  ownerName?: string
}

export interface EquipmentStats {
  totalCount: number
  runningCount: number
  maintainingCount: number
  scrappedCount: number
}

export interface EquipmentListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: string
  tabType?: 'all' | 'my' | 'running' | 'maintaining' | 'expiring'
}

export interface EquipmentListResult {
  list: Equipment[]
  total: number
  pageNum: number
  pageSize: number
  stats: EquipmentStats
}
