/**
 * 设备管理 — API 层
 * 对接后端 /equipment REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { Equipment, EquipmentForm, EquipmentListParams, EquipmentListResult } from './types'

const BASE = '/equipment'

/** 获取设备列表 */
export function getEquipmentList(params: EquipmentListParams): Promise<EquipmentListResult> {
  return get<EquipmentListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    status: params.status,
    tabType: params.tabType,
  })
}

/** 获取设备详情 */
export function getEquipmentDetail(equipmentId: string | number): Promise<Equipment> {
  return get<Equipment>(`${BASE}/${equipmentId}`)
}

/** 创建设备 */
export function createEquipment(data: EquipmentForm): Promise<Equipment> {
  return post<Equipment>(BASE, data)
}

/** 更新设备 */
export function updateEquipment(
  equipmentId: string | number,
  data: Partial<EquipmentForm>,
): Promise<Equipment> {
  return put<Equipment>(`${BASE}/${equipmentId}`, data)
}

/** 删除设备 */
export function deleteEquipment(equipmentId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${equipmentId}`)
}
