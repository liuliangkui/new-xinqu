/**
 * 应用配置 — 类型定义
 */

export interface ConfigItem {
  id: string
  module: string
  key: string
  value: string
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  description?: string
  status: string
  updatedAt: string
}

export interface ConfigForm {
  id?: string
  module: string
  key: string
  value: string
  valueType: string
  description?: string
}

export interface ConfigListResult {
  list: ConfigItem[]
  total: number
}
