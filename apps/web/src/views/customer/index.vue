<script setup lang="ts">
/**
 * 客户 360° — 列表页
 * 对应《客户360°功能与交互说明.md》v1.3
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Customer, CustomerListParams, CustomerStats } from './types'
import { CustomerLevel, HealthLevel, OrgType } from './types'
import { getCustomerList } from './api'

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
  { title: '医院名称', dataIndex: 'customerName', width: '220px' },
  { title: '等级', dataIndex: 'customerLevel', width: '70px' },
  { title: '区域', dataIndex: 'regionName', width: '70px', mobileHidden: true },
  { title: '健康度', dataIndex: 'healthScore', width: '90px' },
  { title: '科室', dataIndex: 'deptCount', width: '60px', mobileHidden: true },
  { title: '装机', dataIndex: 'equipmentCount', width: '60px', mobileHidden: true },
  { title: '意向', dataIndex: 'intentionCount', width: '60px' },
  { title: '负责人', dataIndex: 'ownerName', width: '80px', mobileHidden: true },
  { title: '最近交互', dataIndex: 'lastContactTime', width: '100px' },
]

// ---- 数据 ----
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: CustomerListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value as any } : {}),
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
</script>

<template>
  <XqPageLayout title="客户 360°">
    <template #actions>
      <XqButton type="primary">
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
        @row-click="(c: Customer) => goDetail(c.customerId)"
      >
        <template #customerName="{ value, record }">
          <span
            class="text-[var(--primary)] cursor-pointer hover:underline"
            @click.stop="goDetail(record.customerId)"
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
      </XqDataTable>

      <!-- 卡片视图 -->
      <XqCardGrid
        v-else
        :data-source="customers"
        :columns="4"
        :loading="loading"
        @item-click="(c: Customer) => goDetail(c.customerId)"
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
    >
      <XqIcon name="plus" size="24" />
    </button>
  </div>
</template>
