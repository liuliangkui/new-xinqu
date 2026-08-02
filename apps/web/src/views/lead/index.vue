<script setup lang="ts">
/**
 * 线索管理 — 列表页
 * 对应《线索管理功能与交互说明.md》v1.4
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Lead, LeadForm, LeadListParams, LeadStats } from './types'
import { LeadSource, LeadStatus } from './types'
import { getLeadList, createLead, updateLead, deleteLead } from './api'

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
const leads = ref<Lead[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<LeadStats>({
  monthNewCount: 0,
  pendingCount: 0,
  followingCount: 0,
  conversionRate: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ sourceType: '', status: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailLead = ref<Lead | null>(null)

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<LeadForm>({} as LeadForm)
const formLoading = ref(false)
const editingLeadId = ref<number | null>(null)

// ---- 枚举 ----
const sourceMap: StatusMap = {
  [LeadSource.SELF_COLLECTED]: { text: '自主收集', color: 'blue' },
  [LeadSource.EXHIBITION]: { text: '展会', color: 'green' },
  [LeadSource.DEALER]: { text: '经销商', color: 'orange' },
  [LeadSource.WEBSITE]: { text: '官网', color: 'blue' },
  [LeadSource.REFERRAL]: { text: '转介绍', color: 'purple' },
  [LeadSource.OTHER]: { text: '其他', color: 'gray' },
}

const statusMap: StatusMap = {
  [LeadStatus.PENDING]: { text: '待分配', color: 'orange' },
  [LeadStatus.FOLLOWING]: { text: '跟进中', color: 'blue' },
  [LeadStatus.CONVERTED]: { text: '已转意向', color: 'green' },
  [LeadStatus.DISCARDED]: { text: '已废弃', color: 'gray' },
  [LeadStatus.RECYCLED]: { text: '已回收', color: 'red' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'my', label: '我的线索' },
  { key: 'pool', label: '公海池' },
  { key: 'team', label: '团队线索' },
]

const filterConfig = [
  {
    key: 'sourceType',
    label: '来源',
    options: [
      { value: '', label: '全部来源' },
      { value: '1', label: '自主收集' },
      { value: '2', label: '展会' },
      { value: '3', label: '经销商' },
      { value: '4', label: '官网' },
      { value: '5', label: '转介绍' },
      { value: '6', label: '其他' },
    ],
  },
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部状态' },
      { value: 'pending', label: '待分配' },
      { value: 'following', label: '跟进中' },
      { value: 'converted', label: '已转意向' },
      { value: 'discarded', label: '已废弃' },
    ],
  },
]

const tableColumns = [
  { title: '客户', dataIndex: 'customerName', width: '180px' },
  { title: '科室', dataIndex: 'department', width: '100px', mobileHidden: true },
  { title: '产品线', dataIndex: 'productLine', width: '120px' },
  { title: '摘要', dataIndex: 'leadSummary', width: '200px', mobileHidden: true },
  { title: '来源', dataIndex: 'sourceType', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '80px' },
  { title: '归属人', dataIndex: 'assigneeName', width: '80px', mobileHidden: true },
  { title: '创建时间', dataIndex: 'createTime', width: '100px', mobileHidden: true },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'customerName', label: '客户名称', required: true, placeholder: '请输入客户名称' },
  { key: 'department', label: '科室', placeholder: '请输入科室' },
  { key: 'productLine', label: '产品线', required: true, placeholder: '请输入产品线' },
  {
    key: 'leadSummary',
    label: '线索摘要',
    type: 'textarea' as const,
    required: true,
    placeholder: '请输入线索摘要',
  },
  {
    key: 'sourceType',
    label: '线索来源',
    type: 'select' as const,
    required: true,
    options: [
      { value: '1', label: '自主收集' },
      { value: '2', label: '展会' },
      { value: '3', label: '经销商' },
      { value: '4', label: '官网' },
      { value: '5', label: '转介绍' },
      { value: '6', label: '其他' },
    ],
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'pending', label: '待分配' },
      { value: 'following', label: '跟进中' },
      { value: 'converted', label: '已转意向' },
      { value: 'discarded', label: '已废弃' },
    ],
  },
  { key: 'amount', label: '预计金额', type: 'tel' as const, placeholder: '请输入预计金额' },
  { key: 'decisionDate', label: '预计决策时间', placeholder: '如 2026-09-01' },
  { key: 'assigneeName', label: '归属人', placeholder: '请输入归属人' },
  { key: 'followDeadline', label: '跟进截止', placeholder: '如 2026-08-15' },
  { key: 'remark', label: '备注', type: 'textarea' as const, placeholder: '请输入备注' },
]

function emptyForm(): LeadForm {
  return {
    customerName: '',
    department: '',
    productLine: '',
    leadSummary: '',
    sourceType: LeadSource.SELF_COLLECTED,
    status: LeadStatus.PENDING,
    amount: undefined,
    decisionDate: '',
    assigneeName: '',
    followDeadline: '',
    remark: '',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: LeadListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all'
        ? { tabType: activeTab.value as LeadListParams['tabType'] }
        : {}),
      ...(filterValues.value.sourceType
        ? { sourceType: Number(filterValues.value.sourceType) }
        : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
    }
    const result = await getLeadList(params)
    leads.value = result.list
    total.value = result.total
    stats.value = result.stats
  } finally {
    loading.value = false
  }
}

function handleSearch(val: string): void {
  keyword.value = val
  pagination.value.page = 1
  fetchList()
}
function handleSearchInput(): void {
  if (searchTimer.value) clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => handleSearch(keyword.value), 300)
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
function openDetail(lead: Lead): void {
  detailLead.value = lead
  detailVisible.value = true
}
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)

// ---- 表单操作 ----
function openCreate(): void {
  formMode.value = 'create'
  editingLeadId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(lead: Lead): void {
  formMode.value = 'edit'
  editingLeadId.value = lead.leadId
  formData.value = {
    customerName: lead.customerName,
    department: lead.department,
    productLine: lead.productLine,
    leadSummary: lead.leadSummary,
    sourceType: lead.sourceType,
    status: lead.status,
    amount: lead.amount,
    decisionDate: lead.decisionDate,
    assigneeName: lead.assigneeName,
    followDeadline: lead.followDeadline,
    remark: lead.remark,
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: LeadForm = {
      customerName: String(values.customerName || ''),
      department: values.department ? String(values.department) : undefined,
      productLine: String(values.productLine || ''),
      leadSummary: String(values.leadSummary || ''),
      sourceType: Number(values.sourceType) as LeadSource,
      status: String(values.status || LeadStatus.PENDING) as LeadStatus,
      amount: values.amount ? Number(values.amount) : undefined,
      decisionDate: values.decisionDate ? String(values.decisionDate) : undefined,
      assigneeName: values.assigneeName ? String(values.assigneeName) : undefined,
      followDeadline: values.followDeadline ? String(values.followDeadline) : undefined,
      remark: values.remark ? String(values.remark) : undefined,
    }

    if (formMode.value === 'create') {
      await createLead(data)
    } else if (editingLeadId.value !== null) {
      await updateLead(editingLeadId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(lead: Lead): Promise<void> {
  if (!window.confirm(`确定删除线索「${lead.customerName}」吗？`)) return
  await deleteLead(lead.leadId)
  fetchList()
  if (detailLead.value?.leadId === lead.leadId) {
    detailVisible.value = false
    detailLead.value = null
  }
}

function handleFollow(): void {
  window.alert('跟进录入功能将在下一批次实现')
}

function handleConvert(): void {
  window.alert('转意向功能将在下一批次实现')
}
</script>

<template>
  <XqPageLayout title="线索管理">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />录入线索
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="本月新增" :value="stats.monthNewCount" color="primary" />
        <XqKpiCard title="待分配" :value="stats.pendingCount" color="warning" />
        <XqKpiCard title="跟进中" :value="stats.followingCount" color="primary" />
        <XqKpiCard title="转意向率" :value="`${stats.conversionRate}%`" color="success" />
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
          placeholder="搜索客户名称、摘要..."
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ sourceType: '', status: '' })"
        />
      </div>
    </template>
    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="leads"
        :loading="loading"
        row-key="leadId"
        @row-click="(r: Lead) => openDetail(r)"
      >
        <template #sourceType="{ value }">
          <XqStatusBadge :status="value" :status-map="sourceMap" size="small" />
        </template>
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" size="small" />
        </template>
        <template #customerName="{ value, record }">
          <span
            class="text-[var(--primary)] cursor-pointer hover:underline"
            @click.stop="openDetail(record)"
          >
            {{ value }}
          </span>
        </template>
        <template #assigneeName="{ value }">
          <span v-if="value" class="text-[var(--sub)]">{{ value }}</span>
          <span v-else class="text-[var(--placeholder)]">-</span>
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
        :data-source="leads"
        :columns="4"
        :loading="loading"
        @item-click="(r: Lead) => openDetail(r)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.customerName }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] mb-2 line-clamp-2">{{ record.leadSummary }}</p>
            <div class="flex items-center gap-2 mb-2">
              <XqStatusBadge :status="record.sourceType" :status-map="sourceMap" size="small" />
              <span class="text-xs text-[var(--placeholder)]">{{ record.productLine }}</span>
            </div>
            <div
              class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm"
            >
              <span class="text-[var(--sub)]">{{ record.assigneeName || '待分配' }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                record.createTime.slice(0, 10)
              }}</span>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>
    <template #footer>
      <div class="flex items-center justify-between text-sm text-[var(--sub)]">
        <span
          >{{ pagination.page }} / {{ Math.ceil(total / pagination.size) }} 页，共
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

  <div v-if="isMobile" class="fixed bottom-5 right-5 z-50">
    <button
      class="w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center"
      @click="openCreate"
    >
      <XqIcon name="plus" size="24" />
    </button>
  </div>

  <!-- 详情弹窗 -->
  <XqModal
    :visible="detailVisible"
    :title="detailLead?.customerName || '线索详情'"
    width="720px"
    @close="detailVisible = false"
  >
    <div v-if="detailLead" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">线索编码</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailLead.leadCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">状态</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailLead.status" :status-map="statusMap" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">产品线</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailLead.productLine }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">预计金额</span>
            <div class="text-[var(--ink)] mt-0.5">
              {{ detailLead.amount ? '¥' + detailLead.amount.toLocaleString() : '-' }}
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">来源</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailLead.sourceType" :status-map="sourceMap" size="small" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">预计决策</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailLead.decisionDate || '-' }}</div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">线索摘要</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailLead.leadSummary }}</div>
          </div>
        </div>
      </div>
      <div v-if="detailLead.followRecords?.length">
        <h4 class="text-md font-semibold text-[var(--ink)] mb-3">跟进记录</h4>
        <XqTimeline
          :data="
            detailLead.followRecords.map((r) => ({
              time: r.createTime,
              title: `${r.followType} · ${r.creatorName}`,
              content: r.content + (r.nextPlan ? '。下一步：' + r.nextPlan : ''),
              operator: r.creatorName,
            }))
          "
        />
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="openEdit(detailLead!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button class="btn btn-ghost flex-1" @click="handleFollow">
        <XqIcon name="edit" size="14" />录入跟进
      </button>
      <button class="btn btn-primary flex-1" @click="handleConvert">
        <XqIcon name="opportunity" size="14" />转意向
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑线索抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '录入线索' : '编辑线索'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
