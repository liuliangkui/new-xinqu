/**
 * 客户 360° 模块 — API 层
 * 对接后端 /customers REST 接口；开发环境由 MSW 拦截并返回完整视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type {
  Customer,
  CustomerDetail,
  CustomerForm,
  CustomerListParams,
  CustomerListResult,
} from './types'

const BASE = '/customers'

/** 获取客户列表 */
export function getCustomerList(params: CustomerListParams): Promise<CustomerListResult> {
  return get<CustomerListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    regionCode: params.regionCode,
    customerLevel: params.customerLevel,
    healthLevel: params.healthLevel,
    status: params.status,
    ownerId: params.ownerId,
    tabType: params.tabType,
  })
}

/** 获取客户详情 */
export function getCustomerDetail(customerId: string | number): Promise<CustomerDetail> {
  return get<CustomerDetail>(`${BASE}/${customerId}`)
}

/** 新建客户 */
export function createCustomer(data: CustomerForm): Promise<Customer> {
  return post<Customer>(BASE, data)
}

/** 更新客户 */
export function updateCustomer(
  customerId: string | number,
  data: Partial<CustomerForm>,
): Promise<Customer> {
  return put<Customer>(`${BASE}/${customerId}`, data)
}

/** 删除客户 */
export function deleteCustomer(customerId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${customerId}`)
}
