import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import XqMainLayout from '@/layouts/XqMainLayout.vue'
import { useAuthStore } from '@/stores/auth'

/**
 * 模块路由占位 — 22 个模块全部 lazy load
 * 每个模块的 index.vue 目前是占位页，后续逐个替换为真实实现
 */
const moduleRoutes: RouteRecordRaw[] = [
  // ---- 平台入口 ----
  {
    path: '/',
    name: 'workbench',
    component: () => import('@/views/workbench/index.vue'),
    meta: { title: '工作台', icon: 'home', permissions: ['workbench:read'] },
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/calendar/index.vue'),
    meta: { title: '日历', icon: 'calendar', permissions: ['calendar:read'] },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/tasks/index.vue'),
    meta: { title: '任务', icon: 'task', permissions: ['task:read'] },
  },
  {
    path: '/message',
    name: 'message',
    component: () => import('@/views/message/index.vue'),
    meta: { title: '消息中心', icon: 'message', permissions: ['message:read'] },
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('@/views/contacts/index.vue'),
    meta: { title: '通讯录', icon: 'contacts', permissions: ['contact:read'] },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/favorites/index.vue'),
    meta: { title: '收藏夹', icon: 'star', permissions: ['favorite:read'] },
  },
  {
    path: '/apps',
    name: 'apps',
    component: () => import('@/views/apps/index.vue'),
    meta: { title: '应用中心', icon: 'apps', permissions: ['app:read'] },
  },

  // ---- 业务管理 ----
  {
    path: '/customer',
    name: 'customer',
    component: () => import('@/views/customer/index.vue'),
    meta: { title: '客户 360°', icon: 'customer', permissions: ['customer:read'] },
  },
  {
    path: '/customer/:id',
    name: 'customer-detail',
    component: () => import('@/views/customer/detail.vue'),
    meta: { title: '客户详情', permissions: ['customer:read'] },
  },
  {
    path: '/lead',
    name: 'lead',
    component: () => import('@/views/lead/index.vue'),
    meta: { title: '线索管理', icon: 'lead', permissions: ['lead:read'] },
  },
  {
    path: '/intention',
    name: 'intention',
    component: () => import('@/views/intention/index.vue'),
    meta: { title: '意向管理', icon: 'opportunity', permissions: ['intention:read'] },
  },
  {
    path: '/brand',
    name: 'brand',
    component: () => import('@/views/brand/index.vue'),
    meta: { title: '品牌库管理', icon: 'brand', permissions: ['brand:read'] },
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('@/views/equipment/index.vue'),
    meta: { title: '设备管理', icon: 'equipment', permissions: ['equipment:read'] },
  },
  {
    path: '/reagent',
    name: 'reagent',
    component: () => import('@/views/reagent/index.vue'),
    meta: { title: '试剂运营', icon: 'reagent', permissions: ['reagent:read'] },
  },

  // ---- 流程协同 ----
  {
    path: '/approval',
    name: 'approval',
    component: () => import('@/views/approval/index.vue'),
    meta: { title: '审批中心', icon: 'approval', permissions: ['approval:read'] },
  },
  {
    path: '/ticket',
    name: 'ticket',
    component: () => import('@/views/ticket/index.vue'),
    meta: { title: '售后工单', icon: 'ticket', permissions: ['ticket:read'] },
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import('@/views/kanban/index.vue'),
    meta: { title: '工单看板', icon: 'kanban', permissions: ['ticket:read'] },
  },
  {
    path: '/dealer',
    name: 'dealer',
    component: () => import('@/views/dealer/index.vue'),
    meta: { title: '经销商协同', icon: 'dealer', permissions: ['dealer:read'] },
  },
  {
    path: '/designer',
    name: 'designer',
    component: () => import('@/views/designer/index.vue'),
    meta: { title: '流程设计器', icon: 'settings', permissions: ['workflow:read'] },
  },

  // ---- 管理与分析 ----
  {
    path: '/compliance',
    name: 'compliance',
    component: () => import('@/views/compliance/index.vue'),
    meta: { title: '合规风控', icon: 'compliance', permissions: ['compliance:read'] },
  },
  {
    path: '/performance',
    name: 'performance',
    component: () => import('@/views/performance/index.vue'),
    meta: { title: '目标绩效', icon: 'performance', permissions: ['performance:read'] },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '经营驾驶舱', icon: 'dashboard', permissions: ['dashboard:read'] },
  },
  {
    path: '/dashboard/funnel',
    name: 'dashboard-funnel',
    component: () => import('@/views/dashboard/funnel.vue'),
    meta: { title: '销售漏斗', icon: 'dashboard', permissions: ['dashboard:read'] },
  },

  // ---- 系统设置 ----
  {
    path: '/config',
    name: 'config',
    component: () => import('@/views/config/index.vue'),
    meta: { title: '应用配置', icon: 'settings', permissions: ['config:read'] },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { title: '后台设置', icon: 'settings', permissions: ['system:read'] },
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: XqMainLayout,
    children: moduleRoutes,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/not-found/index.vue'),
    meta: { title: '404', public: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(
  (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    const isPublic = to.meta.public === true
    const requiredPermissions = (to.meta.permissions as string[] | undefined) || []

    if (!isPublic && !authStore.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    if (requiredPermissions.length > 0 && !authStore.hasAnyPermission(requiredPermissions)) {
      return next({ name: 'not-found' })
    }

    next()
  },
)

export default router
