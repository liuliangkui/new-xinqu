<script setup lang="ts">
/**
 * 经营驾驶舱 — 高管综合看板
 */
import { ref, onMounted } from 'vue'
import type { DashboardOverview, DashboardPeriod, AlertLevel } from './types'
import { getDashboardOverview } from './api'

const period = ref<DashboardPeriod>('month')
const regionCode = ref('')
const loading = ref(false)
const overview = ref<DashboardOverview | null>(null)

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年' },
]

const tabs = [
  { key: 'overview', label: '综合看板', route: '/dashboard' },
  { key: 'performance', label: '目标绩效', route: '/performance' },
  { key: 'funnel', label: '销售漏斗', route: '/dashboard/funnel' },
  { key: 'dealer', label: '经销商协同', route: '/dealer' },
  { key: 'compliance', label: '合规风控', route: '/compliance' },
]

const activeTab = ref('overview')

const formatCurrency = (v: number) => `¥${(v / 10000).toFixed(0)}万`
const formatPercent = (v: number) => `${v}%`

function rateText(value: number, target: number): string {
  if (!target) return '0%'
  return `${((value / target) * 100).toFixed(1)}%`
}

function alertClass(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    risk: 'bg-red-50 text-red-600 border-red-100',
    warn: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    info: 'bg-blue-50 text-blue-600 border-blue-100',
  }
  return map[level]
}

function alertBadge(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    risk: '紧急',
    warn: '关注',
    info: '提示',
  }
  return map[level]
}

async function fetchOverview() {
  loading.value = true
  try {
    overview.value = await getDashboardOverview({
      period: period.value,
      regionCode: regionCode.value || undefined,
    })
  } finally {
    loading.value = false
  }
}

function switchTab(tab: (typeof tabs)[number]) {
  activeTab.value = tab.key
  if (tab.route !== '/dashboard') {
    window.location.href = tab.route
  }
}

const trendData = [42, 55, 48, 62, 75, 68, 82, 90, 86, 95, 88, 102]
const barData = [30, 45, 60, 50, 75, 55]

onMounted(fetchOverview)
</script>

