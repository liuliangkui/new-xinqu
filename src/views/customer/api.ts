/**
 * 客户 360° 模块 — API 层
 */
import { get, post } from '@/api/request'
import type {
  Customer,
  CustomerDetail,
  CustomerListParams,
  CustomerListResult,
  Department,
  DecisionContact,
  CustomerEquipment,
  CustomerReagent,
  TimelineItem,
} from './types'

const BASE = '/customers'

/** 获取客户列表 */
export function getCustomerList(params: CustomerListParams): Promise<CustomerListResult> {
  return post<CustomerListResult>(`${BASE}/list`, params)
}

/** 获取客户详情 */
export function getCustomerDetail(customerId: number): Promise<CustomerDetail> {
  return get<CustomerDetail>(`${BASE}/${customerId}`)
}

/** 新建客户 */
export function createCustomer(
  data: Partial<Customer>,
): Promise<{ customerId: number; customerCode: string }> {
  return post<{ customerId: number; customerCode: string }>(BASE, data)
}
