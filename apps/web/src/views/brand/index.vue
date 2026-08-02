<script setup lang="ts">
/**
 * 品牌库管理
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Brand, BrandForm, BrandListParams, BrandStats } from './types'
import { getBrandList, getBrandStats, saveBrand, deleteBrand } from './api'

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
const brands = ref<Brand[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<BrandStats>({ totalCount: 0, activeCount: 0, inactiveCount: 0, productCount: 0 })

const keyword = ref('')
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '', category: '' })
const pagination = ref({ page: 1, size: 12 })

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<BrandForm>(emptyForm())
const formLoading = ref(false)
const editingId = ref<string | null>(null)

const statusMap: StatusMap = {
  ACTIVE: { text: '启用', color: 'green' },
  INACTIVE: { text: '停用', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '启用中' },
  { key: 'inactive', label: '已停用' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'ACTIVE', label: '启用' },
      { value: 'INACTIVE', label: '停用' },
    ],
  },
  {
    key: 'category',
    label: '品类',
    options: [
      { value: '', label: '全部' },
      { value: '检验设备', label: '检验设备' },
      { value: '影像设备', label: '影像设备' },
      { value: '试剂', label: '试剂' },
      { value: '耗材', label: '耗材' },
    ],
  },
]

const tableColumns = [
  { title: '品牌名称', dataIndex: 'brandName', width: '180px' },
  { title: '品牌编码', dataIndex: 'brandCode', width: '120px', mobileHidden: true },
  { title: '制造商', dataIndex: 'manufacturer', width: '220px', mobileHidden: true },
  { title: '品类', dataIndex: 'category', width: '100px' },
  { title: '产品数', dataIndex: 'productCount', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '80px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'brandName', label: '品牌名称', required: true, placeholder: '请输入品牌名称' },
  { key: 'brandCode', label: '品牌编码', required: true, placeholder: '请输入品牌编码' },
  { key: 'manufacturer', label: '制造商', required: true, placeholder: '请输入制造商' },
  {
    key: 'category',
    label: '品类',
    type: 'select' as const,
    required: true,
    options: [
      { value: '检验设备', label: '检验设备' },
      { value: '影像设备', label: '影像设备' },
      { value: '试剂', label: '试剂' },
      { value: '耗材', label: '耗材' },
      { value: '其他', label: '其他' },
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
  { key: 'remark', label: '备注', type: 'textarea' as const, placeholder: '请输入备注' },
]

function emptyForm(): BrandForm {
  return {
    brandName: '',
    brandCode: '',
    manufacturer: '',
    category: '检验设备',
    status: 'ACTIVE',
    remark: '',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: BrandListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { status: activeTab.value.toUpperCase() } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
      ...(filterValues.value.category ? { category: String(filterValues.value.category) } : {}),
    }
    const [result, statResult] = await Promise.all([getBrandList(params), getBrandStats()])
    brands.value = result.list
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
  editingId.value = null
  formVisible.value = true
}

function openEdit(record: Brand): void {
  formMode.value = 'edit'
  editingId.value = record.brandId
  formData.value = {
    brandId: record.brandId,
    brandName: record.brandName,
    brandCode: record.brandCode,
    manufacturer: record.manufacturer,
    category: record.category,
    status: record.status,
    remark: record.remark,
  }
  formVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    await saveBrand({ ...formData.value, ...values } as BrandForm)
    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(record: Brand): Promise<void> {
  if (!confirm(`确定删除品牌「${record.brandName}」？`)) return
  await deleteBrand(record.brandId)
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
</script>

<template>
  <XqPageLayout title="品牌库管理">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        新增品牌
      </XqButton>
    </template>

    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="品牌总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="启用中" :value="stats.activeCount" color="green" />
        <XqKpiCard title="已停用" :value="stats.inactiveCount" color="gray" />
        <XqKpiCard title="产品总数" :value="stats.productCount" color="ink" />
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
          placeholder="搜索品牌、制造商、编码…"
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
        :data-source="brands"
        :loading="loading"
        row-key="brandId"
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
        :data-source="brands"
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
                {{ record.brandName.charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-md font-medium text-[var(--ink)] truncate">{{
                    record.brandName
                  }}</span>
                  <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
                </div>
                <div class="text-sm text-[var(--sub)] truncate">{{ record.brandCode }}</div>
                <div class="text-sm text-[var(--sub)] truncate">{{ record.manufacturer }}</div>
                <div
                  class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line-light)]"
                >
                  <span class="text-xs text-[var(--placeholder)]">{{ record.category }}</span>
                  <span class="text-xs text-[var(--placeholder)]"
                    >{{ record.productCount }} 个产品</span
                  >
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
    :title="formMode === 'create' ? '新增品牌' : '编辑品牌'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
