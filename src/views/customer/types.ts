/**
 * 客户 360° 模块 — 类型定义
 * 对应《客户360°功能与交互说明.md》v1.3 第六章字段规范
 */

/** 医院等级 */
export enum CustomerLevel {
  三甲 = 1,
  三乙 = 2,
  二甲 = 3,
  二乙 = 4,
  一级 = 5,
  基层 = 6,
  民营 = 7,
}

/** 机构类型 */
export enum OrgType {
  综合医院 = 1,
  专科医院 = 2,
  妇幼保健院 = 3,
  中医院 = 4,
  ICL = 5,
  民营医院 = 6,
  其他 = 7,
}

/** 健康度等级 */
export enum HealthLevel {
  /** 健康 80-100 */
  HEALTH = 'health',
  /** 关注 60-79 */
  ATTENTION = 'attention',
  /** 风险 40-59 */
  RISK = 'risk',
  /** 高危 0-39 */
  DANGER = 'danger',
}

/** 合作状态 */
export enum CooperationStatus {
  CORE = 'core',
  GOOD = 'good',
  INITIAL = 'initial',
  POTENTIAL = 'potential',
  LOST = 'lost',
}

/** 关系紧密度 */
export enum RelationLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/** 联系人态度 */
export enum ContactAttitudeEnum {
  SUPPORT = 'support',
  NEUTRAL = 'neutral',
  OPPOSE = 'oppose',
  UNKNOWN = 'unknown',
}

/** 联系人角色 */
export enum RoleType {
  DECISION = 'decision',
  INFLUENCER = 'influencer',
  USER = 'user',
  HANDLER = 'handler',
}

/** 设备投放模式 */
export enum DeployMode {
  SALE = 'sale',
  TP = 'tp',
  DONATION = 'donation',
}

/** 设备状态 */
export enum EquipmentStatus {
  NORMAL = 'normal',
  REPAIRING = 'repairing',
  IDLE = 'idle',
  SCRAPPED = 'scrapped',
}

/** 消耗趋势 */
export enum ConsumptionTrend {
  UP = 'up',
  FLAT = 'flat',
  DOWN = 'down',
}

/** 库存状态 */
export enum StockStatus {
  NORMAL = 'normal',
  REPLENISH = 'replenish',
  EMERGENCY = 'emergency',
}

// ---- 客户主数据 ----
export interface Customer {
  customerId: number
  customerCode: string
  customerName: string
  customerLevel: CustomerLevel
  regionCode: string
  regionName: string
  bedCount: number
  orgType: OrgType
  healthScore: number
  healthLevel: HealthLevel
  ownerId: number
  ownerName: string
  deptCount: number
  equipmentCount: number
  intentionCount: number
  lastContactTime?: string
  recentActivity?: string
  createTime: string
  updateTime: string
}

// ---- 科室 ----
export interface Department {
  deptId: number
  deptName: string
  deptHead?: string
  monthlySampleQty: number
  ourEquipment?: string
  competitorEquipment?: string
  monthlyReagentAmount: number
  cooperationStatus: CooperationStatus
  lastVisitTime?: string
}

// ---- 决策链联系人 ----
export interface DecisionContact {
  contactId: number
  contactName: string
  contactTitle: string
  roleType: RoleType
  deptName: string
  phone?: string
  wechat?: string
  email?: string
  relationOwnerId?: number
  relationOwnerName?: string
  relationLevel: RelationLevel
  attitude: ContactAttitudeEnum
  lastContactTime?: string
  remark?: string
}

// ---- 设备 ----
export interface CustomerEquipment {
  equipmentId: number
  equipmentName: string
  serialNo: string
  deptName: string
  deployMode: DeployMode
  installDate: string
  warrantyExpireDate: string
  utilizationRate: number
  status: EquipmentStatus
  relatedReagents?: string
}

// ---- 试剂 ----
export interface CustomerReagent {
  reagentId: number
  reagentName: string
  applicableEquipment: string
  deptName: string
  last3MonthAmount: number
  consumptionTrend: ConsumptionTrend
  currentStock: number
  safetyStock: number
  estimatedStockoutDate?: string
  repurchaseCycle: number
  fulfillmentRate: number
  stockStatus: StockStatus
}

// ---- 时间线 ----
export interface TimelineItem {
  time: string
  title: string
  content: string
  operator: string
  eventType: 'visit' | 'intention' | 'equipment' | 'reagent' | 'ticket' | 'change'
  status?: string
  statusColor?: string
}

// ---- 客户详情 ----
export interface CustomerDetail extends Customer {
  departments: Department[]
  decisionContacts: DecisionContact[]
  equipments: CustomerEquipment[]
  reagents: CustomerReagent[]
  timeline: TimelineItem[]
  crossSellOpportunities?: CrossSellOpportunity[]
  alerts?: Alert[]
}

// ---- 交叉销售机会 ----
export interface CrossSellOpportunity {
  type: string
  title: string
  description: string
  matchLevel: 'high' | 'medium' | 'low'
}

// ---- 预警 ----
export interface Alert {
  type: string
  message: string
  severity: 'warning' | 'danger'
  createdAt: string
}

// ---- 列表查询 ----
export interface CustomerListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  regionCode?: string
  customerLevel?: number
  healthLevel?: string
  ownerId?: number
  tabType?: 'all' | 'my' | 'risk' | 'pending' | 'attention'
}

// ---- 统计 ----
export interface CustomerStats {
  customerTotalCount: number
  healthyCount: number
  riskCount: number
  pendingVisitCount: number
}

// ---- 列表响应 ----
export interface CustomerListResult {
  list: Customer[]
  total: number
  pageNum: number
  pageSize: number
  stats: CustomerStats
}
