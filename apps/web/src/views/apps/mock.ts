/**
 * 应用中心 — Mock
 */
import type { AppItem, AppForm, AppListResult } from './types'
import { AppCategory } from './types'

const appData: AppItem[] = [
  {
    appId: '1',
    code: 'workbench',
    name: '工作台',
    icon: 'home',
    route: '/',
    category: AppCategory.PLATFORM,
    permissions: ['workbench:read'],
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    appId: '2',
    code: 'calendar',
    name: '日历',
    icon: 'calendar',
    route: '/calendar',
    category: AppCategory.PLATFORM,
    permissions: ['calendar:read'],
    sortOrder: 2,
    status: 'ACTIVE',
  },
  {
    appId: '3',
    code: 'tasks',
    name: '任务',
    icon: 'task',
    route: '/tasks',
    category: AppCategory.PLATFORM,
    permissions: ['task:read'],
    sortOrder: 3,
    status: 'ACTIVE',
  },
  {
    appId: '4',
    code: 'message',
    name: '消息中心',
    icon: 'message',
    route: '/message',
    category: AppCategory.PLATFORM,
    permissions: ['message:read'],
    sortOrder: 4,
    status: 'ACTIVE',
  },
  {
    appId: '5',
    code: 'contacts',
    name: '通讯录',
    icon: 'contacts',
    route: '/contacts',
    category: AppCategory.PLATFORM,
    permissions: ['contact:read'],
    sortOrder: 5,
    status: 'ACTIVE',
  },
  {
    appId: '6',
    code: 'favorites',
    name: '收藏夹',
    icon: 'star',
    route: '/favorites',
    category: AppCategory.PLATFORM,
    permissions: ['favorite:read'],
    sortOrder: 6,
    status: 'ACTIVE',
  },
  {
    appId: '7',
    code: 'apps',
    name: '应用中心',
    icon: 'apps',
    route: '/apps',
    category: AppCategory.PLATFORM,
    permissions: ['app:read'],
    sortOrder: 7,
    status: 'ACTIVE',
  },

  {
    appId: '8',
    code: 'customer',
    name: '客户 360°',
    icon: 'customer',
    route: '/customer',
    category: AppCategory.BUSINESS,
    permissions: ['customer:read'],
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    appId: '9',
    code: 'lead',
    name: '线索管理',
    icon: 'lead',
    route: '/lead',
    category: AppCategory.BUSINESS,
    permissions: ['lead:read'],
    sortOrder: 2,
    status: 'ACTIVE',
  },
  {
    appId: '10',
    code: 'intention',
    name: '意向管理',
    icon: 'opportunity',
    route: '/intention',
    category: AppCategory.BUSINESS,
    permissions: ['intention:read'],
    sortOrder: 3,
    status: 'ACTIVE',
  },
  {
    appId: '11',
    code: 'brand',
    name: '品牌库管理',
    icon: 'brand',
    route: '/brand',
    category: AppCategory.BUSINESS,
    permissions: ['brand:read'],
    sortOrder: 4,
    status: 'ACTIVE',
  },
  {
    appId: '12',
    code: 'equipment',
    name: '设备管理',
    icon: 'equipment',
    route: '/equipment',
    category: AppCategory.BUSINESS,
    permissions: ['equipment:read'],
    sortOrder: 5,
    status: 'ACTIVE',
  },
  {
    appId: '13',
    code: 'reagent',
    name: '试剂运营',
    icon: 'reagent',
    route: '/reagent',
    category: AppCategory.BUSINESS,
    permissions: ['reagent:read'],
    sortOrder: 6,
    status: 'ACTIVE',
  },

  {
    appId: '14',
    code: 'approval',
    name: '审批中心',
    icon: 'approval',
    route: '/approval',
    category: AppCategory.PROCESS,
    permissions: ['approval:read'],
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    appId: '15',
    code: 'ticket',
    name: '售后工单',
    icon: 'ticket',
    route: '/ticket',
    category: AppCategory.PROCESS,
    permissions: ['ticket:read'],
    sortOrder: 2,
    status: 'ACTIVE',
  },
  {
    appId: '16',
    code: 'kanban',
    name: '工单看板',
    icon: 'kanban',
    route: '/kanban',
    category: AppCategory.PROCESS,
    permissions: ['ticket:read'],
    sortOrder: 3,
    status: 'ACTIVE',
  },
  {
    appId: '17',
    code: 'dealer',
    name: '经销商协同',
    icon: 'dealer',
    route: '/dealer',
    category: AppCategory.PROCESS,
    permissions: ['dealer:read'],
    sortOrder: 4,
    status: 'ACTIVE',
  },
  {
    appId: '18',
    code: 'designer',
    name: '流程设计器',
    icon: 'settings',
    route: '/designer',
    category: AppCategory.PROCESS,
    permissions: ['workflow:read'],
    sortOrder: 5,
    status: 'ACTIVE',
  },

  {
    appId: '19',
    code: 'compliance',
    name: '合规风控',
    icon: 'compliance',
    route: '/compliance',
    category: AppCategory.ANALYSIS,
    permissions: ['compliance:read'],
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    appId: '20',
    code: 'performance',
    name: '目标绩效',
    icon: 'performance',
    route: '/performance',
    category: AppCategory.ANALYSIS,
    permissions: ['performance:read'],
    sortOrder: 2,
    status: 'ACTIVE',
  },
  {
    appId: '21',
    code: 'dashboard',
    name: '经营驾驶舱',
    icon: 'dashboard',
    route: '/dashboard',
    category: AppCategory.ANALYSIS,
    permissions: ['dashboard:read'],
    sortOrder: 3,
    status: 'ACTIVE',
  },

  {
    appId: '22',
    code: 'config',
    name: '应用配置',
    icon: 'settings',
    route: '/config',
    category: AppCategory.SYSTEM,
    permissions: ['config:read'],
    sortOrder: 1,
    status: 'ACTIVE',
  },
  {
    appId: '23',
    code: 'settings',
    name: '后台设置',
    icon: 'settings',
    route: '/settings',
    category: AppCategory.SYSTEM,
    permissions: ['system:read'],
    sortOrder: 2,
    status: 'ACTIVE',
  },
]

