<script setup lang="ts">
/**
 * 客户 360° — 列表页
 * 对应《客户360°功能与交互说明.md》v1.3
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { NavTabItem, StatusMap } from '@/types/common'
import type {
  Customer,
  CustomerDetail,
  CustomerForm,
  CustomerListParams,
  CustomerStats,
} from './types'
import { CustomerLevel, HealthLevel, OrgType } from './types'
import {
  getCustomerList,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './api'

const router = useRouter()

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

// ---- 状态 ----
const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'card')
const customers = ref<Customer[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<CustomerStats>({
  customerTotalCount: 0,
  healthyCount: 0,
  riskCount: 0,
  pendingVisitCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref<string>('all')
const filterValues = ref<Record<string, unknown>>({
  regionCode: '',
  customerLevel: '',
  healthLevel: '',
})
const pagination = ref({ page: 1, size: 12 })

// 详情弹窗
const detailVisible = ref(false)
const detailCustomer = ref<CustomerDetail | null>(null)
const detailLoading = ref(false)

async function openDetail(customer: Customer): Promise<void> {
  detailVisible.value = true
  detailLoading.value = true
  try {
    detailCustomer.value = await getCustomerDetail(customer.customerId)
  } finally {
    detailLoading.value = false
  }
}

function closeDetail(): void {
  detailVisible.value = false
  detailCustomer.value = null
}

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<CustomerForm>({} as CustomerForm)
const formLoading = ref(false)
const editingCustomerId = ref<number | null>(null)

// ---- 枚举 ----
const levelMap: StatusMap = {
  [CustomerLevel.三甲]: { text: '三甲', color: 'blue' },
  [CustomerLevel.三乙]: { text: '三乙', color: 'blue' },
  [CustomerLevel.二甲]: { text: '二甲', color: 'green' },
  [CustomerLevel.二乙]: { text: '二乙', color: 'green' },
  [CustomerLevel.一级]: { text: '一级', color: 'gray' },
  [CustomerLevel.基层]: { text: '基层', color: 'gray' },
  [CustomerLevel.民营]: { text: '民营', color: 'purple' },
}

const healthMap: StatusMap = {
  [HealthLevel.HEALTH]: { text: '健康', color: 'green' },
  [HealthLevel.ATTENTION]: { text: '关注', color: 'orange' },
  [HealthLevel.RISK]: { text: '风险', color: 'red' },
  [HealthLevel.DANGER]: { text: '高危', color: 'red' },
}

const orgTypeMap: Record<number, string> = {
  1: '综合医院',
  2: '专科医院',
  3: '妇幼保健院',
  4: '中医院',
  5: 'ICL',
  6: '民营医院',
  7: '其他',
}

// ---- Tabs ----
const tabs: NavTabItem[] = [
  { key: 'all', label: '全部客户' },
  { key: 'my', label: '我的客户' },
  { key: 'risk', label: '风险客户' },
  { key: 'attention', label: '待关注' },
  { key: 'pending', label: '待拜访' },
]

// ---- 筛选 ----
const filterConfig = [
  {
    key: 'regionCode',
    label: '区域',
    options: [
      { value: '', label: '全部区域' },
      { value: '5301', label: '昆明' },
      { value: '5302', label: '曲靖' },
      { value: '5303', label: '玉溪' },
      { value: '5304', label: '红河' },
    ],
  },
  {
    key: 'customerLevel',
    label: '等级',
    options: [
      { value: '', label: '全部等级' },
      { value: '1', label: '三甲' },
      { value: '2', label: '三乙' },
      { value: '3', label: '二甲' },
    ],
  },
  {
    key: 'healthLevel',
    label: '健康度',
    options: [
      { value: '', label: '全部' },
      { value: 'health', label: '健康' },
      { value: 'attention', label: '关注' },
      { value: 'risk', label: '风险' },
      { value: 'danger', label: '高危' },
    ],
  },
]

const tableColumns = [
  { title: '医院名称', dataIndex: 'customerName', width: '200px' },
  { title: '等级', dataIndex: 'customerLevel', width: '70px' },
  { title: '区域', dataIndex: 'regionName', width: '70px', mobileHidden: true },
  { title: '健康度', dataIndex: 'healthScore', width: '90px' },
  { title: '科室', dataIndex: 'deptCount', width: '60px', mobileHidden: true },
  { title: '装机', dataIndex: 'equipmentCount', width: '60px', mobileHidden: true },
  { title: '意向', dataIndex: 'intentionCount', width: '60px' },
  { title: '负责人', dataIndex: 'ownerName', width: '80px', mobileHidden: true },
  { title: '最近交互', dataIndex: 'lastContactTime', width: '100px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

// ---- 表单字段 ----
const formFields = [
  { key: 'customerName', label: '医院名称', required: true, placeholder: '请输入医院名称' },
  {
    key: 'customerLevel',
    label: '医院等级',
    type: 'select' as const,
    required: true,
    placeholder: '请选择医院等级',
    options: [
      { value: '1', label: '三甲' },
      { value: '2', label: '三乙' },
      { value: '3', label: '二甲' },
      { value: '4', label: '二乙' },
      { value: '5', label: '一级' },
      { value: '6', label: '基层' },
      { value: '7', label: '民营' },
    ],
  },
  {
    key: 'orgType',
    label: '机构类型',
    type: 'select' as const,
    required: true,
    placeholder: '请选择机构类型',
    options: [
      { value: '1', label: '综合医院' },
      { value: '2', label: '专科医院' },
      { value: '3', label: '妇幼保健院' },
      { value: '4', label: '中医院' },
      { value: '5', label: 'ICL' },
      { value: '6', label: '民营医院' },
      { value: '7', label: '其他' },
    ],
  },
  {
    key: 'regionCode',
    label: '所属区域',
    type: 'select' as const,
    required: true,
    placeholder: '请选择所属区域',
    options: [
      { value: '5301', label: '昆明' },
      { value: '5302', label: '曲靖' },
      { value: '5303', label: '玉溪' },
      { value: '5304', label: '红河' },
      { value: '5305', label: '昭通' },
      { value: '5306', label: '文山' },
      { value: '5307', label: '普洱' },
      { value: '5308', label: '保山' },
    ],
  },
  { key: 'bedCount', label: '床位数', type: 'tel' as const, placeholder: '请输入床位数' },
  {
    key: 'healthScore',
    label: '健康评分',
    type: 'tel' as const,
    placeholder: '请输入 0-100 的健康评分',
  },
  { key: 'ownerName', label: '负责人', placeholder: '请输入负责人姓名' },
]

function emptyForm(): CustomerForm {
  return {
    customerName: '',
    customerLevel: CustomerLevel.三甲,
    orgType: OrgType.综合医院,
    regionCode: '5301',
    regionName: '昆明',
    bedCount: 0,
    ownerId: 1,
    ownerName: '张三',
    healthScore: 60,
    healthLevel: HealthLevel.ATTENTION,
  }
}

// ---- 数据 ----
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: CustomerListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all'
        ? { tabType: activeTab.value as CustomerListParams['tabType'] }
        : {}),
      ...(filterValues.value.regionCode
        ? { regionCode: String(filterValues.value.regionCode) }
        : {}),
      ...(filterValues.value.customerLevel
        ? { customerLevel: Number(filterValues.value.customerLevel) }
        : {}),
      ...(filterValues.value.healthLevel
        ? { healthLevel: String(filterValues.value.healthLevel) }
        : {}),
    }
    const result = await getCustomerList(params)
    customers.value = result.list
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

function goDetail(customerId: number): void {
  router.push(`/customer/${customerId}`)
}

function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)

function healthColor(score: number): string {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

function relationText(level: string): string {
  const map: Record<string, string> = {
    high: '紧密',
    medium: '一般',
    low: '疏远',
  }
  return map[level] || level
}

function attitudeText(attitude: string): string {
  const map: Record<string, string> = {
    support: '支持',
    neutral: '中立',
    oppose: '反对',
    unknown: '未知',
  }
  return map[attitude] || attitude
}

// ---- 表单操作 ----
function openCreate(): void {
  formMode.value = 'create'
  editingCustomerId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(record: Customer): void {
  formMode.value = 'edit'
  editingCustomerId.value = record.customerId
  formData.value = {
    customerName: record.customerName,
    customerLevel: record.customerLevel,
    orgType: record.orgType,
    regionCode: record.regionCode,
    regionName: record.regionName,
    bedCount: record.bedCount,
    ownerId: record.ownerId,
    ownerName: record.ownerName,
    healthScore: record.healthScore,
    healthLevel: record.healthLevel,
  }
  formVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: CustomerForm = {
      customerName: String(values.customerName || ''),
      customerLevel: Number(values.customerLevel) as CustomerLevel,
      orgType: Number(values.orgType) as OrgType,
      regionCode: String(values.regionCode || ''),
      regionName: String(values.regionName || ''),
      bedCount: Number(values.bedCount) || 0,
      ownerId: Number(values.ownerId) || 1,
      ownerName: String(values.ownerName || ''),
      healthScore: Number(values.healthScore) || 60,
      healthLevel: HealthLevel.ATTENTION,
    }

    if (formMode.value === 'create') {
      await createCustomer(data)
    } else if (editingCustomerId.value !== null) {
      await updateCustomer(editingCustomerId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(record: Customer): Promise<void> {
  if (!window.confirm(`确定删除客户「${record.customerName}」吗？`)) return
  await deleteCustomer(record.customerId)
  fetchList()
}
</script>

<template>
  <XqPageLayout title="客户 360°">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        新建客户
      </XqButton>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="客户总数" :value="stats.customerTotalCount" color="primary" />
        <XqKpiCard title="健康客户" :value="stats.healthyCount" color="success" />
        <XqKpiCard title="风险客户" :value="stats.riskCount" color="danger" />
        <XqKpiCard title="今日待拜访" :value="stats.pendingVisitCount" color="warning" />
      </div>
    </template>

    <!-- Tab + 视图切换 -->
    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqViewSwitch :value="viewMode" @change="handleViewChange" />
    </template>

    <!-- 搜索 + 筛选 -->
    <template #filter>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <XqSearchBar
          v-model="keyword"
          placeholder="搜索医院名称 / 客户编码"
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ regionCode: '', customerLevel: '', healthLevel: '' })"
        />
      </div>
    </template>

    <!-- 表格视图 -->
    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="customers"
        :loading="loading"
        row-key="customerId"
        @row-click="(c: Customer) => openDetail(c)"
      >
        <template #customerName="{ value, record }">
          <span
            class="text-[var(--primary)] cursor-pointer hover:underline"
            @click.stop="openDetail(record)"
          >
            {{ value }}
          </span>
        </template>
        <template #customerLevel="{ value }">
          <XqStatusBadge :status="value" :status-map="levelMap" size="small" />
        </template>
        <template #healthScore="{ value }">
          <span class="font-semibold" :style="{ color: healthColor(Number(value)) }">{{
            value
          }}</span>
        </template>
        <template #intentionCount="{ value }">
          <span v-if="Number(value) > 0" class="text-[var(--primary)] font-medium">{{
            value
          }}</span>
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

      <!-- 卡片视图 -->
      <XqCardGrid
        v-else
        :data-source="customers"
        :columns="4"
        :loading="loading"
        @item-click="(c: Customer) => openDetail(c)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.customerName }}
              </h3>
              <XqStatusBadge :status="record.healthLevel" :status-map="healthMap" size="small" />
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <XqStatusBadge :status="record.customerLevel" :status-map="levelMap" size="small" />
              <span class="badge badge-gray text-[0.714rem]">{{
                orgTypeMap[record.orgType] || ''
              }}</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-[var(--sub)] mb-3">
              <span>{{ record.regionName }}</span>
              <span>{{ record.bedCount }} 床</span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-[var(--line-light)]">
              <div class="flex items-center gap-4 text-sm">
                <span class="text-[var(--sub)]"
                  >科室
                  <span class="text-[var(--ink)] font-medium">{{ record.deptCount }}</span></span
                >
                <span class="text-[var(--sub)]"
                  >装机
                  <span class="text-[var(--ink)] font-medium">{{
                    record.equipmentCount
                  }}</span></span
                >
                <span v-if="record.intentionCount" class="text-[var(--primary)] font-medium"
                  >{{ record.intentionCount }} 个意向</span
                >
              </div>
              <span class="text-xs text-[var(--placeholder)]">
                {{ record.lastContactTime || '暂无交互' }}
              </span>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>

    <!-- 分页 -->
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

  <!-- 移动端悬浮按钮 -->
  <div v-if="isMobile" class="fixed bottom-5 right-5 z-50">
    <button
      class="w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center"
      @click="openCreate"
    >
      <XqIcon name="plus" size="24" />
    </button>
  </div>

  <!-- 客户概览弹窗 -->
  <XqModal
    :visible="detailVisible"
    :title="detailCustomer?.customerName || '客户详情'"
    width="720px"
    @close="closeDetail"
  >
    <div v-if="detailLoading" class="flex items-center justify-center py-12 text-[var(--sub)]">
      <XqIcon name="loading" size="24" class="animate-spin mr-2" />
      加载客户摘要中…
    </div>
    <div v-else-if="detailCustomer" class="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
      <!-- 头部名片 -->
      <div class="card">
        <div class="flex items-start gap-4">
          <div
            class="w-16 h-16 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-2xl font-semibold flex-shrink-0"
          >
            {{ detailCustomer.customerName.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <h3 class="text-lg font-semibold text-[var(--ink)]">
                {{ detailCustomer.customerName }}
              </h3>
              <XqStatusBadge
                :status="detailCustomer.customerLevel"
                :status-map="levelMap"
                size="small"
              />
              <XqStatusBadge
                :status="detailCustomer.healthLevel"
                :status-map="healthMap"
                size="small"
              />
            </div>
            <div class="text-sm text-[var(--sub)] mb-2">
              {{ orgTypeMap[detailCustomer.orgType] }} · {{ detailCustomer.regionName }} ·
              {{ detailCustomer.bedCount }} 床 · 编码 {{ detailCustomer.customerCode }}
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span class="text-[var(--sub)]">负责人：{{ detailCustomer.ownerName }}</span>
              <span class="text-[var(--sub)]"
                >健康评分：<span
                  class="font-semibold"
                  :style="{ color: healthColor(detailCustomer.healthScore) }"
                  >{{ detailCustomer.healthScore }}</span
                ></span
              >
              <span class="text-[var(--sub)]"
                >最近交互：{{ detailCustomer.lastContactTime || '暂无' }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 客户资产 -->
      <div class="card">
        <h4 class="font-semibold text-[var(--ink)] mb-3">客户资产</h4>
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-xl font-bold text-[var(--primary)]">
              {{ detailCustomer.deptCount }}
            </div>
            <div class="text-xs text-[var(--sub)]">科室</div>
          </div>
          <div>
            <div class="text-xl font-bold text-[var(--primary)]">
              {{ detailCustomer.equipmentCount }}
            </div>
            <div class="text-xs text-[var(--sub)]">装机</div>
          </div>
          <div>
            <div class="text-xl font-bold text-[var(--primary)]">
              {{ detailCustomer.intentionCount }}
            </div>
            <div class="text-xs text-[var(--sub)]">意向</div>
          </div>
          <div>
            <div class="text-xl font-bold text-[var(--primary)]">
              {{ detailCustomer.reagents?.length || 0 }}
            </div>
            <div class="text-xs text-[var(--sub)]">试剂</div>
          </div>
        </div>
      </div>

      <!-- 预警与机会 -->
      <div v-if="detailCustomer.alerts?.length" class="card">
        <h4 class="font-semibold text-[var(--ink)] mb-3">预警与提醒</h4>
        <div class="space-y-2">
          <div
            v-for="(alert, idx) in detailCustomer.alerts"
            :key="idx"
            class="flex items-start gap-2 text-sm"
          >
            <span
              class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              :class="alert.severity === 'danger' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'"
            />
            <span class="text-[var(--ink)]">{{ alert.message }}</span>
            <span class="text-[var(--placeholder)] text-xs ml-auto">{{ alert.createdAt }}</span>
          </div>
        </div>
      </div>

      <div v-if="detailCustomer.crossSellOpportunities?.length" class="card">
        <h4 class="font-semibold text-[var(--ink)] mb-3">交叉销售机会</h4>
        <div class="space-y-2">
          <div
            v-for="(opp, idx) in detailCustomer.crossSellOpportunities"
            :key="idx"
            class="flex items-start gap-2 text-sm"
          >
            <span
              class="px-1.5 py-0.5 rounded text-xs flex-shrink-0"
              :class="
                opp.matchLevel === 'high'
                  ? 'bg-[var(--danger-light)] text-[var(--danger)]'
                  : opp.matchLevel === 'medium'
                    ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                    : 'bg-[var(--success-light)] text-[var(--success)]'
              "
            >
              {{ opp.matchLevel === 'high' ? '高' : opp.matchLevel === 'medium' ? '中' : '低' }}
            </span>
            <div class="min-w-0">
              <div class="font-medium text-[var(--ink)]">{{ opp.title }}</div>
              <div class="text-[var(--sub)] truncate">{{ opp.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键决策人 -->
      <div v-if="detailCustomer.decisionContacts?.length" class="card">
        <h4 class="font-semibold text-[var(--ink)] mb-3">
          关键决策人（{{ detailCustomer.decisionContacts.length }}）
        </h4>
        <div class="space-y-3">
          <div
            v-for="contact in detailCustomer.decisionContacts.slice(0, 3)"
            :key="contact.contactId"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-semibold"
              >
                {{ contact.contactName.charAt(0) }}
              </div>
              <div>
                <div class="text-sm font-medium text-[var(--ink)]">
                  {{ contact.contactName }}
                  <span class="text-xs text-[var(--sub)] font-normal"
                    >{{ contact.contactTitle }} · {{ contact.deptName }}</span
                  >
                </div>
                <div class="text-xs text-[var(--sub)]">
                  关系：{{ relationText(contact.relationLevel) }} · 态度：{{
                    attitudeText(contact.attitude)
                  }}
                </div>
              </div>
            </div>
            <div class="text-xs text-[var(--sub)]">
              {{ contact.lastContactTime ? `最近联系 ${contact.lastContactTime}` : '暂无联系' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最近动态 -->
      <div v-if="detailCustomer.timeline?.length" class="card">
        <h4 class="font-semibold text-[var(--ink)] mb-3">最近动态</h4>
        <div class="space-y-3 relative pl-3">
          <div
            v-for="(item, idx) in detailCustomer.timeline.slice(0, 4)"
            :key="idx"
            class="relative pl-5 pb-1 border-l border-[var(--line)] last:border-0"
          >
            <div
              class="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-white"
            />
            <div class="text-sm font-medium text-[var(--ink)]">{{ item.title }}</div>
            <div class="text-xs text-[var(--sub)] mt-0.5 line-clamp-2">{{ item.content }}</div>
            <div class="text-xs text-[var(--placeholder)] mt-1">
              {{ item.operator }} · {{ item.time }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="closeDetail">关闭</button>
      <button class="btn btn-primary flex-1" @click="goDetail(detailCustomer!.customerId)">
        <XqIcon name="customer" size="14" />查看完整档案
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑客户抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建客户' : '编辑客户'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
