<script setup lang="ts">
/**
 * 试剂运营
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Reagent, ReagentForm, ReagentListParams, ReagentStats } from './types'
import { getReagentList, getReagentStats, saveReagent, deleteReagent } from './api'

const isMobile = ref(false)
function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchList()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'list')
const reagents = ref<Reagent[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<ReagentStats>({
  totalCount: 0,
  activeCount: 0,
  lowStockCount: 0,
  discontinuedCount: 0,
})

const keyword = ref('')
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '', category: '' })
const pagination = ref({ page: 1, size: 12 })

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<ReagentForm>(emptyForm())
const formLoading = ref(false)

const statusMap: StatusMap = {
  ACTIVE: { text: '启用', color: 'green' },
  INACTIVE: { text: '停用', color: 'gray' },
  DISCONTINUED: { text: '停产', color: 'red' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '启用中' },
  { key: 'lowStock', label: '库存预警' },
  { key: 'discontinued', label: '已停产' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'ACTIVE', label: '启用' },
      { value: 'INACTIVE', label: '停用' },
      { value: 'DISCONTINUED', label: '停产' },
    ],
  },
  {
    key: 'category',
    label: '品类',
    options: [
      { value: '', label: '全部' },
      { value: '血球试剂', label: '血球试剂' },
      { value: '生化试剂', label: '生化试剂' },
      { value: '免疫试剂', label: '免疫试剂' },
      { value: '凝血试剂', label: '凝血试剂' },
    ],
  },
]

const tableColumns = [
  { title: '试剂名称', dataIndex: 'reagentName', width: '180px' },
  { title: '试剂编码', dataIndex: 'reagentCode', width: '120px', mobileHidden: true },
  { title: '品牌', dataIndex: 'brandName', width: '120px' },
  { title: '品类', dataIndex: 'category', width: '100px' },
  { title: '规格', dataIndex: 'specification', width: '120px', mobileHidden: true },
  { title: '单价', dataIndex: 'price', width: '100px' },
  { title: '库存', dataIndex: 'stock', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '80px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'reagentName', label: '试剂名称', required: true, placeholder: '请输入试剂名称' },
  { key: 'reagentCode', label: '试剂编码', required: true, placeholder: '请输入试剂编码' },
  { key: 'brandName', label: '品牌', required: true, placeholder: '请输入品牌' },
  {
    key: 'category',
    label: '品类',
    type: 'select' as const,
    required: true,
    options: [
      { value: '血球试剂', label: '血球试剂' },
      { value: '生化试剂', label: '生化试剂' },
      { value: '免疫试剂', label: '免疫试剂' },
      { value: '凝血试剂', label: '凝血试剂' },
      { value: '其他', label: '其他' },
    ],
  },
  { key: 'specification', label: '规格', required: true, placeholder: '请输入规格' },
  { key: 'unit', label: '单位', required: true, placeholder: '请输入单位' },
  {
    key: 'price',
    label: '单价',
    type: 'number' as const,
    required: true,
    placeholder: '请输入单价',
  },
  {
    key: 'stock',
    label: '库存',
    type: 'number' as const,
    required: true,
    placeholder: '请输入库存',
  },
  {
    key: 'safetyStock',
    label: '安全库存',
    type: 'number' as const,
    required: true,
    placeholder: '请输入安全库存',
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'ACTIVE', label: '启用' },
      { value: 'INACTIVE', label: '停用' },
      { value: 'DISCONTINUED', label: '停产' },
    ],
  },
]

function emptyForm(): ReagentForm {
  return {
    reagentName: '',
    reagentCode: '',
    brandName: '',
    category: '血球试剂',
    specification: '',
    unit: '盒',
    price: 0,
    stock: 0,
    safetyStock: 0,
    status: 'ACTIVE',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ReagentListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
      ...(filterValues.value.category ? { category: String(filterValues.value.category) } : {}),
    }
    const [result, statResult] = await Promise.all([getReagentList(params), getReagentStats()])
    reagents.value = result.list
    total.value = result.total
    stats.value = statResult
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string): void {
  keyword.value = val
  pagination.value.page = 1
  fetchList()
}
function handleTabChange(key: string | number): void {
  activeTab.value = String(key)
  pagination.value.page = 1
  if (activeTab.value === 'lowStock') {
    filterValues.value = { ...filterValues.value, status: 'ACTIVE' }
  }
  fetchList()
}
function handleFilterChange(values: Record<string, unknown>): void {
  filterValues.value = values
  pagination.value.page = 1
  fetchList()
}
function handleViewChange(val: 'card' | 'list'): void {
  viewMode.value = val
}

function openCreate(): void {
  formMode.value = 'create'
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(record: Reagent): void {
  formMode.value = 'edit'
  formData.value = { ...record }
  formVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    await saveReagent({ ...formData.value, ...values } as ReagentForm)
    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(record: Reagent): Promise<void> {
  if (!confirm(`确定删除试剂「${record.reagentName}」？`)) return
  await deleteReagent(record.reagentId)
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
</script>

<template>
  <XqPageLayout title="试剂运营">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        新增试剂
      </XqButton>
    </template>

    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="试剂总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="启用中" :value="stats.activeCount" color="green" />
        <XqKpiCard title="库存预警" :value="stats.lowStockCount" color="warning" />
        <XqKpiCard title="已停产" :value="stats.discontinuedCount" color="gray" />
      </div>
    </template>

    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqViewSwitch :value="viewMode" @change="handleViewChange" />
    </template>

    <template #filter>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <XqSearchBar
          v-model="keyword"
          placeholder="搜索试剂、品牌、编码…"
          width="240px"
          @search="handleSearch"
          @reset="
            keyword = ''
            handleSearch('')
          "
        />
        <XqFilterBar :filters="filterConfig" :values="filterValues" @change="handleFilterChange" />
      </div>
    </template>

    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="reagents"
        :loading="loading"
        row-key="reagentId"
      >
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" />
        </template>
        <template #actions="{ record }">
          <div class="flex items-center gap-2" @click.stop>
            <button class="text-sm text-[var(--primary)] hover:underline" @click="openEdit(record)">
              编辑
            </button>
            <button
              class="text-sm text-[var(--danger)] hover:underline"
              @click="handleDelete(record)"
            >
              删除
            </button>
          </div>
        </template>
      </XqDataTable>

      <XqCardGrid
        v-else
        :data-source="reagents"
        :columns="4"
        :loading="loading"
        @item-click="openEdit"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold flex-shrink-0"
              >
                {{ record.reagentName.charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-md font-medium text-[var(--ink)] truncate">{{
                    record.reagentName
                  }}</span>
                  <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
                </div>
                <div class="text-sm text-[var(--sub)] truncate">{{ record.reagentCode }}</div>
                <div class="text-sm text-[var(--sub)] truncate">
                  {{ record.brandName }} · {{ record.category }}
                </div>
                <div
                  class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line-light)]"
                >
                  <span class="text-xs text-[var(--placeholder)]">库存 {{ record.stock }}</span>
                  <span class="text-xs text-[var(--placeholder)]">¥{{ record.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>

    <template #footer>
      <div class="flex items-center justify-between text-sm text-[var(--sub)]">
        <span
          >{{ pagination.page }} / {{ Math.ceil(total / pagination.size) || 1 }} 页，共
          {{ total }} 条</span
        >
        <div class="flex items-center gap-2">
          <button
            class="btn btn-ghost text-sm"
            :disabled="pagination.page <= 1"
            @click="pageChange(pagination.page - 1)"
          >
            上一页
          </button>
          <button
            class="btn btn-ghost text-sm"
            :disabled="!hasMore"
            @click="pageChange(pagination.page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </template>
  </XqPageLayout>

  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新增试剂' : '编辑试剂'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
