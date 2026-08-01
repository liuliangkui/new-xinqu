<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { RouterView } from 'vue-router'
import XqSidebar from '@/components/xq/XqSidebar/index.vue'
import type { MenuItem } from '@/components/xq/XqSidebar/index.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// 侧边栏菜单
const menus: MenuItem[] = [
  { key: 'workbench', label: '工作台', icon: 'home', path: '/' },
  { key: 'calendar', label: '日历', icon: 'calendar', path: '/calendar' },
  { key: 'tasks', label: '任务', icon: 'task', path: '/tasks' },
  { key: 'message', label: '消息中心', icon: 'message', path: '/message' },
  { key: 'contacts', label: '通讯录', icon: 'contacts', path: '/contacts' },
  { key: 'favorites', label: '收藏夹', icon: 'star', path: '/favorites' },
  { key: 'apps', label: '应用中心', icon: 'apps', path: '/apps' },
  {
    key: 'business',
    label: '业务管理',
    icon: 'opportunity',
    children: [
      { key: 'customer', label: '客户 360°', icon: 'customer', path: '/customer' },
      { key: 'lead', label: '线索管理', icon: 'lead', path: '/lead' },
      { key: 'intention', label: '意向管理', icon: 'opportunity', path: '/intention' },
      { key: 'brand', label: '品牌库管理', icon: 'brand', path: '/brand' },
      { key: 'equipment', label: '设备管理', icon: 'equipment', path: '/equipment' },
      { key: 'reagent', label: '试剂运营', icon: 'reagent', path: '/reagent' },
    ],
  },
  {
    key: 'workflow',
    label: '流程协同',
    icon: 'approval',
    children: [
      { key: 'approval', label: '审批中心', icon: 'approval', path: '/approval' },
      { key: 'ticket', label: '售后工单', icon: 'ticket', path: '/ticket' },
      { key: 'kanban', label: '工单看板', icon: 'kanban', path: '/kanban' },
      { key: 'dealer', label: '经销商协同', icon: 'dealer', path: '/dealer' },
      { key: 'designer', label: '流程设计器', icon: 'settings', path: '/designer' },
    ],
  },
  {
    key: 'governance',
    label: '管理与分析',
    icon: 'dashboard',
    children: [
      { key: 'compliance', label: '合规风控', icon: 'compliance', path: '/compliance' },
      { key: 'performance', label: '目标绩效', icon: 'performance', path: '/performance' },
      { key: 'dashboard', label: '经营驾驶舱', icon: 'dashboard', path: '/dashboard' },
    ],
  },
  {
    key: 'system',
    label: '系统设置',
    icon: 'settings',
    children: [
      { key: 'config', label: '应用配置', icon: 'settings', path: '/config' },
      { key: 'settings', label: '后台设置', icon: 'settings', path: '/settings' },
    ],
  },
]

// 响应式检测
const MOBILE_BREAKPOINT = 768
function checkMobile(): void {
  appStore.setMobile(window.innerWidth < MOBILE_BREAKPOINT)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const collapsed = computed(() => appStore.sidebarCollapsed)
const isMobile = computed(() => appStore.isMobile)
const mobileOpen = computed(() => appStore.sidebarMobileOpen)

function handleNavClick(item: MenuItem): void {
  if (item.path) {
    router.push(item.path)
  }
  if (isMobile.value) {
    appStore.closeMobileSidebar()
  }
}

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--bg)]">
    <!-- 手机遮罩 -->
    <div
      v-if="isMobile && mobileOpen"
      class="fixed inset-0 z-40 bg-black/40"
      @click="appStore.closeMobileSidebar"
    />

    <!-- 侧边栏 -->
    <aside
      class="fixed md:relative z-50 h-full flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--line)] transition-all duration-300 ease-in-out shadow-[var(--shadow-card)]"
      :class="{
        'w-[var(--sidebar-width)]': !collapsed && !isMobile,
        'w-[var(--sidebar-collapsed-width)]': collapsed && !isMobile,
        'w-[var(--sidebar-width)] left-0': isMobile && mobileOpen,
        'w-[var(--sidebar-width)] -left-[var(--sidebar-width)]': isMobile && !mobileOpen,
      }"
    >
      <!-- Logo 区 -->
      <div
        class="flex items-center h-[var(--topbar-height)] px-4 border-b border-[var(--line)] flex-shrink-0"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          >
            鑫
          </span>
          <span
            v-show="!collapsed || isMobile"
            class="font-semibold text-[15px] text-[var(--sidebar-ink)] whitespace-nowrap"
          >
            鑫渠 CRM
          </span>
        </div>
        <!-- 折叠按钮 (PC) -->
        <button
          v-if="!isMobile"
          class="ml-auto p-1.5 rounded-md text-[var(--sub)] hover:bg-[var(--gray-bg)] transition-colors"
          @click="appStore.toggleSidebar"
        >
          <XqIcon name="arrow-left" size="14" :class="collapsed ? 'rotate-180' : ''" />
        </button>
      </div>

      <!-- 导航菜单 -->
      <XqSidebar :menus="menus" :collapsed="collapsed && !isMobile" @nav-click="handleNavClick" />

      <!-- 底部操作区 -->
      <div class="p-3 border-t border-[var(--line)] flex-shrink-0">
        <!-- 深色切换 -->
        <button
          class="w-full flex items-center gap-2.5 p-2 rounded-lg text-[var(--sub)] hover:bg-[var(--gray-bg)] transition-colors"
          @click="themeStore.toggle"
        >
          <XqIcon :name="themeStore.isDark ? 'sun' : 'moon'" size="16" />
          <span v-show="!collapsed || isMobile" class="text-xs">
            {{ themeStore.isDark ? '浅色模式' : '深色模式' }}
          </span>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- 移动端顶部栏 -->
      <header
        v-if="isMobile"
        class="flex items-center gap-3 h-[var(--topbar-height)] px-4 bg-[var(--topbar-bg)] border-b border-[var(--line)] flex-shrink-0"
      >
        <button class="p-1.5 rounded-md text-[var(--sub)]" @click="appStore.openMobileSidebar">
          <XqIcon name="list" size="20" />
        </button>
        <span class="font-semibold text-[15px] text-[var(--ink)] truncate"> 鑫渠 CRM </span>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
