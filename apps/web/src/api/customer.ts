import { get, post, put, del, getPage } from './request'
import type { PageParams } from '@/types/common'

export interface CustomerItem {
  id: string
  name: string
  type: string
  hospitalLevel?: string
  level: string
  healthScore?: number
  region: string
  address?: Record<string, unknown>
  ownerId: string
  status: string
  tags: string[]
  source?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerForm {
  name: string
  type: string
  hospitalLevel?: string
  level?: string
  healthScore?: number
  region: string
  address?: Record<string, unknown>
  ownerId: string
  status?: string
  tags?: string[]
  source?: string
}

export function getCustomerList(params?: PageParams & { keyword?: string; status?: string; level?: string }) {
  return getPage<CustomerItem>('/customers', params)
}

export function getCustomerDetail(id: string) {
  return get<CustomerItem>(`/customers/${id}`)
}

export function createCustomer(data: CustomerForm) {
  return post<CustomerItem>('/customers', data)
}

export function updateCustomer(id: string, data: Partial<CustomerForm>) {
  return put<CustomerItem>(`/customers/${id}`, data)
}

export function deleteCustomer(id: string) {
  return del<unknown>(`/customers/${id}`)
}