<template>
  <XqPageLayout title="dashboard" :show-stats="false" :show-filter="false" padding="16px">
    <template #title>
      <span class="section-title">经营驾驶舱</span>
    </template>

    <template #actions>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost text-sm flex items-center gap-1">
          <XqIcon name="message" size="16" />
          <span>AI 问数</span>
        </button>
        <button class="btn btn-ghost text-sm relative flex items-center gap-1">
          <XqIcon name="bell" size="16" />
          <span>预警</span>
          <span
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
          >
            {{ overview?.alerts.length ?? 0 }}
          </span>
        </button>
      </div>
    </template>

    <template #content>
      <div v-if="loading" class="py-20 text-center text-[var(--sub)]">加载中...</div>

      <div v-else-if="overview" class="space-y-4">
        <!-- 全局健康度 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-5">
          <div class="flex flex-col lg:flex-row lg:items-center gap-6">
            <div class="flex items-center gap-4">
              <div class="relative w-20 h-20 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    class="text-[var(--gray-bg)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                  <path
                    class="text-[var(--success)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    :stroke-dasharray="`${overview.healthScore}, 100`"
                  />
                </svg>
                <span class="absolute text-xl font-bold text-[var(--ink)]">{{
                  overview.healthScore
                }}</span>
              </div>
              <div>
                <p class="text-sm text-[var(--sub)]">经营健康度</p>
                <p class="text-lg font-semibold text-[var(--ink)]">健康</p>
              </div>
            </div>

            <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-3 rounded-lg bg-[var(--bg)]">
                <p class="text-xs text-[var(--sub)]">本月收入</p>
                <p class="text-lg font-semibold text-[var(--ink)]">
                  {{ formatCurrency(overview.kpis.revenue.value) }}
                </p>
                <p class="text-xs text-[var(--sub)]">
                  达成
                  {{ rateText(overview.kpis.revenue.value, overview.kpis.revenue.target ?? 0) }}
                </p>
              </div>
              <div class="p-3 rounded-lg bg-[var(--bg)]">
                <p class="text-xs text-[var(--sub)]">本月回款</p>
                <p class="text-lg font-semibold text-[var(--ink)]">
                  {{ formatCurrency(overview.kpis.receivable.value) }}
                </p>
                <p class="text-xs text-[var(--sub)]">
                  达成
                  {{
                    rateText(overview.kpis.receivable.value, overview.kpis.receivable.target ?? 0)
                  }}
                </p>
              </div>
              <div class="p-3 rounded-lg bg-[var(--bg)]">
                <p class="text-xs text-[var(--sub)]">新增意向</p>
                <p class="text-lg font-semibold text-[var(--ink)]">
                  {{ overview.kpis.intentionCount }} 条
                </p>
                <p class="text-xs text-[var(--sub)]">同比 +15%</p>
              </div>
              <div class="p-3 rounded-lg bg-[var(--bg)]">
                <p class="text-xs text-[var(--sub)]">拜访合规率</p>
                <p class="text-lg font-semibold text-[var(--ink)]">
                  {{ formatPercent(overview.kpis.visitComplianceRate) }}
                </p>
                <p class="text-xs text-[var(--sub)]">环比 +2%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 主题导航 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
              "
              @click="switchTab(tab)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div
            class="flex items-center gap-1 bg-[var(--card)] rounded-lg border border-[var(--line)] p-1"
          >
            <button
              v-for="p in periods"
              :key="p.value"
              class="px-3 py-1.5 text-xs rounded-md transition-colors"
              :class="
                period === p.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
              "
              @click="((period = p.value), fetchOverview())"
            >
              {{ p.label }}
            </button>
          </div>
          <select
            v-model="regionCode"
            class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            @change="fetchOverview"
          >
            <option value="">全国</option>
            <option value="east">华东区</option>
            <option value="south">华南区</option>
            <option value="north">华北区</option>
            <option value="southwest">西南区</option>
          </select>
          <span class="text-xs text-[var(--sub)] ml-auto">
            数据更新于 {{ overview.updateTime }}
          </span>
        </div>

        <!-- 指标卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- 收入趋势 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">收入趋势</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="h-24 flex items-end gap-1">
              <div
                v-for="(h, i) in trendData"
                :key="i"
                class="flex-1 rounded-t bg-[var(--primary)] opacity-60 hover:opacity-100 transition-opacity"
                :style="{ height: `${(h / 120) * 100}%` }"
              />
            </div>
            <p class="text-xs text-[var(--sub)] mt-2">近 12 个月收入趋势</p>
          </div>

          <!-- 回款达成 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">回款达成</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="flex items-center gap-4">
              <div class="relative w-16 h-16 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    class="text-[var(--gray-bg)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="text-[var(--success)]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    :stroke-dasharray="`${(overview.kpis.receivable.value / (overview.kpis.receivable.target || 1)) * 100}, 100`"
                  />
                </svg>
                <span class="absolute text-xs font-bold text-[var(--ink)]">
                  {{
                    rateText(overview.kpis.receivable.value, overview.kpis.receivable.target ?? 0)
                  }}
                </span>
              </div>
              <div>
                <p class="text-sm text-[var(--sub)]">目标</p>
                <p class="text-base font-semibold text-[var(--ink)]">
                  {{ formatCurrency(overview.kpis.receivable.target ?? 0) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 意向阶段 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">意向阶段</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="space-y-2">
              <div
                v-for="(label, i) in [
                  '初步接洽',
                  '需求确认',
                  '方案报价',
                  '商务谈判',
                  '中标待签',
                  '已成交',
                ]"
                :key="label"
                class="flex items-center gap-2"
              >
                <span class="text-xs text-[var(--sub)] w-16 truncate">{{ label }}</span>
                <div class="flex-1 h-2 bg-[var(--gray-bg)] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-[var(--primary)]"
                    :style="{ width: `${barData[i] || 10}%` }"
                  />
                </div>
                <span class="text-xs text-[var(--ink)] w-6 text-right">{{ barData[i] || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 客户健康度 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">客户健康度</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-2 rounded-lg bg-[var(--success)] bg-opacity-10 text-center">
                <p class="text-lg font-semibold text-[var(--success)]">186</p>
                <p class="text-xs text-[var(--sub)]">健康</p>
              </div>
              <div class="p-2 rounded-lg bg-yellow-50 text-center">
                <p class="text-lg font-semibold text-yellow-600">98</p>
                <p class="text-xs text-[var(--sub)]">关注</p>
              </div>
              <div class="p-2 rounded-lg bg-red-50 text-center">
                <p class="text-lg font-semibold text-red-600">32</p>
                <p class="text-xs text-[var(--sub)]">风险</p>
              </div>
              <div class="p-2 rounded-lg bg-[var(--gray-bg)] text-center">
                <p class="text-lg font-semibold text-[var(--ink)]">26</p>
                <p class="text-xs text-[var(--sub)]">未激活</p>
              </div>
            </div>
          </div>

          <!-- 拜访覆盖 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">拜访覆盖</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="flex items-end gap-1 h-20">
              <div
                v-for="(h, i) in [45, 52, 38, 65, 72, 58, 80]"
                :key="i"
                class="flex-1 rounded-t bg-[var(--primary)]"
                :style="{ height: `${h}%`, opacity: 0.5 + i * 0.07 }"
              />
            </div>
            <p class="text-xs text-[var(--sub)] mt-2">
              本周拜访次数：{{ overview.kpis.visitComplianceRate * 3 }}
            </p>
          </div>

          <!-- 试剂消耗 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">试剂消耗</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--sub)]">血球试剂</span>
                <span class="text-[var(--ink)] font-medium">12,450 盒</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--sub)]">生化试剂</span>
                <span class="text-[var(--ink)] font-medium">8,230 盒</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-[var(--sub)]">免疫试剂</span>
                <span class="text-[var(--ink)] font-medium">5,120 盒</span>
              </div>
            </div>
          </div>

          <!-- 设备装机 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">设备装机</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-[var(--ink)]">
                  {{ overview.kpis.equipmentCount }}
                </p>
                <p class="text-xs text-[var(--sub)]">总装机</p>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[var(--sub)]">运行中</span>
                  <span class="text-[var(--ink)]">138</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[var(--sub)]">维护中</span>
                  <span class="text-[var(--ink)]">12</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[var(--sub)]">待维保</span>
                  <span class="text-[var(--ink)]">6</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 合规风险 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-[var(--ink)]">合规风险</h3>
              <XqIcon name="more" size="16" class="text-[var(--sub)]" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-red-500" />
                <span class="text-sm text-[var(--ink)] flex-1">拜访无定位照片</span>
                <span class="text-sm font-medium text-red-500">3</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500" />
                <span class="text-sm text-[var(--ink)] flex-1">样品未回库</span>
                <span class="text-sm font-medium text-yellow-500">1</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--primary)]" />
                <span class="text-sm text-[var(--ink)] flex-1">学术活动超预算</span>
                <span class="text-sm font-medium text-[var(--primary)]">0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 待办与预警 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[var(--ink)]">待办与预警</h3>
            <button class="text-sm text-[var(--primary)]">查看全部</button>
          </div>
          <div class="space-y-3">
            <div
              v-for="(alert, i) in overview.alerts"
              :key="i"
              class="flex items-center gap-3 p-3 rounded-lg border"
              :class="alertClass(alert.level)"
            >
              <span class="px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-60">
                {{ alertBadge(alert.level) }}
              </span>
              <span class="text-sm flex-1">{{ alert.title }}</span>
              <button class="text-xs hover:underline">处理</button>
            </div>
          </div>
        </div>
      </div>

      <XqEmptyState
        v-else
        type="empty"
        title="暂无驾驶舱数据"
        description="请联系运营分析员配置指标与看板"
      />
    </template>
  </XqPageLayout>
</template>
