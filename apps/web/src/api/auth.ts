import { post, get } from './request'

export interface LoginResult {
  accessToken: string
  user: {
    id: string
    username: string
    name: string
  }
}

export interface ProfileResult {
  id: string
  username: string
  name: string
  phone?: string
  email?: string
  departmentId?: string
  roleIds: string[]
  permissions: string[]
}

export function login(username: string, password: string): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', { username, password })
}

export function getProfile(): Promise<ProfileResult> {
  return get<ProfileResult>('/auth/profile')
}
