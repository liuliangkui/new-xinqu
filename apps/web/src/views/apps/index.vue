<script setup lang="ts">
/**
 * 应用中心 — 应用列表与收藏
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { NavTabItem } from '@/types/common'
import type { AppItem, AppForm, AppListParams } from './types'
import { AppCategory } from './types'
import { getAppList, createApp, updateApp, toggleFavorite } from './api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const apps = ref<AppItem[]>([])
const loading = ref(false)
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<AppForm>({} as AppForm)
const formLoading = ref(false)
const editingAppId = ref<string | null>(null)

const categoryLabels: Record<string, string> = {
  [AppCategory.PLATFORM]: '平台入口',
  [AppCategory.BUSINESS]: '业务管理',
  [AppCategory.PROCESS]: '流程协同',
  [AppCategory.ANALYSIS]: '管理与分析',
  [AppCategory.SYSTEM]: '系统设置',
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: AppCategory.PLATFORM, label: '平台入口' },
  { key: AppCategory.BUSINESS, label: '业务管理' },
  { key: AppCategory.PROCESS, label: '流程协同' },
  { key: AppCategory.ANALYSIS, label: '管理与分析' },
  { key: AppCategory.SYSTEM, label: '系统设置' },
]

const filteredApps = computed(() => {
  let result = apps.value
  if (activeTab.value !== 'all') {
    result = result.filter((a) => a.category === activeTab.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.code.toLowerCase().includes(kw),
    )
  }
  return result
})

const favoriteApps = computed(() => filteredApps.value.filter((a) => a.isFavorite))
const groupedApps = computed(() => {
  const groups: Record<string, AppItem[]> = {}
  filteredApps.value.forEach((app) => {
    const key = app.category
    if (!groups[key]) groups[key] = []
    groups[key]!.push(app)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

onMounted(() => {
  fetchList()
})

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: AppListParams = {
      pageNum: 1,
      pageSize: 100,
      ...(keyword.value ? { keyword: keyword.value } : {}),
    }
    const result = await getAppList(params)
    apps.value = result.list
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string): void {
  keyword.value = val
  fetchList()
}
function handleSearchInput(): void {
  if (searchTimer.value) clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => handleSearch(keyword.value), 300)
}
function handleTabChange(key: string | number): void {
  activeTab.value = String(key)
}

function handleOpenApp(app: AppItem): void {
  if (!app.route) return
  if (
    app.permissions &&
    app.permissions.length > 0 &&
    !authStore.hasAnyPermission(app.permissions)
  ) {
    window.alert('暂无权限访问该应用')
    return
  }
  router.push(app.route)
}

async function handleToggleFavorite(app: AppItem, event: Event): Promise<void> {
  event.stopPropagation()
  await toggleFavorite(app.appId, !app.isFavorite)
  app.isFavorite = !app.isFavorite
}

// ---- 管理操作 ----
function openCreate(): void {
  formMode.value = 'create'
  editingAppId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(app: AppItem, event: Event): void {
  event.stopPropagation()
  formMode.value = 'edit'
  editingAppId.value = app.appId
  formData.value = {
    code: app.code,
    name: app.name,
    icon: app.icon,
    route: app.route,
    category: app.category,
    permissions: app.permissions,
    sortOrder: app.sortOrder,
    status: app.status,
  }
  formVisible.value = true
}

function emptyForm(): AppForm {
  return {
    code: '',
    name: '',
    icon: 'apps',
    route: '',
    category: AppCategory.BUSINESS,
    permissions: [],
    sortOrder: 0,
    status: 'ACTIVE',
  }
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: AppForm = {
      code: String(values.code || ''),
      name: String(values.name || ''),
      icon: values.icon ? String(values.icon) : undefined,
      route: values.route ? String(values.route) : undefined,
      category: String(values.category || AppCategory.BUSINESS) as AppCategory,
      permissions: Array.isArray(values.permissions) ? values.permissions.map(String) : [],
      sortOrder: Number(values.sortOrder || 0),
      status: String(values.status || 'ACTIVE'),
    }

    if (formMode.value === 'create') {
      await createApp(data)
    } else if (editingAppId.value) {
      await updateApp(editingAppId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

const formFields = [
  { key: 'code', label: '应用编码', required: true, placeholder: '请输入应用编码' },
  { key: 'name', label: '应用名称', required: true, placeholder: '请输入应用名称' },
  { key: 'icon', label: '图标', placeholder: '请输入图标名称' },
  { key: 'route', label: '路由路径', placeholder: '请输入路由路径，如 /customer' },
  {
    key: 'category',
    label: '分类',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'PLATFORM', label: '平台入口' },
      { value: 'BUSINESS', label: '业务管理' },
      { value: 'PROCESS', label: '流程协同' },
      { value: 'ANALYSIS', label: '管理与分析' },
      { value: 'SYSTEM', label: '系统设置' },
    ],
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'ACTIVE', label: '启用' },
      { value: 'INACTIVE', label: '停用' },
    ],
  },
  { key: 'sortOrder', label: '排序', type: 'number' as const, placeholder: '请输入排序号' },
]
</script>

<template>
  <XqPageLayout title="应用中心" :show-stats="false" :show-filter="false">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />新建应用
      </XqButton>
    </template>
    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqSearchBar
        v-model="keyword"
        placeholder="搜索应用名称..."
        :pinyin-search="true"
        @search="handleSearch"
        @reset="handleSearch('')"
        @update:model-value="handleSearchInput"
      />
    </template>
    <template #content>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <span class="text-[var(--sub)]">加载中...</span>
      </div>

      <div v-else class="flex flex-col gap-6">
        <!-- 我的收藏 -->
        <div v-if="favoriteApps.length > 0" class="card">
          <h2 class="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <XqIcon name="star" size="16" class="text-yellow-500" />我的收藏
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div
              v-for="app in favoriteApps"
              :key="`fav-${app.appId}`"
              class="card card-hover cursor-pointer p-4 flex flex-col items-center text-center gap-3 relative group"
              @click="handleOpenApp(app)"
            >
              <button
                class="absolute top-2 right-2 text-yellow-500 hover:scale-110 transition-transform"
                @click="(e) => handleToggleFavorite(app, e)"
              >
                <XqIcon name="star" size="16" />
              </button>
              <div
                class="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"
              >
                <XqIcon :name="app.icon || 'apps'" size="24" />
              </div>
              <span class="text-sm font-medium text-[var(--ink)]">{{ app.name }}</span>
            </div>
          </div>
        </div>

        <!-- 分类应用 -->
        <div v-for="[category, items] in groupedApps" :key="category" class="card">
          <h2 class="text-base font-semibold text-[var(--ink)] mb-4">
            {{ categoryLabels[category] || category }}
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div
              v-for="app in items"
              :key="app.appId"
              class="card card-hover cursor-pointer p-4 flex flex-col items-center text-center gap-3 relative group"
              @click="handleOpenApp(app)"
            >
              <button
                class="absolute top-2 right-2 text-[var(--placeholder)] hover:text-yellow-500 hover:scale-110 transition-all"
                :class="app.isFavorite ? 'text-yellow-500' : ''"
                @click="(e) => handleToggleFavorite(app, e)"
              >
                <XqIcon :name="app.isFavorite ? 'star' : 'star-outlined'" size="16" />
              </button>
              <button
                v-if="authStore.hasRole('admin')"
                class="absolute top-2 left-2 text-[var(--placeholder)] hover:text-[var(--primary)] transition-colors"
                @click="(e) => openEdit(app, e)"
              >
                <XqIcon name="edit" size="14" />
              </button>
              <div
                class="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"
              >
                <XqIcon :name="app.icon || 'apps'" size="24" />
              </div>
              <span class="text-sm font-medium text-[var(--ink)]">{{ app.name }}</span>
              <span class="text-xs text-[var(--sub)]">{{ app.code }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredApps.length === 0" class="flex items-center justify-center h-64">
          <XqEmptyState type="empty" title="暂无应用" description="请调整搜索条件或联系管理员" />
        </div>
      </div>
    </template>
  </XqPageLayout>

  <!-- 新建/编辑应用抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建应用' : '编辑应用'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