export const allApps = [...appData]
export const favoriteAppIds = new Set<string>(['1', '3', '8'])

function filterApps(params: { keyword?: string; category?: string; status?: string }): AppItem[] {
  let filtered = allApps.filter((a) => a.status === (params.status || 'ACTIVE'))
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.code.toLowerCase().includes(kw),
    )
  }
  if (params.category) filtered = filtered.filter((a) => a.category === params.category)
  return filtered.map((a) => ({ ...a, isFavorite: favoriteAppIds.has(a.appId) }))
}

export function generateAppList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  category?: string
  status?: string
}): AppListResult {
  const filtered = filterApps(params)
  const total = filtered.length
  const start = (params.pageNum - 1) * params.pageSize
  return {
    list: filtered.slice(start, start + params.pageSize),
    total,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  }
}

function nextAppId(): number {
  return allApps.length > 0 ? Math.max(...allApps.map((a) => Number(a.appId))) + 1 : 1
}

export function createAppInMock(data: Partial<AppForm>): AppItem {
  const id = nextAppId()
  const app: AppItem = {
    appId: String(id),
    code: data.code || `app-${id}`,
    name: data.name || '新建应用',
    icon: data.icon,
    route: data.route,
    category: data.category ?? AppCategory.BUSINESS,
    permissions: data.permissions || [],
    sortOrder: data.sortOrder ?? 0,
    status: data.status || 'ACTIVE',
    isFavorite: false,
  }
  allApps.push(app)
  return app
}

export function updateAppInMock(appId: string, data: Partial<AppForm>): AppItem | null {
  const idx = allApps.findIndex((a) => a.appId === appId)
  if (idx === -1) return null
  const existing = allApps[idx]!
  const updated: AppItem = {
    ...existing,
    ...data,
    appId: existing.appId,
    isFavorite: favoriteAppIds.has(existing.appId),
  }
  allApps[idx] = updated
  return updated
}

export function deleteAppFromMock(appId: string): boolean {
  const idx = allApps.findIndex((a) => a.appId === appId)
  if (idx === -1) return false
  allApps.splice(idx, 1)
  return true
}

export function toggleFavoriteInMock(appId: string, isFavorite: boolean): boolean {
  if (isFavorite) {
    favoriteAppIds.add(appId)
  } else {
    favoriteAppIds.delete(appId)
  }
  return true
}
