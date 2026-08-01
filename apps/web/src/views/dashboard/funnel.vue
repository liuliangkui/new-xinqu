<script setup lang="ts">
/**
 * 经营驾驶舱 — 销售漏斗专题页
 */
import { ref, computed, onMounted } from 'vue'
import type { DashboardFunnelResult, DashboardFunnelStage, DashboardPeriod } from './types'
import { getDashboardFunnel } from './api'

const period = ref<DashboardPeriod>('month')
const regionCode = ref('')
const loading = ref(false)
const funnel = ref<DashboardFunnelResult | null>(null)

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
  { key: 'region', label: '区域经营', route: '/dashboard/region' },
  { key: 'dealer', label: '经销商协同', route: '/dealer' },
  { key: 'compliance', label: '合规风控', route: '/compliance' },
]

const activeTab = ref('funnel')

const formatCurrency = (v: number) => `¥${(v / 10000).toFixed(0)}万`

async function fetchFunnel() {
  loading.value = true
  try {
    funnel.value = await getDashboardFunnel({
      period: period.value,
      regionCode: regionCode.value || undefined,
    })
  } finally {
    loading.value = false
  }
}

function switchTab(tab: typeof tabs[number]) {
  activeTab.value = tab.key
  if (tab.route !== '/dashboard/funnel') {
    window.location.href = tab.route
  }
}

function funnelShapeClass(index: number): string {
  const shapes = [
    'clip-path-polygon-top',
    '',
    '',
    '',
    '',
    'clip-path-polygon-bottom',
  ]
  return shapes[index] || ''
}

onMounted(fetchFunnel)
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
        </button>
      </div>
    </template>

    <template #content>
      <div v-if="loading" class="py-20 text-center text-[var(--sub)]">加载中...</div>

      <div v-else-if="funnel" class="space-y-4">
        <!-- 主题导航 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="activeTab === tab.key ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'"
              @click="switchTab(tab)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-1 bg-[var(--card)] rounded-lg border border-[var(--line)] p-1">
            <button
              v-for="p in periods"
              :key="p.value"
              class="px-3 py-1.5 text-xs rounded-md transition-colors"
              :class="period === p.value ? 'bg-[var(--primary)] text-white' : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'"
              @click="period = p.value; fetchFunnel()"
            >
              {{ p.label }}
            </button>
          </div>
          <select
            v-model="regionCode"
            class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            @change="fetchFunnel"
          >
            <option value="">全国</option>
            <option value="east">华东区</option>
            <option value="south">华南区</option>
            <option value="north">华北区</option>
            <option value="southwest">西南区</option>
          </select>
        </div>

        <!-- 顶部汇总 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4 text-center">
            <p class="text-xs text-[var(--sub)]">线索总数</p>
            <p class="text-2xl font-bold text-[var(--ink)]">{{ funnel.totalCount }}</p>
          </div>
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4 text-center">
            <p class="text-xs text-[var(--sub)]">成交赢单</p>
            <p class="text-2xl font-bold text-[var(--success)]">{{ funnel.stages[funnel.stages.length - 1]?.count ?? 0 }}</p>
          </div>
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4 text-center">
            <p class="text-xs text-[var(--sub)]">赢单率</p>
            <p class="text-2xl font-bold text-[var(--primary)]">{{ funnel.winRate }}%</p>
          </div>
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4 text-center">
            <p class="text-xs text-[var(--sub)]">平均客单价</p>
            <p class="text-2xl font-bold text-[var(--ink)]">{{ formatCurrency(funnel.avgDealAmount) }}</p>
          </div>
        </div>

        <!-- 漏斗可视化 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--line)] p-6">
            <h3 class="font-semibold text-[var(--ink)] mb-6">销售漏斗转化分析</h3>
            <div class="flex flex-col items-center gap-3">
              <div
                v-for="(item, index) in funnel.stages"
                :key="item.stage"
                class="relative flex flex-col items-center justify-center text-white rounded-lg py-3 transition-all hover:opacity-90"
                :style="{ width: `${item.widthPercent}%`, minWidth: '200px', backgroundColor: item.color }"
              >
                <span class="text-sm font-medium">{{ item.stage }}</span>
                <div class="flex items-center gap-3 text-xs mt-1 opacity-90">
                  <span>{{ item.count }} 条</span>
                  <span v-if="index > 0">转化率 {{ item.conversionRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 阶段明细 -->
          <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-5">
            <h3 class="font-semibold text-[var(--ink)] mb-4">阶段明细</h3>
            <div class="space-y-4">
              <div
                v-for="(item, index) in funnel.stages"
                :key="item.stage"
                class="flex items-center gap-3"
              >
                <span class="w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium" :style="{ backgroundColor: item.color }">
                  {{ index + 1 }}
                </span>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-[var(--ink)]">{{ item.stage }}</span>
                    <span class="text-sm text-[var(--ink)]">{{ item.count }}</span>
                  </div>
                  <div class="h-1.5 bg-[var(--gray-bg)] rounded-full mt-1 overflow-hidden">
                    <div class="h-full rounded-full" :style="{ width: `${item.widthPercent}%`, backgroundColor: item.color }" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 转化趋势表格 -->
        <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-5">
          <h3 class="font-semibold text-[var(--ink)] mb-4">漏斗转化明细</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-[var(--sub)] border-b border-[var(--line)]">
                  <th class="text-left py-2 px-3">阶段</th>
                  <th class="text-right py-2 px-3">数量</th>
                  <th class="text-right py-2 px-3">阶段金额</th>
                  <th class="text-right py-2 px-3">转化率</th>
                  <th class="text-right py-2 px-3">占线索比</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in funnel.stages"
                  :key="item.stage"
                  class="border-b border-[var(--line)] hover:bg-[var(--bg)]"
                >
                  <td class="py-3 px-3 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }" />
                    <span class="text-[var(--ink)]">{{ item.stage }}</span>
                  </td>
                  <td class="text-right py-3 px-3 text-[var(--ink)]">{{ item.count }}</td>
                  <td class="text-right py-3 px-3 text-[var(--ink)]">{{ item.amount ? formatCurrency(item.amount) : '-' }}</td>
                  <td class="text-right py-3 px-3 text-[var(--ink)]">{{ item.conversionRate }}%</td>
                  <td class="text-right py-3 px-3 text-[var(--ink)]">{{ funnel.totalCount ? ((item.count / funnel.totalCount) * 100).toFixed(1) : '0.0' }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <XqEmptyState
        v-else
        type="empty"
        title="暂无漏斗数据"
        description="请检查数据权限或联系管理员"
      />
    </template>
  </XqPageLayout>
</template>
