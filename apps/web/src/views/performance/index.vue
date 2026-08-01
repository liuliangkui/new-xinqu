<script setup lang="ts">
/**
 * 目标绩效 — 多维绩效看板
 * 对应《目标绩效功能与交互说明.md》v1.0
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type {
  PerformanceItem,
  PerformanceListParams,
  PerformanceOverview,
  PerformanceTabType,
  PerformancePeriod,
  PerformanceIndicator,
} from './types'
import { getPerformanceOverview, getPerformanceList } from './api'

const isMobile = ref(false)
function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchOverview()
  fetchList()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// ---- 状态 ----
const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'list')
const items = ref<PerformanceItem[]>([])
const total = ref(0)
const loading = ref(false)
const overview = ref<PerformanceOverview | null>(null)
const overviewLoading = ref(false)

const activeTab = ref<PerformanceTabType>('team')
const period = ref<PerformancePeriod>('month')
const indicator = ref<PerformanceIndicator>('revenue')
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const pagination = ref({ page: 1, size: 12 })

// ---- Tabs ----
const tabs: NavTabItem[] = [
  { key: 'my', label: '我的绩效' },
  { key: 'team', label: '团队绩效' },
  { key: 'region', label: '区域绩效' },
  { key: 'product', label: '产品绩效' },
  { key: 'channel', label: '渠道绩效' },
]

// ---- 枚举 ----
const periodMap: Record<PerformancePeriod, string> = {
  month: '本月',
  quarter: '本季度',
  year: '本年度',
}

const indicatorMap: Record<PerformanceIndicator, string> = {
  revenue: '销售额',
  collection: '回款额',
  quantity: '装机量',
}

const statusMap: StatusMap = {
  normal: { text: '正常', color: 'green' },
  attention: { text: '关注', color: 'orange' },
  risk: { text: '风险', color: 'red' },
}

// ---- 筛选 ----
const filterConfig = [
  {
    key: 'period',
    label: '周期',
    options: [
      { value: 'month', label: '本月' },
      { value: 'quarter', label: '本季度' },
      { value: 'year', label: '本年度' },
    ],
  },
  {
    key: 'indicator',
    label: '指标',
    options: [
      { value: 'revenue', label: '销售额' },
      { value: 'collection', label: '回款额' },
      { value: 'quantity', label: '装机量' },
    ],
  },
]

const filterValues = computed(() => ({
  period: period.value,
  indicator: indicator.value,
}))

const tableColumns = [
  { title: '排名', dataIndex: 'rank', width: '60px' },
  { title: '对象', dataIndex: 'name', width: '180px' },
  { title: '目标值', dataIndex: 'target', width: '120px' },
  { title: '完成值', dataIndex: 'actual', width: '120px' },
  { title: '达成率', dataIndex: 'achievementRate', width: '90px' },
  { title: '缺口', dataIndex: 'gap', width: '120px', mobileHidden: true },
  { title: '同比', dataIndex: 'yoy', width: '80px', mobileHidden: true },
  { title: '环比', dataIndex: 'mom', width: '80px', mobileHidden: true },
  { title: '状态', dataIndex: 'status', width: '80px' },
]

// ---- 数据 ----
async function fetchOverview(): Promise<void> {
  overviewLoading.value = true
  try {
    overview.value = await getPerformanceOverview({
      period: period.value,
      indicator: indicator.value,
    })
  } finally {
    overviewLoading.value = false
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: PerformanceListParams = {
      page: pagination.value.page,
      size: pagination.value.size,
      keyword: keyword.value,
      tabType: activeTab.value,
      period: period.value,
      indicator: indicator.value,
    }
    const result = await getPerformanceList(params)
    items.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function refresh(): void {
  pagination.value.page = 1
  fetchOverview()
  fetchList()
}

function handleTabChange(key: string | number): void {
  activeTab.value = String(key) as PerformanceTabType
  pagination.value.page = 1
  fetchList()
}

function handleViewChange(val: 'card' | 'list'): void {
  viewMode.value = val
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

function handleFilterChange(values: Record<string, unknown>): void {
  period.value = (values.period as PerformancePeriod) || 'month'
  indicator.value = (values.indicator as PerformanceIndicator) || 'revenue'
  refresh()
}

function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}

const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)

// ---- 格式化 ----
function formatAmount(value: number): string {
  if (indicator.value === 'quantity') return value.toLocaleString()
  if (Math.abs(value) >= 100000000) return `¥${(value / 100000000).toFixed(2)}亿`
  if (Math.abs(value) >= 10000) return `¥${(value / 10000).toFixed(2)}万`
  return `¥${value.toLocaleString()}`
}

function formatPercent(value: number, suffix = '%'): string {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}${suffix}`
}

function trendColor(value: number): string {
  return value >= 0 ? 'var(--success)' : 'var(--danger)'
}

function statusColor(rate: number): string {
  if (rate >= 80) return 'var(--success)'
  if (rate >= 50) return 'var(--warning)'
  return 'var(--danger)'
}

// ---- 图表数据 ----
const trendMax = computed(() => {
  if (!overview.value?.trend.length) return 1
  return Math.max(...overview.value.trend.map((t) => Math.max(t.target, t.actual)), 1)
})

const analysisItems = computed(() => {
  const list: string[] = []
  if (!overview.value) return list
  const { achievementRate, underperformCount, yoy, mom } = overview.value
  if (achievementRate < 80) {
    list.push(
      `${periodMap[period.value]}整体达成率为 ${achievementRate.toFixed(1)}%，低于 80% 健康线，建议召开复盘会并督办落后对象。`,
    )
  } else {
    list.push(
      `${periodMap[period.value]}整体达成率为 ${achievementRate.toFixed(1)}%，处于健康区间，继续保持并关注环比变化。`,
    )
  }
  if (underperformCount > 0) {
    list.push(`当前共有 ${underperformCount} 个未达标对象，请优先跟进风险项并填写补缺口计划。`)
  }
  if (yoy < 0) {
    list.push(`同比下降 ${Math.abs(yoy).toFixed(1)}%，需排查市场环境、客户流失或目标设定合理性。`)
  } else if (mom < 0) {
    list.push(`环比下滑 ${Math.abs(mom).toFixed(1)}%，建议加大拜访覆盖与意向推进力度。`)
  }
  return list
})

function openExport(): void {
  // eslint-disable-next-line no-alert
  window.alert('绩效报告导出功能将在后续批次实现')
}
</script>

<template>
  <XqPageLayout title="目标绩效">
    <template #actions>
      <XqButton type="primary" @click="openExport">
        <XqIcon name="download" size="14" />
        导出报告
      </XqButton>
    </template>

    <!-- 全局指标 -->
    <template #stats>
      <div v-if="overview" class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <XqKpiCard
          title="目标总额"
          :value="formatAmount(overview.targetTotal)"
          color="primary"
          :loading="overviewLoading"
        />
        <XqKpiCard
          title="完成总额"
          :value="formatAmount(overview.actualTotal)"
          color="success"
          :loading="overviewLoading"
        />
        <XqKpiCard
          title="整体达成率"
          :value="formatPercent(overview.achievementRate)"
          color="warning"
          :loading="overviewLoading"
        />
        <XqKpiCard
          title="同比增长"
          :value="`${overview.yoy >= 0 ? '+' : ''}${overview.yoy.toFixed(1)}%`"
          :color="overview.yoy >= 0 ? 'success' : 'danger'"
          :loading="overviewLoading"
        />
        <XqKpiCard
          title="未达标项"
          :value="overview.underperformCount"
          color="danger"
          :loading="overviewLoading"
        />
      </div>
    </template>

    <!-- Tab + 视图 -->
    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqViewSwitch :value="viewMode" @change="handleViewChange" />
    </template>

    <!-- 筛选 -->
    <template #filter>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <XqSearchBar
          v-model="keyword"
          placeholder="搜索对象名称..."
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar :filters="filterConfig" :values="filterValues" @change="handleFilterChange" />
      </div>
    </template>

    <!-- 图表区 -->
    <template #content>
      <div v-if="overview" class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <!-- 月度达成趋势 -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[var(--ink)]">月度达成趋势</h3>
            <span class="text-xs text-[var(--sub)]"
              >{{ periodMap[period] }}{{ indicatorMap[indicator] }}</span
            >
          </div>
          <div class="flex items-end gap-2 h-40 px-2">
            <div
              v-for="(point, index) in overview.trend"
              :key="index"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <div class="w-full flex items-end justify-center gap-1 h-28">
                <div
                  class="w-2 sm:w-3 rounded-t-sm bg-[var(--line)]"
                  :style="{ height: `${(point.target / trendMax) * 100}%` }"
                  title="目标"
                />
                <div
                  class="w-2 sm:w-3 rounded-t-sm bg-[var(--primary)]"
                  :style="{ height: `${(point.actual / trendMax) * 100}%` }"
                  title="完成"
                />
              </div>
              <span class="text-[10px] text-[var(--sub)] truncate w-full text-center">{{
                point.label
              }}</span>
            </div>
          </div>
          <div class="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--sub)]">
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-[var(--line)]" />目标</span
            >
            <span class="flex items-center gap-1"
              ><span class="w-2 h-2 rounded-full bg-[var(--primary)]" />完成</span
            >
          </div>
        </div>

        <!-- 整体达成率 -->
        <div class="card flex flex-col items-center justify-center">
          <h3 class="font-semibold text-[var(--ink)] mb-4">整体达成率</h3>
          <div
            class="relative w-32 h-32 rounded-full flex items-center justify-center"
            :style="{
              background: `conic-gradient(var(--primary) ${overview.achievementRate * 3.6}deg, var(--line-light) 0deg)`,
            }"
          >
            <div
              class="absolute inset-2 rounded-full bg-[var(--card)] flex flex-col items-center justify-center"
            >
              <span class="text-2xl font-bold text-[var(--primary)]"
                >{{ overview.achievementRate.toFixed(1) }}%</span
              >
              <span class="text-xs text-[var(--sub)]">{{ indicatorMap[indicator] }}</span>
            </div>
          </div>
          <div class="mt-4 text-sm text-[var(--sub)]">
            缺口 <span class="font-medium text-[var(--ink)]">{{ formatAmount(overview.gap) }}</span>
          </div>
        </div>
      </div>

      <!-- 明细 -->
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      >
        <template #rank="{ value }">
          <span
            class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold"
            :class="
              value <= 3 ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'text-[var(--sub)]'
            "
            >{{ value }}</span
          >
        </template>
        <template #target="{ value }">
          <span class="text-[var(--ink)] font-medium">{{ formatAmount(value) }}</span>
        </template>
        <template #actual="{ value }">
          <span class="text-[var(--ink)] font-medium">{{ formatAmount(value) }}</span>
        </template>
        <template #achievementRate="{ value }">
          <span class="font-semibold" :style="{ color: statusColor(Number(value)) }"
            >{{ value.toFixed(1) }}%</span
          >
        </template>
        <template #gap="{ value }">
          <span class="text-[var(--danger)]">{{ formatAmount(value) }}</span>
        </template>
        <template #yoy="{ value }">
          <span :style="{ color: trendColor(Number(value)) }"
            >{{ value >= 0 ? '+' : '' }}{{ value.toFixed(1) }}%</span
          >
        </template>
        <template #mom="{ value }">
          <span :style="{ color: trendColor(Number(value)) }"
            >{{ value >= 0 ? '+' : '' }}{{ value.toFixed(1) }}%</span
          >
        </template>
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" size="small" />
        </template>
      </XqDataTable>

      <XqCardGrid v-else :data-source="items" :columns="isMobile ? 1 : 4" :loading="loading">
        <template #item="{ record }">
          <div class="card card-hover">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.name }}
              </h3>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{
                  color: statusColor(record.achievementRate),
                  backgroundColor: statusColor(record.achievementRate) + '1A',
                }"
                >{{ record.achievementRate.toFixed(1) }}%</span
              >
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <div class="text-xs text-[var(--placeholder)]">目标值</div>
                <div class="text-[var(--ink)] font-medium">{{ formatAmount(record.target) }}</div>
              </div>
              <div>
                <div class="text-xs text-[var(--placeholder)]">完成值</div>
                <div class="text-[var(--ink)] font-medium">{{ formatAmount(record.actual) }}</div>
              </div>
              <div>
                <div class="text-xs text-[var(--placeholder)]">缺口</div>
                <div class="text-[var(--danger)]">{{ formatAmount(record.gap) }}</div>
              </div>
              <div>
                <div class="text-xs text-[var(--placeholder)]">同比</div>
                <div :style="{ color: trendColor(record.yoy) }">
                  {{ record.yoy >= 0 ? '+' : '' }}{{ record.yoy.toFixed(1) }}%
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-[var(--line-light)]">
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
              <span class="text-xs text-[var(--placeholder)]">排名 {{ record.rank }}</span>
            </div>
          </div>
        </template>
      </XqCardGrid>

      <!-- 分析结论 -->
      <div
        v-if="analysisItems.length"
        class="card mt-5 bg-[var(--warning-bg)] border-[var(--warning)]"
      >
        <h4 class="font-semibold text-[var(--warning)] mb-2 flex items-center gap-2">
          <XqIcon name="info" size="14" />
          AI 分析结论
        </h4>
        <ul class="list-disc list-inside text-sm text-[var(--ink)] space-y-1">
          <li v-for="(item, idx) in analysisItems" :key="idx">{{ item }}</li>
        </ul>
      </div>
    </template>

    <!-- 分页 -->
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
</template>
