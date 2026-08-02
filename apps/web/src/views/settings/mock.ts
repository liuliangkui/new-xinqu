/**
 * 后台设置 — Mock
 */
import type { SettingsResult, SettingItem } from './types'

const settings: SettingsResult = {
  groups: [
    {
      groupId: 'security',
      groupName: '安全设置',
      icon: 'shield',
      items: [
        {
          itemId: 'mfaEnabled',
          itemName: '启用多因素认证',
          description: '登录时要求二次验证',
          value: false,
          valueType: 'SWITCH',
        },
        {
          itemId: 'passwordExpiryDays',
          itemName: '密码有效期（天）',
          value: 90,
          valueType: 'NUMBER',
        },
        {
          itemId: 'loginFailLock',
          itemName: '登录失败锁定',
          description: '连续5次失败锁定账号30分钟',
          value: true,
          valueType: 'SWITCH',
        },
      ],
    },
    {
      groupId: 'notification',
      groupName: '消息通知',
      icon: 'bell',
      items: [
        { itemId: 'emailNotify', itemName: '邮件通知', value: true, valueType: 'SWITCH' },
        { itemId: 'smsNotify', itemName: '短信通知', value: false, valueType: 'SWITCH' },
        { itemId: 'dailyDigest', itemName: '每日汇总时间', value: '09:00', valueType: 'STRING' },
      ],
    },
    {
      groupId: 'business',
      groupName: '业务规则',
      icon: 'settings',
      items: [
        { itemId: 'autoAssignLead', itemName: '线索自动分配', value: true, valueType: 'SWITCH' },
        {
          itemId: 'visitCheckInRange',
          itemName: '拜访打卡范围（米）',
          value: 500,
          valueType: 'NUMBER',
        },
        {
          itemId: 'defaultCurrency',
          itemName: '默认币种',
          value: 'CNY',
          valueType: 'SELECT',
          options: [
            { label: '人民币', value: 'CNY' },
            { label: '美元', value: 'USD' },
          ],
        },
      ],
    },
  ],
}

export function generateSettings(): SettingsResult {
  return { groups: settings.groups }
}

export function updateSettingItemInMock(
  groupId: string,
  itemId: string,
  value: SettingItem['value'],
): SettingItem | null {
  const group = settings.groups.find((g) => g.groupId === groupId)
  if (!group) return null
  const item = group.items.find((i) => i.itemId === itemId)
  if (!item) return null
  item.value = value
  return item
}
