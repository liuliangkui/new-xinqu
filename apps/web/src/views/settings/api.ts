/**
 * 后台设置 — API 层
 */
import { get, put } from '@/api/request'
import type { SettingsResult, SettingItem } from './types'

const BASE = '/settings'

/** 获取后台设置 */
export function getSettings(): Promise<SettingsResult> {
  return get<SettingsResult>(BASE)
}

/** 保存设置项 */
export function saveSettingItem(
  groupId: string,
  itemId: string,
  value: SettingItem['value'],
): Promise<SettingItem> {
  return put<SettingItem>(`${BASE}/${groupId}/${itemId}`, { value })
}
