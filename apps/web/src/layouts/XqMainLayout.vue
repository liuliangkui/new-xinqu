<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
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
  window.addEventListener('click', closeUserMenuOnOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('click', closeUserMenuOnOutside)
})

const collapsed = computed(() => appStore.sidebarCollapsed)
const isMobile = computed(() => appStore.isMobile)
const mobileOpen = computed(() => appStore.sidebarMobileOpen)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

function closeUserMenuOnOutside(e: MouseEvent): void {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

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
  userMenuOpen.value = false
  router.push('/login')
}

// 临时切换用户（开发调试用，上线前移除）
const demoUsers = [
  { username: 'admin', password: 'admin123', name: '系统管理员' },
  { username: '13800000001', password: '123456', name: '张销售' },
  { username: '13900000002', password: '123456', name: '王经理' },
  { username: '13700000003', password: '123456', name: '李只读' },
]

async function handleSwitchUser(username: string, password: string): Promise<void> {
  try {
    await authStore.loginByCredentials(username, password)
    userMenuOpen.value = false
    window.location.reload()
  } catch (e) {
    console.error('切换用户失败', e)
  }
}

const pageTitle = computed(() => {
  return (route.meta.title as string) || appStore.pageTitle || ''
})
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
      <!-- 顶部导航栏 -->
      <header
        class="flex items-center justify-between h-[var(--topbar-height)] px-4 bg-[var(--card)] border-b border-[var(--line)] flex-shrink-0 z-30"
      >
        <div class="flex items-center gap-3 min-w-0">
          <button
            v-if="isMobile"
            class="p-1.5 rounded-md text-[var(--sub)] hover:bg-[var(--gray-bg)]"
            @click="appStore.openMobileSidebar"
          >
            <XqIcon name="list" size="20" />
          </button>
          <button
            class="flex items-center gap-1 p-1.5 rounded-md text-[var(--sub)] hover:bg-[var(--gray-bg)] transition-colors"
            title="返回上一步"
            @click="router.back()"
          >
            <XqIcon name="arrow-left" size="18" />
            <span class="text-sm hidden sm:inline">返回</span>
          </button>
          <span class="font-semibold text-[15px] text-[var(--ink)] truncate">{{
            pageTitle || '鑫渠 CRM'
          }}</span>
        </div>

        <!-- 右上角用户信息 / 退出 / 切换用户 -->
        <div class="relative">
          <button
            class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[var(--gray-bg)] transition-colors text-[var(--ink)]"
            @click.stop="userMenuOpen = !userMenuOpen"
          >
            <span
              class="w-7 h-7 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-bold"
            >
              {{ authStore.user?.name?.charAt(0) || '?' }}
            </span>
            <span class="text-sm max-w-[120px] truncate hidden sm:block">{{
              authStore.user?.name || '未登录'
            }}</span>
            <XqIcon name="arrow-left" size="12" class="-rotate-90 text-[var(--sub)]" />
          </button>

          <div
            ref="userMenuRef"
            v-if="userMenuOpen"
            class="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--line)] rounded-xl shadow-[var(--shadow-panel)] py-2 z-50"
          >
            <div class="px-4 py-2 border-b border-[var(--line-light)]">
              <p class="text-sm font-medium text-[var(--ink)] truncate">
                {{ authStore.user?.name }}
              </p>
              <p class="text-xs text-[var(--sub)] truncate">
                {{ authStore.user?.roles?.join(', ') }}
              </p>
            </div>

            <div class="px-3 py-2 text-xs text-[var(--sub)]">临时切换用户（开发完移除）</div>
            <button
              v-for="u in demoUsers"
              :key="u.username"
              class="w-full text-left px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--gray-bg)] transition-colors flex items-center justify-between"
              @click="handleSwitchUser(u.username, u.password)"
            >
              <span>{{ u.name }}</span>
              <span v-if="authStore.user?.name === u.name" class="text-[var(--primary)] text-xs"
                >当前</span
              >
            </button>

            <div class="border-t border-[var(--line-light)] mt-1 pt-1">
              <button
                class="w-full text-left px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors flex items-center gap-2"
                @click="handleLogout"
              >
                <XqIcon name="logout" size="14" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
