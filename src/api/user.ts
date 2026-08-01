import { get, post, put, del, getPage } from './request'
import type { PageParams, PageResult } from '@/types/common'

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

export function getUserList(params?: PageParams & { keyword?: string }) {
  return getPage<UserItem>('/users', params)
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
