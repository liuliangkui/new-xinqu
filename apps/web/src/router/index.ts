import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import XqMainLayout from '@/layouts/XqMainLayout.vue'

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
    meta: { title: '工作台', icon: 'home' },
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/calendar/index.vue'),
    meta: { title: '日历', icon: 'calendar' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/tasks/index.vue'),
    meta: { title: '任务', icon: 'task' },
  },
  {
    path: '/message',
    name: 'message',
    component: () => import('@/views/message/index.vue'),
    meta: { title: '消息中心', icon: 'message' },
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('@/views/contacts/index.vue'),
    meta: { title: '通讯录', icon: 'contacts' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/favorites/index.vue'),
    meta: { title: '收藏夹', icon: 'star' },
  },
  {
    path: '/apps',
    name: 'apps',
    component: () => import('@/views/apps/index.vue'),
    meta: { title: '应用中心', icon: 'apps' },
  },

  // ---- 业务管理 ----
  {
    path: '/customer',
    name: 'customer',
    component: () => import('@/views/customer/index.vue'),
    meta: { title: '客户 360°', icon: 'customer' },
  },
  {
    path: '/customer/:id',
    name: 'customer-detail',
    component: () => import('@/views/customer/detail.vue'),
    meta: { title: '客户详情' },
  },
  {
    path: '/lead',
    name: 'lead',
    component: () => import('@/views/lead/index.vue'),
    meta: { title: '线索管理', icon: 'lead' },
  },
  {
    path: '/intention',
    name: 'intention',
    component: () => import('@/views/intention/index.vue'),
    meta: { title: '意向管理', icon: 'opportunity' },
  },
  {
    path: '/brand',
    name: 'brand',
    component: () => import('@/views/brand/index.vue'),
    meta: { title: '品牌库管理', icon: 'brand' },
  },
  {
    path: '/equipment',
    name: 'equipment',
    component: () => import('@/views/equipment/index.vue'),
    meta: { title: '设备管理', icon: 'equipment' },
  },
  {
    path: '/reagent',
    name: 'reagent',
    component: () => import('@/views/reagent/index.vue'),
    meta: { title: '试剂运营', icon: 'reagent' },
  },

  // ---- 流程协同 ----
  {
    path: '/approval',
    name: 'approval',
    component: () => import('@/views/approval/index.vue'),
    meta: { title: '审批中心', icon: 'approval' },
  },
  {
    path: '/ticket',
    name: 'ticket',
    component: () => import('@/views/ticket/index.vue'),
    meta: { title: '售后工单', icon: 'ticket' },
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: () => import('@/views/kanban/index.vue'),
    meta: { title: '工单看板', icon: 'kanban' },
  },
  {
    path: '/dealer',
    name: 'dealer',
    component: () => import('@/views/dealer/index.vue'),
    meta: { title: '经销商协同', icon: 'dealer' },
  },
  {
    path: '/designer',
    name: 'designer',
    component: () => import('@/views/designer/index.vue'),
    meta: { title: '流程设计器', icon: 'settings' },
  },

  // ---- 管理与分析 ----
  {
    path: '/compliance',
    name: 'compliance',
    component: () => import('@/views/compliance/index.vue'),
    meta: { title: '合规风控', icon: 'compliance' },
  },
  {
    path: '/performance',
    name: 'performance',
    component: () => import('@/views/performance/index.vue'),
    meta: { title: '目标绩效', icon: 'performance' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '经营驾驶舱', icon: 'dashboard' },
  },

  // ---- 系统设置 ----
  {
    path: '/config',
    name: 'config',
    component: () => import('@/views/config/index.vue'),
    meta: { title: '应用配置', icon: 'settings' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { title: '后台设置', icon: 'settings' },
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
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
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
