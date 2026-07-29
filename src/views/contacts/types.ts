/**
 * 通讯录模块 — 类型定义
 * 对应《通讯录功能与交互说明.md》v1.0 第六章字段规范
 */

/** 联系人角色 */
export enum ContactRole {
  /** 决策者 */
  DECISION_MAKER = 1,
  /** 影响者 */
  INFLUENCER = 2,
  /** 经办人 */
  HANDLER = 3,
  /** 使用者 */
  USER = 4,
}

/** 联系人态度 */
export enum ContactAttitude {
  /** 支持 */
  SUPPORT = 1,
  /** 中立 */
  NEUTRAL = 2,
  /** 观望 */
  WAITING = 3,
  /** 反对 */
  OPPOSE = 4,
}

/** 联系人类型 */
export enum ContactType {
  /** 客户联系人 */
  CUSTOMER = 1,
  /** 经销商联系人 */
  DEALER = 2,
  /** 内部用户 */
  INTERNAL = 3,
}

/** 联系人状态 */
export enum ContactStatus {
  /** 草稿 */
  DRAFT = 0,
  /** 已生效 */
  ACTIVE = 1,
  /** 已停用 */
  INACTIVE = 2,
}

/** 联系人 */
export interface Contact {
  contactId: number
  contactCode: string
  contactName: string
  customerId: number
  customerName: string
  department?: string
  jobTitle: string
  contactRole: ContactRole
  attitude?: ContactAttitude
  contactType: ContactType
  mobilePhone: string
  email?: string
  lastContactTime?: string
  status: ContactStatus
  remark?: string
  ownerId: number
  ownerName: string
  createTime: string
  createBy: number
  updateTime: string
  regionCode: string
  regionName: string
  recentInteractions?: RecentInteraction[]
}

/** 最近互动 */
export interface RecentInteraction {
  time: string
  title: string
  content: string
  operator: string
  status?: string
  statusColor?: string
}

/** 联系人列表查询参数 */
export interface ContactListParams {
  pageNum: number
  pageSize: number
  keyword?: string
  regionCode?: string
  contactRole?: number
  contactType?: number
  status?: number
  tabType?: 'all' | 'my' | 'team' | 'org'
}

/** 联系人列表响应 */
export interface ContactListResult {
  list: Contact[]
  total: number
  pageNum: number
  pageSize: number
  stats: ContactStats
}

/** 联系人统计 */
export interface ContactStats {
  contactTotalCount: number
  decisionMakerCount: number
  influencerCount: number
  handlerCount: number
}

/** 新建/编辑联系人表单 */
export interface ContactFormData {
  contactName: string
  customerId: number | null
  customerName?: string
  department?: string
  jobTitle: string
  contactRole: ContactRole | null
  attitude?: ContactAttitude | null
  contactType: ContactType | null
  mobilePhone: string
  email?: string
  remark?: string
  status?: ContactStatus
}

/** Tab 类型 */
export type TabType = 'all' | 'my' | 'team' | 'org'
