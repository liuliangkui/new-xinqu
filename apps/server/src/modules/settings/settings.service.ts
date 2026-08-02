import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import type { UpdateSettingDto } from './dto/update-setting.dto'

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const userSetting = await this.prisma.userSetting.findUnique({ where: { userId } })
    const notificationSettings = await this.prisma.notificationSetting.findMany({ where: { userId } })

    const nsMap = Object.fromEntries(notificationSettings.map((n) => [n.channel, n.enabled]))

    return {
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
            { itemId: 'passwordExpiryDays', itemName: '密码有效期（天）', value: 90, valueType: 'NUMBER' },
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
            { itemId: 'emailNotify', itemName: '邮件通知', value: nsMap['EMAIL'] ?? true, valueType: 'SWITCH' },
            { itemId: 'smsNotify', itemName: '短信通知', value: nsMap['SMS'] ?? false, valueType: 'SWITCH' },
            { itemId: 'dailyDigest', itemName: '每日汇总时间', value: '09:00', valueType: 'STRING' },
          ],
        },
        {
          groupId: 'business',
          groupName: '业务规则',
          icon: 'settings',
          items: [
            {
              itemId: 'autoAssignLead',
              itemName: '线索自动分配',
              value: (userSetting?.settings as Record<string, unknown> | null)?.autoAssignLead ?? true,
              valueType: 'SWITCH',
            },
            {
              itemId: 'visitCheckInRange',
              itemName: '拜访打卡范围（米）',
              value: (userSetting?.settings as Record<string, unknown> | null)?.visitCheckInRange ?? 500,
              valueType: 'NUMBER',
            },
            {
              itemId: 'defaultCurrency',
              itemName: '默认币种',
              value: (userSetting?.settings as Record<string, unknown> | null)?.defaultCurrency ?? 'CNY',
              valueType: 'SELECT',
            },
          ],
        },
      ],
    }
  }

  async updateItem(userId: string, groupId: string, itemId: string, dto: UpdateSettingDto) {
    if (groupId === 'notification') {
      const channel = itemId === 'emailNotify' ? 'EMAIL' : itemId === 'smsNotify' ? 'SMS' : 'WEB'
      await this.prisma.notificationSetting.upsert({
        where: { userId_channel: { userId, channel } },
        create: { userId, channel, enabled: Boolean(dto.value) },
        update: { enabled: Boolean(dto.value) },
      })
    } else if (groupId === 'business') {
      const existing = await this.prisma.userSetting.findUnique({ where: { userId } })
      const settings = (existing?.settings as Record<string, unknown>) || {}
      settings[itemId] = dto.value
      await this.prisma.userSetting.upsert({
        where: { userId },
        create: { userId, settings: settings as unknown as Prisma.InputJsonValue },
        update: { settings: settings as unknown as Prisma.InputJsonValue },
      })
    }
    return { groupId, itemId, value: dto.value }
  }
}
