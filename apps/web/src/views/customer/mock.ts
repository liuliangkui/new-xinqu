/**
 * 客户 360° 模块 — Mock 数据
 */
import type { Customer, CustomerDetail, CustomerListResult, CustomerStats } from './types'
import {
  CustomerLevel,
  OrgType,
  HealthLevel,
  CooperationStatus,
  RelationLevel,
  ContactAttitudeEnum,
  RoleType,
  DeployMode,
  EquipmentStatus,
  ConsumptionTrend,
  StockStatus,
} from './types'

function makeCustomer(id: number): Customer {
  const names = [
    '昆明市第一人民医院',
    '云南省第一人民医院',
    '昆明医科大学第一附属医院',
    '大理州人民医院',
    '曲靖市第一人民医院',
    '玉溪市人民医院',
    '楚雄州人民医院',
    '红河州第一人民医院',
    '昭通市第一人民医院',
    '文山州人民医院',
    '普洱市人民医院',
    '保山市人民医院',
    '临沧市人民医院',
    '丽江市人民医院',
    '德宏州人民医院',
    '西双版纳州人民医院',
    '迪庆州人民医院',
    '怒江州人民医院',
  ]
  const levels = Object.values(CustomerLevel).filter((v) => typeof v === 'number') as number[]
  const regions = [
    { code: '5301', name: '昆明' },
    { code: '5302', name: '曲靖' },
    { code: '5303', name: '玉溪' },
    { code: '5304', name: '红河' },
    { code: '5305', name: '昭通' },
    { code: '5306', name: '文山' },
    { code: '5307', name: '普洱' },
    { code: '5308', name: '保山' },
  ]
  const ni = id % names.length
  const ri = ni % regions.length
  const healthScore = 30 + ((id * 17) % 70)

  return {
    customerId: id,
    customerCode: `CUST${String(id).padStart(6, '0')}`,
    customerName: names[ni]!,
    customerLevel: levels[ni % levels.length]!,
    regionCode: regions[ri]!.code,
    regionName: regions[ri]!.name,
    bedCount: 200 + ((id * 73) % 1500),
    orgType: ((ni % 7) + 1) as OrgType,
    healthScore,
    healthLevel:
      healthScore >= 80
        ? HealthLevel.HEALTH
        : healthScore >= 60
          ? HealthLevel.ATTENTION
          : healthScore >= 40
            ? HealthLevel.RISK
            : HealthLevel.DANGER,
    ownerId: 1,
    ownerName: '张三',
    deptCount: 3 + (id % 6),
    equipmentCount: 1 + (id % 10),
    intentionCount: id % 5,
    lastContactTime: new Date(2026, 6, 28 - (id % 15)).toISOString().slice(0, 10),
    recentActivity: id % 3 === 0 ? '上周完成设备巡检' : undefined,
    createTime: new Date(2025, 0, id).toISOString(),
    updateTime: new Date(2026, 6, id).toISOString(),
  }
}

