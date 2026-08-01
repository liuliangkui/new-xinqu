/**
 * 通用类型定义
 */

/** 分页请求参数 */
export interface PageParams {
  page?: number
  size?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  pages: number
}

/** 通用 API 响应 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
  success: boolean
}

/** 列表查询响应 */
export interface ListResult<T> {
  list: T[]
  total: number
}

/** 状态映射项 */
export interface StatusMapItem {
  text: string
  color?: string
  className?: string
}

/** 状态映射表 */
export type StatusMap = Record<string | number, StatusMapItem>

/** 导航 Tab 项 */
export interface NavTabItem {
  key: string | number
  label: string
  count?: number
  disabled?: boolean
}

/** 视图切换选项 */
export interface ViewOption {
  key: string
  label?: string
  icon?: string
}

/** 键值对 */
export interface KeyValue<T = string> {
  key: string | number
  value: T
  label?: string
}
