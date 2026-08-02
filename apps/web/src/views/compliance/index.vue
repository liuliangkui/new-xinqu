<script setup lang="ts">
/**
 * 合规风控
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type {
  ComplianceRecord,
  ComplianceForm,
  ComplianceListParams,
  ComplianceStats,
} from './types'
import { getComplianceList, getComplianceStats, saveCompliance, deleteCompliance } from './api'

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
const records = ref<ComplianceRecord[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<ComplianceStats>({
  totalCount: 0,
  passCount: 0,
  failCount: 0,
  pendingCount: 0,
  riskCount: 0,
})

const keyword = ref('')
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '', type: '' })
const pagination = ref({ page: 1, size: 12 })

const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<ComplianceForm>(emptyForm())
const formLoading = ref(false)
const detailVisible = ref(false)
const detailRecord = ref<ComplianceRecord | null>(null)

const statusMap: StatusMap = {
  PASS: { text: '合规', color: 'green' },
  FAIL: { text: '不合规', color: 'red' },
  PENDING: { text: '待完善', color: 'orange' },
  RISK: { text: '风险', color: 'red' },
}

const typeMap: Record<string, string> = {
  CONTRACT: '合同',
  BID: '招标',
  SAMPLE: '样品',
  REBATE: '返利',
  PRICE: '价格',
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'PASS', label: '合规' },
  { key: 'RISK', label: '风险' },
  { key: 'PENDING', label: '待完善' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'PASS', label: '合规' },
      { value: 'FAIL', label: '不合规' },
      { value: 'PENDING', label: '待完善' },
      { value: 'RISK', label: '风险' },
    ],
  },
  {
    key: 'type',
    label: '类型',
    options: [
      { value: '', label: '全部' },
      { value: 'CONTRACT', label: '合同' },
      { value: 'BID', label: '招标' },
      { value: 'SAMPLE', label: '样品' },
      { value: 'REBATE', label: '返利' },
      { value: 'PRICE', label: '价格' },
    ],
  },
]

const tableColumns = [
  { title: '审查编号', dataIndex: 'recordCode', width: '150px', mobileHidden: true },
  { title: '标题', dataIndex: 'title', width: '200px' },
  { title: '类型', dataIndex: 'type', width: '80px' },
  { title: '客户', dataIndex: 'customerName', width: '180px', mobileHidden: true },
  { title: '金额', dataIndex: 'amount', width: '100px' },
  { title: '合规证据链', dataIndex: 'evidences', width: '260px' },
  { title: '状态', dataIndex: 'status', width: '80px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'title', label: '审查标题', required: true, placeholder: '请输入审查标题' },
  {
    key: 'type',
    label: '合规类型',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'CONTRACT', label: '合同' },
      { value: 'BID', label: '招标' },
      { value: 'SAMPLE', label: '样品' },
      { value: 'REBATE', label: '返利' },
      { value: 'PRICE', label: '价格' },
    ],
  },
  { key: 'customerName', label: '客户名称', required: true, placeholder: '请输入客户名称' },
  {
    key: 'amount',
    label: '涉及金额',
    type: 'number' as const,
    required: true,
    placeholder: '请输入金额',
  },
]

function emptyForm(): ComplianceForm {
  return {
    title: '',
    type: 'CONTRACT',
    customerName: '',
    amount: 0,
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ComplianceListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { status: activeTab.value } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
      ...(filterValues.value.type ? { type: String(filterValues.value.type) } : {}),
    }
    const [result, statResult] = await Promise.all([
      getComplianceList(params),
      getComplianceStats(),
    ])
    records.value = result.list
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

function openEdit(record: ComplianceRecord): void {
  formMode.value = 'edit'
  formData.value = {
    recordId: record.recordId,
    title: record.title,
    type: record.type,
    customerName: record.customerName,
    amount: record.amount,
  }
  formVisible.value = true
}

function openDetail(record: ComplianceRecord): void {
  detailRecord.value = record
  detailVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    await saveCompliance({ ...formData.value, ...values } as ComplianceForm)
    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(record: ComplianceRecord): Promise<void> {
  if (!confirm(`确定删除审查「${record.title}」？`)) return
  await deleteCompliance(record.recordId)
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
</script>

<template>
  <XqPageLayout title="合规风控">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        新增审查
      </XqButton>
    </template>

    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <XqKpiCard title="审查总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="合规" :value="stats.passCount" color="green" />
        <XqKpiCard title="风险" :value="stats.riskCount" color="red" />
        <XqKpiCard title="待完善" :value="stats.pendingCount" color="orange" />
        <XqKpiCard title="不合规" :value="stats.failCount" color="gray" />
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
          placeholder="搜索编号、标题、客户…"
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
        :data-source="records"
        :loading="loading"
        row-key="recordId"
      >
        <template #type="{ value }">
          <span class="text-sm text-[var(--ink)]">{{ typeMap[value] || value }}</span>
        </template>
        <template #amount="{ value }">
          <span class="text-sm text-[var(--ink)]">¥{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #evidences="{ record }">
          <div class="flex items-center gap-1">
            <span
              v-for="ev in record.evidences"
              :key="ev.evidenceId"
              class="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium"
              :class="ev.uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              :title="ev.evidenceName"
            >
              {{ ev.uploaded ? '✓' : '—' }}
            </span>
          </div>
        </template>
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" />
        </template>
        <template #actions="{ record }">
          <div class="flex items-center gap-2" @click.stop>
            <button
              class="text-sm text-[var(--primary)] hover:underline"
              @click="openDetail(record)"
            >
              详情
            </button>
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
        :data-source="records"
        :columns="4"
        :loading="loading"
        @item-click="openDetail"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
              <span class="text-xs text-[var(--placeholder)]">{{ typeMap[record.type] }}</span>
            </div>
            <div class="text-md font-medium text-[var(--ink)] truncate mb-1">
              {{ record.title }}
            </div>
            <div class="text-sm text-[var(--sub)] truncate">{{ record.customerName }}</div>
            <div class="text-sm text-[var(--sub)] mb-2">
              金额 ¥{{ record.amount.toLocaleString() }}
            </div>
            <div class="flex items-center gap-1 pt-2 border-t border-[var(--line-light)]">
              <span
                v-for="ev in record.evidences"
                :key="ev.evidenceId"
                class="inline-flex items-center justify-center w-5 h-5 rounded text-[10px]"
                :class="ev.uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                :title="ev.evidenceName"
              >
                {{ ev.uploaded ? '✓' : '—' }}
              </span>
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
    :title="formMode === 'create' ? '新增合规审查' : '编辑合规审查'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />

  <XqModal
    :visible="detailVisible"
    :title="detailRecord?.title || '合规详情'"
    width="640px"
    @close="detailVisible = false"
  >
    <div v-if="detailRecord" class="space-y-4">
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span class="text-[var(--sub)]">编号：{{ detailRecord.recordCode }}</span>
        <span class="text-[var(--sub)]">客户：{{ detailRecord.customerName }}</span>
        <span class="text-[var(--sub)]">金额：¥{{ detailRecord.amount.toLocaleString() }}</span>
        <span class="text-[var(--sub)]"
          >状态：<XqStatusBadge :status="detailRecord.status" :status-map="statusMap" size="small"
        /></span>
      </div>
      <div v-if="detailRecord.riskTips" class="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
        风险提示：{{ detailRecord.riskTips }}
      </div>
      <div>
        <h4 class="text-sm font-medium text-[var(--ink)] mb-2">合规证据链（5项）</h4>
        <div class="grid grid-cols-5 gap-2">
          <div
            v-for="ev in detailRecord.evidences"
            :key="ev.evidenceId"
            class="flex flex-col items-center p-3 rounded-lg border border-[var(--line)]"
            :class="ev.uploaded ? 'bg-green-50 border-green-200' : 'bg-[var(--bg)]'"
          >
            <span class="text-lg mb-1">{{ ev.uploaded ? '✓' : '—' }}</span>
            <span class="text-xs text-center text-[var(--ink)]">{{ ev.evidenceName }}</span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <XqButton @click="detailVisible = false">关闭</XqButton>
      <XqButton
        type="primary"
        @click="
          detailVisible = false
          openEdit(detailRecord!)
        "
        >编辑</XqButton
      >
    </template>
  </XqModal>
</template>
