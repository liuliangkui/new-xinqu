import { post } from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  accessToken: string
  user: {
    id: string
    username: string
    name: string
  }
}

export function login(params: LoginParams) {
  return post<LoginResult>('/auth/login', params)
}
