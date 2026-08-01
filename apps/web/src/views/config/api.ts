/**
 * 应用配置 — API 层
 */
import { get, post, put } from '@/api/request'
import type { ConfigItem, ConfigForm, ConfigListResult } from './types'

const BASE = '/system-configs'

/** 获取配置列表 */
export function getConfigList(params?: {
  module?: string
  keyword?: string
}): Promise<ConfigListResult> {
  return get<ConfigListResult>(BASE, params)
}

/** 保存配置 */
export function saveConfig(data: ConfigForm): Promise<ConfigItem> {
  return data.id ? put<ConfigItem>(`${BASE}/${data.id}`, data) : post<ConfigItem>(BASE, data)
}
