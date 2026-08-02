<script setup lang="ts">
/**
 * 经销商协同
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Dealer, DealerForm, DealerListParams, DealerStats } from './types'
import { getDealerList, getDealerStats, saveDealer, deleteDealer } from './api'

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
const dealers = ref<Dealer[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<DealerStats>({ totalCount: 0, coreCount: 0, authorizedCount: 0, expiredCount: 0 })

const keyword = ref('')
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '', level: '' })
const pagination = ref({ page: 1, size: 12 })

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<DealerForm>(emptyForm())
const formLoading = ref(false)

const statusMap: StatusMap = {
  ACTIVE: { text: '合作中', color: 'green' },
  INACTIVE: { text: '已停用', color: 'gray' },
  EXPIRED: { text: '授权到期', color: 'red' },
}

const levelMap: StatusMap = {
  CORE: { text: '核心经销商', color: 'blue' },
  AUTHORIZED: { text: '授权经销商', color: 'green' },
  GENERAL: { text: '普通经销商', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'CORE', label: '核心经销商' },
  { key: 'AUTHORIZED', label: '授权经销商' },
  { key: 'EXPIRED', label: '授权到期' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'ACTIVE', label: '合作中' },
      { value: 'INACTIVE', label: '已停用' },
      { value: 'EXPIRED', label: '授权到期' },
    ],
  },
  {
    key: 'level',
    label: '等级',
    options: [
      { value: '', label: '全部' },
      { value: 'CORE', label: '核心' },
      { value: 'AUTHORIZED', label: '授权' },
      { value: 'GENERAL', label: '普通' },
    ],
  },
]

const tableColumns = [
  { title: '经销商名称', dataIndex: 'dealerName', width: '200px' },
  { title: '编码', dataIndex: 'dealerCode', width: '100px', mobileHidden: true },
  { title: '地区', dataIndex: 'regionName', width: '100px' },
  { title: '等级', dataIndex: 'level', width: '100px' },
  { title: '联系人', dataIndex: 'contactName', width: '100px', mobileHidden: true },
  { title: '授权到期', dataIndex: 'authorizedEndDate', width: '120px', mobileHidden: true },
  { title: '库存/订单', dataIndex: 'inventoryCount', width: '120px', mobileHidden: true },
  { title: '状态', dataIndex: 'status', width: '80px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'dealerName', label: '经销商名称', required: true, placeholder: '请输入经销商名称' },
  { key: 'dealerCode', label: '经销商编码', required: true, placeholder: '请输入编码' },
  { key: 'regionName', label: '所属地区', required: true, placeholder: '请输入地区' },
  {
    key: 'level',
    label: '经销商等级',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'CORE', label: '核心经销商' },
      { value: 'AUTHORIZED', label: '授权经销商' },
      { value: 'GENERAL', label: '普通经销商' },
    ],
  },
  { key: 'contactName', label: '联系人', required: true, placeholder: '请输入联系人' },
  {
    key: 'contactPhone',
    label: '联系电话',
    type: 'tel' as const,
    required: true,
    placeholder: '请输入联系电话',
  },
  { key: 'authorizedStartDate', label: '授权开始日期', type: 'date' as const, required: true },
  { key: 'authorizedEndDate', label: '授权结束日期', type: 'date' as const, required: true },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'ACTIVE', label: '合作中' },
      { value: 'INACTIVE', label: '已停用' },
      { value: 'EXPIRED', label: '授权到期' },
    ],
  },
]

function emptyForm(): DealerForm {
  return {
    dealerName: '',
    dealerCode: '',
    regionName: '',
    level: 'GENERAL',
    contactName: '',
    contactPhone: '',
    authorizedStartDate: new Date().toISOString().slice(0, 10),
    authorizedEndDate: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: DealerListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' && ['CORE', 'AUTHORIZED'].includes(activeTab.value)
        ? { level: activeTab.value }
        : {}),
      ...(activeTab.value === 'EXPIRED' ? { status: 'EXPIRED' } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
      ...(filterValues.value.level ? { level: String(filterValues.value.level) } : {}),
    }
    const [result, statResult] = await Promise.all([getDealerList(params), getDealerStats()])
    dealers.value = result.list
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

function openEdit(record: Dealer): void {
  formMode.value = 'edit'
  formData.value = { ...record }
  formVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    await saveDealer({ ...formData.value, ...values } as DealerForm)
    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(record: Dealer): Promise<void> {
  if (!confirm(`确定删除经销商「${record.dealerName}」？`)) return
  await deleteDealer(record.dealerId)
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
</script>

<template>
  <XqPageLayout title="经销商协同">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        新增经销商
      </XqButton>
    </template>

    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="经销商总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="核心经销商" :value="stats.coreCount" color="blue" />
        <XqKpiCard title="授权经销商" :value="stats.authorizedCount" color="green" />
        <XqKpiCard title="授权到期" :value="stats.expiredCount" color="red" />
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
          placeholder="搜索经销商、地区、编码…"
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
        :data-source="dealers"
        :loading="loading"
        row-key="dealerId"
      >
        <template #level="{ value }">
          <XqStatusBadge :status="value" :status-map="levelMap" />
        </template>
        <template #inventoryCount="{ record }">
          <span class="text-sm text-[var(--ink)]"
            >{{ record.inventoryCount }} / {{ record.orderCount }}</span
          >
        </template>
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
        :data-source="dealers"
        :columns="4"
        :loading="loading"
        @item-click="openEdit"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
              <XqStatusBadge :status="record.level" :status-map="levelMap" size="small" />
            </div>
            <div class="text-md font-medium text-[var(--ink)] truncate mb-1">
              {{ record.dealerName }}
            </div>
            <div class="text-sm text-[var(--sub)] truncate">
              {{ record.dealerCode }} · {{ record.regionName }}
            </div>
            <div class="text-sm text-[var(--sub)] truncate">
              {{ record.contactName }} {{ record.contactPhone }}
            </div>
            <div
              class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line-light)]"
            >
              <span class="text-xs text-[var(--placeholder)]"
                >到期 {{ record.authorizedEndDate }}</span
              >
              <span class="text-xs text-[var(--placeholder)]"
                >库存 {{ record.inventoryCount }}</span
              >
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
    :title="formMode === 'create' ? '新增经销商' : '编辑经销商'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
