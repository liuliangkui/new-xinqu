/**
 * 通讯录模块 — Mock 数据
 */
import type { Contact, ContactFormData, ContactListResult, ContactStats } from './types'
import { ContactRole, ContactAttitude, ContactType, ContactStatus } from './types'

/** 生成 Mock 联系人 */
function makeContact(id: number): Contact {
  const customerNames = [
    '昆明市第一人民医院',
    '云南省第一人民医院',
    '昆明医科大学第一附属医院',
    '大理州人民医院',
    '曲靖市第一人民医院',
    '玉溪市人民医院',
    '楚雄州人民医院',
    '红河州第一人民医院',
  ]
  const names = ['陈主任', '王科长', '李院长', '张医生', '赵老师', '刘主任', '钱科长', '孙工']
  const jobs = [
    '检验科主任',
    '设备科科长',
    '副院长',
    '主治医师',
    '护士长',
    '药剂科主任',
    '信息科科长',
    '采购专员',
  ]
  const roles = [
    ContactRole.DECISION_MAKER,
    ContactRole.INFLUENCER,
    ContactRole.HANDLER,
    ContactRole.USER,
  ]

  const ci = id % customerNames.length
  const ni = id % names.length
  const ri = id % roles.length

  const createdAt = new Date(2026, 6, id)
  const contactTime = new Date(2026, 6, 28 - (id % 20))

  return {
    contactId: id,
    contactCode: `C${String(id).padStart(6, '0')}`,
    contactName: names[ni]!,
    customerId: ci + 1,
    customerName: customerNames[ci]!,
    department: ['检验科', '设备科', '院办', '药剂科', '信息科'][id % 5]!,
    jobTitle: jobs[ni]!,
    contactRole: roles[ri]!,
    attitude: [
      ContactAttitude.SUPPORT,
      ContactAttitude.NEUTRAL,
      ContactAttitude.WAITING,
      ContactAttitude.OPPOSE,
    ][id % 4]!,
    contactType: id % 5 === 0 ? ContactType.DEALER : ContactType.CUSTOMER,
    mobilePhone: `138${String(88000000 + id).slice(0, 8)}`,
    email: id % 3 === 0 ? `${names[ni]!.replace(/\s/g, '')}@hospital.com` : undefined,
    lastContactTime: contactTime.toISOString().slice(0, 10),
    status: id % 10 === 0 ? ContactStatus.DRAFT : ContactStatus.ACTIVE,
    remark: id % 4 === 0 ? '重要决策者，优先维护' : undefined,
    ownerId: 1,
    ownerName: '张三',
    createTime: createdAt.toISOString(),
    createBy: 1,
    updateTime: createdAt.toISOString(),
    regionCode: ['5301', '5302', '5303', '5329', '5304', '5305', '5323', '5325'][ci]!,
    regionName: ['昆明', '曲靖', '玉溪', '大理', '红河', '楚雄', '昭通', '文山'][ci]!,
    recentInteractions: [
      {
        time: '2026-07-25',
        title: '拜访并讨论 XN-550 保修续签',
        content: '客户倾向续签，但要求增加免费耗材',
        operator: '张三',
      },
      {
        time: '2026-07-10',
        title: '电话沟通新设备方案',
        content: '递交了设备配置方案，等待内部讨论',
        operator: '张三',
      },
    ],
  }
}

/** 生成 Mock 联系人列表 */
function makeContacts(count: number): Contact[] {
  return Array.from({ length: count }, (_, i) => makeContact(i + 1))
}

/** 全量 Mock 数据（内存） */
let allContacts: Contact[] = makeContacts(48)