function makeDetail(customer: Customer): CustomerDetail {
  return {
    ...customer,
    departments: [
      {
        deptId: 1,
        deptName: '检验科',
        deptHead: '陈主任',
        monthlySampleQty: 12500,
        ourEquipment: 'XN-550 全自动生化分析仪',
        competitorEquipment: '迈瑞 BS-800',
        monthlyReagentAmount: 86000,
        cooperationStatus: CooperationStatus.CORE,
        lastVisitTime: '2026-07-25',
      },
      {
        deptId: 2,
        deptName: '影像科',
        deptHead: '王主任',
        monthlySampleQty: 6800,
        ourEquipment: 'XQ-MRI 1.5T',
        competitorEquipment: '西门子 Magnetom',
        monthlyReagentAmount: 42000,
        cooperationStatus: CooperationStatus.GOOD,
        lastVisitTime: '2026-07-20',
      },
      {
        deptId: 3,
        deptName: '急诊科',
        deptHead: '李主任',
        monthlySampleQty: 3200,
        ourEquipment: '',
        competitorEquipment: '罗氏 Cobas 8000',
        monthlyReagentAmount: 0,
        cooperationStatus: CooperationStatus.POTENTIAL,
        lastVisitTime: '2026-07-10',
      },
      {
        deptId: 4,
        deptName: '心内科',
        deptHead: '赵主任',
        monthlySampleQty: 8900,
        ourEquipment: 'XQ-ECG Pro',
        competitorEquipment: '',
        monthlyReagentAmount: 28000,
        cooperationStatus: CooperationStatus.GOOD,
        lastVisitTime: '2026-07-18',
      },
    ],
    decisionContacts: [
      {
        contactId: 1,
        contactName: '陈院长',
        contactTitle: '院长',
        roleType: RoleType.DECISION,
        deptName: '院办',
        phone: '13800000001',
        relationOwnerName: '张三',
        relationLevel: RelationLevel.HIGH,
        attitude: ContactAttitudeEnum.SUPPORT,
        lastContactTime: '2026-07-20',
        remark: '重点维护',
      },
      {
        contactId: 2,
        contactName: '王科长',
        contactTitle: '设备科科长',
        roleType: RoleType.INFLUENCER,
        deptName: '设备科',
        phone: '13800000002',
        relationOwnerName: '张三',
        relationLevel: RelationLevel.MEDIUM,
        attitude: ContactAttitudeEnum.NEUTRAL,
        lastContactTime: '2026-07-15',
      },
      {
        contactId: 3,
        contactName: '刘主任',
        contactTitle: '检验科主任',
        roleType: RoleType.USER,
        deptName: '检验科',
        phone: '13800000003',
        relationOwnerName: '张三',
        relationLevel: RelationLevel.HIGH,
        attitude: ContactAttitudeEnum.SUPPORT,
        lastContactTime: '2026-07-25',
      },
      {
        contactId: 4,
        contactName: '孙工',
        contactTitle: '信息科工程师',
        roleType: RoleType.HANDLER,
        deptName: '信息科',
        phone: '13800000004',
        relationOwnerName: '张三',
        relationLevel: RelationLevel.LOW,
        attitude: ContactAttitudeEnum.NEUTRAL,
        lastContactTime: '2026-07-08',
      },
    ],
    equipments: [
      {
        equipmentId: 1,
        equipmentName: 'XN-550 全自动生化分析仪',
        serialNo: 'XN550-20250001',
        deptName: '检验科',
        deployMode: DeployMode.SALE,
        installDate: '2025-03-15',
        warrantyExpireDate: '2028-03-14',
        utilizationRate: 85.5,
        status: EquipmentStatus.NORMAL,
        relatedReagents: 'XT-100 生化试剂套装',
      },
      {
        equipmentId: 2,
        equipmentName: 'XQ-MRI 1.5T',
        serialNo: 'MRI150-20250002',
        deptName: '影像科',
        deployMode: DeployMode.TP,
        installDate: '2025-06-01',
        warrantyExpireDate: '2028-05-31',
        utilizationRate: 72.0,
        status: EquipmentStatus.NORMAL,
        relatedReagents: 'MRI 造影剂',
      },
      {
        equipmentId: 3,
        equipmentName: 'XQ-ECG Pro',
        serialNo: 'ECGP-20250003',
        deptName: '心内科',
        deployMode: DeployMode.DONATION,
        installDate: '2025-09-01',
        warrantyExpireDate: '2026-08-31',
        utilizationRate: 90.2,
        status: EquipmentStatus.NORMAL,
        relatedReagents: 'ECG 电极片',
      },
    ],
    reagents: [
      {
        reagentId: 1,
        reagentName: 'XT-100 生化试剂套装',
        applicableEquipment: 'XN-550',
        deptName: '检验科',
        last3MonthAmount: 258000,
        consumptionTrend: ConsumptionTrend.UP,
        currentStock: 45,
        safetyStock: 30,
        repurchaseCycle: 30,
        fulfillmentRate: 92.5,
        stockStatus: StockStatus.NORMAL,
      },
      {
        reagentId: 2,
        reagentName: 'MRI 造影剂',
        applicableEquipment: 'XQ-MRI',
        deptName: '影像科',
        last3MonthAmount: 126000,
        consumptionTrend: ConsumptionTrend.FLAT,
        currentStock: 12,
        safetyStock: 20,
        repurchaseCycle: 45,
        fulfillmentRate: 68.0,
        stockStatus: StockStatus.REPLENISH,
        estimatedStockoutDate: '2026-08-15',
      },
      {
        reagentId: 3,
        reagentName: 'ECG 电极片',
        applicableEquipment: 'XQ-ECG Pro',
        deptName: '心内科',
        last3MonthAmount: 84000,
        consumptionTrend: ConsumptionTrend.UP,
        currentStock: 60,
        safetyStock: 25,
        repurchaseCycle: 60,
        fulfillmentRate: 88.0,
        stockStatus: StockStatus.NORMAL,
      },
    ],
    timeline: [
      {
        time: '2026-07-25 14:30',
        title: '拜访检验科陈主任',
        content: '讨论 XN-550 保修续签方案，客户倾向续签但要求增加耗材赠送',
        operator: '张三',
        eventType: 'visit',
      },
      {
        time: '2026-07-18 09:15',
        title: '设备巡检',
        content: 'XN-550 运行正常，MRI 建议升级梯度线圈',
        operator: '售后工程师李工',
        eventType: 'equipment',
      },
      {
        time: '2026-07-10 16:00',
        title: '意向跟进',
        content: '心内科 ECG 升级方案报价已递交，等待院务会审批',
        operator: '张三',
        eventType: 'intention',
      },
      {
        time: '2026-07-05 11:00',
        title: '试剂补货提醒',
        content: 'MRI 造影剂库存低于安全水位，已通知商务运营安排补货',
        operator: '系统',
        eventType: 'reagent',
      },
      {
        time: '2026-06-28 08:30',
        title: '服务工单完成',
        content: '检验科 XN-550 校准维护完成，检测值正常',
        operator: '售后工程师李工',
        eventType: 'ticket',
      },
    ],
    crossSellOpportunities: [
      {
        type: 'reagent',
        title: '急诊科试剂拓展',
        description: '急诊科月标本量 3200，目前使用罗氏试剂，建议推广 XT-100 套装',
        matchLevel: 'high',
      },
      {
        type: 'equipment',
        title: 'MRI 升级方案',
        description: 'XQ-MRI 保修即将到期，建议推荐升级款 XQ-MRI 3.0T',
        matchLevel: 'medium',
      },
    ],
    alerts: [
      {
        type: 'warranty',
        message: 'XQ-ECG Pro 保修将于 2026-08-31 到期，建议提前续签',
        severity: 'warning',
        createdAt: '2026-07-25',
      },
      {
        type: 'stock',
        message: 'MRI 造影剂库存不足，预计 8 月 15 日断货',
        severity: 'danger',
        createdAt: '2026-07-20',
      },
    ],
  }
}

