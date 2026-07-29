/**
 * 通讯录模块 — API 层
 * 对应《通讯录功能与交互说明.md》v1.0 第九章接口契约
 */
import { get, post, put, del, patch } from '@/api/request'
import type {
  Contact,
  ContactListParams,
  ContactListResult,
  ContactFormData,
} from './types'
import { API_BASE_URL } from '@/config/constants'

const BASE = '/contacts'

/** 获取联系人列表 */
export function getContactList(params: ContactListParams): Promise<ContactListResult> {
  return post<ContactListResult>(`${BASE}/list`, params)
}

/** 获取联系人详情 */
export function getContactDetail(contactId: number): Promise<Contact> {
  return get<Contact>(`${BASE}/${contactId}`)
}

/** 新建联系人 */
export function createContact(data: ContactFormData): Promise<{ contactId: number; contactCode: string }> {
  return post<{ contactId: number; contactCode: string }>(BASE, data)
}

/** 编辑联系人 */
export function updateContact(
  contactId: number,
  data: Partial<ContactFormData>,
): Promise<{ contactId: number; updateTime: string }> {
  return put<{ contactId: number; updateTime: string }>(`${BASE}/${contactId}`, data)
}

/** 删除联系人 */
export function deleteContact(contactId: number): Promise<{ success: boolean }> {
  return del<{ success: boolean }>(`${BASE}/${contactId}`)
}

/** 停用/启用联系人 */
export function toggleContactStatus(
  contactId: number,
  status: number,
): Promise<{ contactId: number; status: number }> {
  return patch<{ contactId: number; status: number }>(`${BASE}/${contactId}/status`, { status })
}
