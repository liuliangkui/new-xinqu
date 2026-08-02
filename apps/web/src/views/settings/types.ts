/**
 * 后台设置 — 类型定义
 */

export interface SettingGroup {
  groupId: string
  groupName: string
  icon?: string
  items: SettingItem[]
}

export interface SettingItem {
  itemId: string
  itemName: string
  description?: string
  value: boolean | string | number
  valueType: 'SWITCH' | 'STRING' | 'NUMBER' | 'SELECT'
  options?: { label: string; value: string | number }[]
}

export interface SettingsResult {
  groups: SettingGroup[]
}