export const allCustomers: Customer[] = Array.from({ length: 21 }, (_, i) => makeCustomer(i + 1))

function filterCustomers(params: {
  keyword?: string
  regionCode?: string
  customerLevel?: number
  healthLevel?: string
  status?: string
  ownerId?: number
  tabType?: string
}): Customer[] {
  let filtered = [...allCustomers]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (c) => c.customerName.toLowerCase().includes(kw) || c.customerCode.toLowerCase().includes(kw),
    )
  }
  if (params.regionCode) filtered = filtered.filter((c) => c.regionCode === params.regionCode)
  if (params.customerLevel)
    filtered = filtered.filter((c) => c.customerLevel === params.customerLevel)
  if (params.healthLevel) filtered = filtered.filter((c) => c.healthLevel === params.healthLevel)
  if (params.tabType === 'my') filtered = filtered.filter((c) => c.ownerId === 1)
  if (params.tabType === 'risk')
    filtered = filtered.filter(
      (c) => c.healthLevel === HealthLevel.RISK || c.healthLevel === HealthLevel.DANGER,
    )
  if (params.tabType === 'attention')
    filtered = filtered.filter((c) => c.healthLevel === HealthLevel.ATTENTION)
  if (params.tabType === 'pending') filtered = filtered.filter((c) => (c.intentionCount ?? 0) > 0)
  return filtered
}

function buildStats(filtered: Customer[]): CustomerStats {
  return {
    customerTotalCount: filtered.length,
    healthyCount: filtered.filter((c) => c.healthLevel === HealthLevel.HEALTH).length,
    riskCount: filtered.filter(
      (c) => c.healthLevel === HealthLevel.RISK || c.healthLevel === HealthLevel.DANGER,
    ).length,
    pendingVisitCount: Math.floor(filtered.length * 0.3),
  }
}

/** 同步生成分页结果（供 MSW 使用） */
export function generateCustomerList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  regionCode?: string
  customerLevel?: number
  healthLevel?: string
  status?: string
  ownerId?: number
  tabType?: string
}): CustomerListResult {
  const filtered = filterCustomers(params)
  const total = filtered.length
  const start = (params.pageNum - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)
  return {
    list,
    total,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    stats: buildStats(filtered),
  }
}

/** 同步生成详情（供 MSW 使用） */
export function generateCustomerDetail(customerId: number): CustomerDetail | null {
  const c = allCustomers.find((x) => x.customerId === customerId)
  return c ? makeDetail(c) : null
}

/** 搜索 + 筛选 + 分页 */
export function mockGetCustomerList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  regionCode?: string
  customerLevel?: number
  healthLevel?: string
  ownerId?: number
  tabType?: string
}): Promise<CustomerListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateCustomerList(params))
    }, 300)
  })
}

/** 获取详情 */
export function mockGetCustomerDetail(customerId: number): Promise<CustomerDetail | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateCustomerDetail(customerId))
    }, 250)
  })
}
