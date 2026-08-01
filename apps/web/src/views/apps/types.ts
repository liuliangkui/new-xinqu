/**
 * 应用中心模块 — 类型定义
 */

export enum AppCategory {
  PLATFORM = 'PLATFORM',
  BUSINESS = 'BUSINESS',
  PROCESS = 'PROCESS',
  ANALYSIS = 'ANALYSIS',
  SYSTEM = 'SYSTEM',
}

export interface AppItem {
  appId: string
  code: string
  name: string
  icon?: string
  route?: string
  category: AppCategory
  permissions: string[]
  sortOrder: number
  status: string
  isFavorite?: boolean
}

export interface AppForm {
  code: string
  name: string
  icon?: string
  route?: string
  category?: AppCategory
  permissions?: string[]
  sortOrder?: number
  status?: string
}

export interface AppListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  category?: string
  status?: string
}

export interface AppListResult {
  list: AppItem[]
  total: number
  pageNum: number
  pageSize: number
}