/** 搜索联系人 */
export function mockGetContactList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  regionCode?: string
  contactRole?: number
  contactType?: number
  status?: number
  tabType?: string
}): Promise<ContactListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...allContacts]

      if (params.keyword) {
        const kw = params.keyword.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.contactName.toLowerCase().includes(kw) ||
            c.customerName.toLowerCase().includes(kw) ||
            c.jobTitle.toLowerCase().includes(kw) ||
            // 拼音首字母模拟
            (kw === 'zs' && c.contactName === '张三'),
        )
      }

      if (params.regionCode) {
        filtered = filtered.filter((c) => c.regionCode === params.regionCode)
      }

      if (params.contactRole) {
        filtered = filtered.filter((c) => c.contactRole === params.contactRole)
      }

      if (params.contactType) {
        filtered = filtered.filter((c) => c.contactType === params.contactType)
      }

      if (params.status !== undefined) {
        filtered = filtered.filter((c) => c.status === params.status)
      }

      // Tab 类型
      if (params.tabType === 'my') {
        filtered = filtered.filter((c) => c.ownerId === 1)
      } else if (params.tabType === 'team') {
        filtered = filtered.filter((c) => c.ownerId === 1 || c.contactType === ContactType.INTERNAL)
      } else if (params.tabType === 'org') {
        filtered = filtered.filter((c) => c.contactType === ContactType.INTERNAL)
      }

      const total = filtered.length
      const start = (params.pageNum - 1) * params.pageSize
      const list = filtered.slice(start, start + params.pageSize)

      const stats: ContactStats = {
        contactTotalCount: filtered.length,
        decisionMakerCount: filtered.filter((c) => c.contactRole === ContactRole.DECISION_MAKER)
          .length,
        influencerCount: filtered.filter((c) => c.contactRole === ContactRole.INFLUENCER).length,
        handlerCount: filtered.filter((c) => c.contactRole === ContactRole.HANDLER).length,
      }

      resolve({
        list,
        total,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        stats,
      })
    }, 300)
  })
}

/** 获取联系人详情 */
export function mockGetContactDetail(contactId: number): Promise<Contact | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(allContacts.find((c) => c.contactId === contactId) ?? null)
    }, 200)
  })
}

/** 新建联系人 */
export function mockCreateContact(
  data: ContactFormData,
): Promise<{ contactId: number; contactCode: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = allContacts.length + 1
      const newContact: Contact = {
        contactId: newId,
        contactCode: `C${String(newId).padStart(6, '0')}`,
        contactName: data.contactName,
        customerId: data.customerId || 1,
        customerName: data.customerName || '未知客户',
        department: data.department,
        jobTitle: data.jobTitle,
        contactRole: data.contactRole ?? ContactRole.HANDLER,
        attitude: data.attitude ?? undefined,
        contactType: data.contactType ?? ContactType.CUSTOMER,
        mobilePhone: data.mobilePhone,
        email: data.email,
        remark: data.remark,
        status: ContactStatus.ACTIVE,
        ownerId: 1,
        ownerName: '张三',
        createTime: new Date().toISOString(),
        createBy: 1,
        updateTime: new Date().toISOString(),
        regionCode: '5301',
        regionName: '昆明',
      }
      allContacts.unshift(newContact)
      resolve({ contactId: newId, contactCode: `C${String(newId).padStart(6, '0')}` })
    }, 200)
  })
}

/** 编辑联系人 */
export function mockUpdateContact(
  contactId: number,
  data: ContactFormData,
): Promise<{ contactId: number; updateTime: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = allContacts.findIndex((c) => c.contactId === contactId)
      if (idx >= 0) {
        const updateData: Partial<Contact> = {
          contactName: data.contactName,
          customerId: data.customerId ?? undefined,
          customerName: data.customerName,
          department: data.department,
          jobTitle: data.jobTitle,
          contactRole: data.contactRole ?? undefined,
          attitude: data.attitude ?? undefined,
          contactType: data.contactType ?? undefined,
          mobilePhone: data.mobilePhone,
          email: data.email,
          remark: data.remark,
          status: data.status,
        }
        allContacts[idx] = {
          ...allContacts[idx],
          ...updateData,
          updateTime: new Date().toISOString(),
        } as Contact
      }
      resolve({ contactId, updateTime: new Date().toISOString() })
    }, 200)
  })
}

/** 删除联系人 */
export function mockDeleteContact(contactId: number): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      allContacts = allContacts.filter((c) => c.contactId !== contactId)
      resolve({ success: true })
    }, 200)
  })
}
