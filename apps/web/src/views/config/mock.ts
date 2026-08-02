/**
 * 应用配置 — Mock
 */
import type { ConfigItem, ConfigForm, ConfigListResult } from './types'

const configs: ConfigItem[] = [
  {
    id: '1',
    module: 'SYSTEM',
    key: 'siteName',
    value: '鑫渠 CRM',
    valueType: 'STRING',
    description: '站点名称',
    status: 'ACTIVE',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: '2',
    module: 'SYSTEM',
    key: 'enableRegister',
    value: 'false',
    valueType: 'BOOLEAN',
    description: '是否开放注册',
    status: 'ACTIVE',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: '3',
    module: 'CUSTOMER',
    key: 'healthScoreThreshold',
    value: '80',
    valueType: 'NUMBER',
    description: '客户健康分阈值',
    status: 'ACTIVE',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    id: '4',
    module: 'WORKFLOW',
    key: 'approvalAutoPassAmount',
    value: '5000',
    valueType: 'NUMBER',
    description: '审批自动通过金额（元）',
    status: 'ACTIVE',
    updatedAt: '2026-07-29T10:00:00Z',
  },
  {
    id: '5',
    module: 'CALENDAR',
    key: 'defaultReminderMinutes',
    value: '15',
    valueType: 'NUMBER',
    description: '日程默认提醒时间（分钟）',
    status: 'ACTIVE',
    updatedAt: '2026-07-30T10:00:00Z',
  },
]

export function generateConfigList(params?: {
  module?: string
  keyword?: string
}): ConfigListResult {
  let list = [...configs]
  if (params?.module) {
    list = list.filter((c) => c.module === params.module)
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (c) =>
        c.key.toLowerCase().includes(kw) ||
        (c.description && c.description.toLowerCase().includes(kw)),
    )
  }
  return { list, total: list.length }
}

export function updateConfigInMock(id: string, data: Partial<ConfigForm>): ConfigItem | null {
  const idx = configs.findIndex((c) => c.id === id)
  if (idx === -1) return null
  configs[idx] = { ...configs[idx], ...data, updatedAt: new Date().toISOString() } as ConfigItem
  return configs[idx]
}

export function createConfigInMock(data: Partial<ConfigForm>): ConfigItem {
  const item: ConfigItem = {
    id: String(configs.length + 1),
    module: data.module || 'SYSTEM',
    key: data.key || '',
    value: data.value || '',
    valueType: (data.valueType as ConfigItem['valueType']) || 'STRING',
    description: data.description,
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  }
  configs.unshift(item)
  return item
}
