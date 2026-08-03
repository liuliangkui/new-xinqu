import { get, post, put, del, getPage } from './request'
import type { PageParams } from '@/types/common'

export interface UserItem {
  id: string
  username: string
  name: string
  phone?: string
  email?: string
  departmentId?: string
  roleIds: string[]
  status: string
  lastLoginAt?: string
  createdAt: string
}

export interface UserForm {
  username: string
  password: string
  name: string
  phone?: string
  email?: string
  departmentId?: string
  roleIds?: string[]
  status?: string
}

export function getUserList(
  params?: PageParams & { pageSize?: number; keyword?: string; departmentId?: string; status?: string },
) {
  return getPage<UserItem>('/users', params)
}

export interface DepartmentItem {
  id: string
  name: string
  parentId?: string | null
  path?: string
  sortOrder?: number
}

export interface RoleItem {
  id: string
  name: string
  code: string
}

export function getDepartmentList() {
  return get<{ list: DepartmentItem[] }>('/users/departments')
}

export function getRoleList() {
  return get<{ list: RoleItem[] }>('/users/roles')
}

export function getUserDetail(id: string) {
  return get<UserItem>(`/users/${id}`)
}

export function createUser(data: UserForm) {
  return post<UserItem>('/users', data)
}

export function updateUser(id: string, data: Partial<UserForm>) {
  return put<UserItem>(`/users/${id}`, data)
}

export function deleteUser(id: string) {
  return del<unknown>(`/users/${id}`)
}
