<script setup lang="ts">
/**
 * 客户 360° — 详情页
 * 对应《客户360°功能与交互说明.md》v1.3
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { CustomerDetail } from './types'
import {
  HealthLevel,
  CooperationStatus,
  RelationLevel,
  ContactAttitudeEnum,
  RoleType,
  DeployMode,
  EquipmentStatus,
  ConsumptionTrend,
  StockStatus,
} from './types'
import { getCustomerDetail } from './api'

const route = useRoute()
const router = useRouter()

// ---- 状态 ----
const detail = ref<CustomerDetail | null>(null)
const loading = ref(true)
const activeTab = ref('overview')
const isMobile = ref(false)

function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadDetail()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

async function loadDetail(): Promise<void> {
  loading.value = true
  const id = route.params.id as string
  detail.value = await getCustomerDetail(id)
  loading.value = false
}

function goBack(): void {
  router.push('/customer')
}

// ---- 枚举映射 ----
const levelMap: StatusMap = {
  1: { text: '三甲', color: 'blue' },
  2: { text: '三乙', color: 'blue' },
  3: { text: '二甲', color: 'green' },
  4: { text: '二乙', color: 'green' },
  5: { text: '一级', color: 'gray' },
  6: { text: '基层', color: 'gray' },
  7: { text: '民营', color: 'purple' },
}

const healthMap: StatusMap = {
  [HealthLevel.HEALTH]: { text: '健康', color: 'green' },
  [HealthLevel.ATTENTION]: { text: '关注', color: 'orange' },
  [HealthLevel.RISK]: { text: '风险', color: 'red' },
  [HealthLevel.DANGER]: { text: '高危', color: 'red' },
}

const cooperationMap: StatusMap = {
  [CooperationStatus.CORE]: { text: '核心科室', color: 'blue' },
  [CooperationStatus.GOOD]: { text: '良好合作', color: 'green' },
  [CooperationStatus.INITIAL]: { text: '初步接触', color: 'orange' },
  [CooperationStatus.POTENTIAL]: { text: '潜在机会', color: 'gray' },
  [CooperationStatus.LOST]: { text: '流失风险', color: 'red' },
}

const roleMap: StatusMap = {
  [RoleType.DECISION]: { text: '决策者', color: 'blue' },
  [RoleType.INFLUENCER]: { text: '影响者', color: 'orange' },
  [RoleType.USER]: { text: '使用者', color: 'green' },
  [RoleType.HANDLER]: { text: '经办人', color: 'gray' },
}

const deployMap: StatusMap = {
  [DeployMode.SALE]: { text: '销售', color: 'blue' },
  [DeployMode.TP]: { text: 'TP', color: 'orange' },
  [DeployMode.DONATION]: { text: '捐赠', color: 'purple' },
}

const equipmentStatusMap: StatusMap = {
  [EquipmentStatus.NORMAL]: { text: '正常', color: 'green' },
  [EquipmentStatus.REPAIRING]: { text: '维修中', color: 'orange' },
  [EquipmentStatus.IDLE]: { text: '闲置', color: 'gray' },
  [EquipmentStatus.SCRAPPED]: { text: '报废', color: 'red' },
}

const trendMap: StatusMap = {
  [ConsumptionTrend.UP]: { text: '上升', color: 'green' },
  [ConsumptionTrend.FLAT]: { text: '持平', color: 'gray' },
  [ConsumptionTrend.DOWN]: { text: '下降', color: 'red' },
}

const stockMap: StatusMap = {
  [StockStatus.NORMAL]: { text: '正常', color: 'green' },
  [StockStatus.REPLENISH]: { text: '需补货', color: 'orange' },
  [StockStatus.EMERGENCY]: { text: '紧急', color: 'red' },
}

const tabs: NavTabItem[] = [
  { key: 'overview', label: '概览' },
  { key: 'departments', label: '科室' },
  { key: 'decisionChain', label: '决策链' },
  { key: 'equipment', label: '设备地图' },
  { key: 'reagent', label: '试剂账本' },
  { key: 'timeline', label: '时间线' },
]

function handleTabChange(key: string | number): void {
  activeTab.value = String(key)
}

function healthColor(score: number): string {
  if (score >= 80) return 'var(--success)'
  if (score >= 60) return 'var(--warning)'
  return 'var(--danger)'
}

// ---- 快捷操作抽屉 ----
const visitDrawerVisible = ref(false)
const visitFormLoading = ref(false)
const visitFormData = ref({ visitTime: '', content: '' })

const intentionDrawerVisible = ref(false)
const intentionFormLoading = ref(false)
const intentionFormData = ref({ productName: '', amount: '', stage: 'INITIAL', expectedAt: '' })

const visitFormFields = [
  {
    key: 'visitTime',
    label: '拜访时间',
    type: 'text' as const,
    required: true,
    placeholder: '请选择拜访时间，如 2026-08-05 14:00',
  },
  {
    key: 'content',
    label: '拜访内容',
    type: 'textarea' as const,
    required: true,
    placeholder: '请输入拜访内容',
  },
]

const intentionFormFields = [
  {
    key: 'productName',
    label: '意向产品',
    type: 'text' as const,
    required: true,
    placeholder: '请输入意向产品',
  },
  { key: 'amount', label: '预计金额', type: 'text' as const, placeholder: '请输入预计金额' },
  {
    key: 'stage',
    label: '所处阶段',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'INITIAL', label: '初期接触' },
      { value: 'NEGOTIATION', label: '方案谈判' },
      { value: 'QUOTATION', label: '报价阶段' },
      { value: 'CONTRACT', label: '合同签订' },
    ],
  },
  { key: 'expectedAt', label: '预计成交时间', type: 'text' as const, placeholder: '如 2026-09-01' },
]

async function handleVisitSubmit(values: Record<string, unknown>): Promise<void> {
  if (!detail.value) return
  visitFormLoading.value = true
  try {
    detail.value.timeline.unshift({
      time: String(values.visitTime || new Date().toLocaleString()),
      title: '预约拜访',
      content: String(values.content || ''),
      operator: '当前用户',
      eventType: 'visit',
    })
    visitDrawerVisible.value = false
    visitFormData.value = { visitTime: '', content: '' }
  } finally {
    visitFormLoading.value = false
  }
}

async function handleIntentionSubmit(values: Record<string, unknown>): Promise<void> {
  if (!detail.value) return
  intentionFormLoading.value = true
  try {
    detail.value.intentionCount += 1
    detail.value.timeline.unshift({
      time: new Date().toLocaleString(),
      title: '新建意向',
      content: `${values.productName}，预计金额 ¥${values.amount || 0}，阶段：${values.stage}`,
      operator: '当前用户',
      eventType: 'intention',
    })
    intentionDrawerVisible.value = false
    intentionFormData.value = { productName: '', amount: '', stage: 'INITIAL', expectedAt: '' }
  } finally {
    intentionFormLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-full bg-[var(--bg)]">
    <!-- 加载态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="text-lg text-[var(--placeholder)]">加载中…</span>
    </div>

    <template v-else-if="detail">
      <!-- 头部 -->
      <div class="bg-[var(--card)] border-b border-[var(--line)] px-5 py-4">
        <div class="flex items-center gap-3 mb-3">
          <button class="btn btn-ghost p-2" @click="goBack">
            <XqIcon name="arrow-left" size="18" />
          </button>
          <h1 class="text-xl font-semibold text-[var(--ink)]">
            {{ detail.customerName }}
          </h1>
          <XqStatusBadge
            v-if="detail.customerLevel"
            :status="detail.customerLevel"
            :status-map="levelMap"
          />
          <XqStatusBadge :status="detail.healthLevel" :status-map="healthMap" />
        </div>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[var(--sub)] ml-11">
          <span>{{ detail.regionName }}</span>
          <span>{{ detail.bedCount }} 床</span>
          <span>负责人：{{ detail.ownerName }}</span>
          <span>最近交互：{{ detail.lastContactTime || '暂无' }}</span>
        </div>
        <div class="flex items-center gap-2 mt-3 ml-11">
          <button class="btn btn-primary" @click="visitDrawerVisible = true">
            <XqIcon name="calendar" size="14" />
            预约拜访
          </button>
          <button class="btn btn-ghost" @click="intentionDrawerVisible = true">
            <XqIcon name="plus" size="14" />
            新建意向
          </button>
        </div>
      </div>

      <!-- Tab 导航 -->
      <div class="bg-[var(--card)] border-b border-[var(--line)] px-5">
        <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      </div>

      <!-- Tab 内容 -->
      <div class="p-5">
        <!-- 概览 -->
        <div v-if="activeTab === 'overview'" class="space-y-5">
          <!-- 健康度 + 指标 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- 健康度圆环 -->
            <div class="card flex items-center gap-6">
              <div
                class="w-24 h-24 rounded-full border-[6px] flex items-center justify-center text-2xl font-bold flex-shrink-0"
                :style="{
                  borderColor: healthColor(detail.healthScore),
                  color: healthColor(detail.healthScore),
                }"
              >
                {{ detail.healthScore }}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg font-semibold text-[var(--ink)]">健康度评分</span>
                  <XqStatusBadge :status="detail.healthLevel" :status-map="healthMap" />
                </div>
                <p class="text-sm text-[var(--sub)]">
                  基于设备活跃、试剂消耗、关系维护、商业贡献、服务体验综合计算
                </p>
              </div>
            </div>

            <!-- 关键指标 -->
            <div class="card grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-[var(--primary)]">{{ detail.deptCount }}</div>
                <div class="text-xs text-[var(--sub)] mt-1">科室数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-[var(--primary)]">
                  {{ detail.equipmentCount }}
                </div>
                <div class="text-xs text-[var(--sub)] mt-1">装机数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-[var(--primary)]">
                  {{ detail.intentionCount }}
                </div>
                <div class="text-xs text-[var(--sub)] mt-1">在跟意向</div>
              </div>
            </div>
          </div>

          <!-- 预警 + 交叉销售 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- 预警 -->
            <div class="card">
              <h3 class="text-md font-semibold text-[var(--ink)] mb-3">待办 / 预警</h3>
              <div
                v-if="!detail.alerts?.length"
                class="text-sm text-[var(--placeholder)] py-4 text-center"
              >
                暂无预警
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="(alert, idx) in detail.alerts"
                  :key="idx"
                  class="flex items-start gap-2 p-2.5 rounded-lg text-sm"
                  :class="
                    alert.severity === 'danger'
                      ? 'bg-[var(--danger-bg)] text-[var(--danger)]'
                      : 'bg-[var(--warning-bg)] text-[var(--warning)]'
                  "
                >
                  <XqIcon name="bell" size="14" class="mt-0.5 flex-shrink-0" />
                  <span>{{ alert.message }}</span>
                </div>
              </div>
            </div>

            <!-- 交叉销售机会 -->
            <div class="card">
              <h3 class="text-md font-semibold text-[var(--ink)] mb-3">交叉销售机会</h3>
              <div
                v-if="!detail.crossSellOpportunities?.length"
                class="text-sm text-[var(--placeholder)] py-4 text-center"
              >
                暂无推荐
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="(opp, idx) in detail.crossSellOpportunities"
                  :key="idx"
                  class="p-3 rounded-lg border border-[var(--line)]"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span
                      class="px-1.5 py-0.5 rounded text-xs font-medium"
                      :class="
                        opp.matchLevel === 'high'
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--gray-bg)] text-[var(--sub)]'
                      "
                    >
                      {{ opp.matchLevel === 'high' ? '高匹配' : '中匹配' }}
                    </span>
                    <span class="text-sm font-medium text-[var(--ink)]">{{ opp.title }}</span>
                  </div>
                  <p class="text-sm text-[var(--sub)]">{{ opp.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近动态 -->
          <div class="card">
            <h3 class="text-md font-semibold text-[var(--ink)] mb-3">最近动态</h3>
            <XqTimeline
              :data="
                detail.timeline.slice(0, 5).map((t) => ({
                  time: t.time,
                  title: t.title,
                  content: t.content,
                  operator: t.operator,
                }))
              "
            />
          </div>
        </div>

        <!-- 科室 -->
        <div v-if="activeTab === 'departments'" class="space-y-4">
          <div v-for="dept in detail.departments" :key="dept.deptId" class="card card-hover">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="text-md font-semibold text-[var(--ink)]">
                  {{ dept.deptName }}
                  <span class="text-sm font-normal text-[var(--sub)] ml-2"
                    >负责人：{{ dept.deptHead || '未知' }}</span
                  >
                </h4>
                <XqStatusBadge
                  :status="dept.cooperationStatus"
                  :status-map="cooperationMap"
                  size="small"
                  class="mt-1"
                />
              </div>
              <span class="text-sm text-[var(--sub)]"
                >月标本量：{{ dept.monthlySampleQty.toLocaleString() }}</span
              >
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--sub)]">
              <span>我方设备：{{ dept.ourEquipment || '无' }}</span>
              <span>竞品设备：{{ dept.competitorEquipment || '无' }}</span>
              <span v-if="dept.monthlyReagentAmount > 0"
                >试剂月均 ¥{{ (dept.monthlyReagentAmount / 10000).toFixed(1) }}万</span
              >
              <span>最近拜访：{{ dept.lastVisitTime || '暂无' }}</span>
            </div>
          </div>
          <XqEmptyState v-if="!detail.departments?.length" type="empty" title="暂无科室" />
        </div>

        <!-- 决策链 -->
        <div v-if="activeTab === 'decisionChain'" class="card">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--line)] text-left text-xs text-[var(--sub)]">
                <th class="py-2 px-3 font-medium">姓名</th>
                <th class="py-2 px-3 font-medium">职务</th>
                <th class="py-2 px-3 font-medium">科室</th>
                <th class="py-2 px-3 font-medium">角色</th>
                <th class="py-2 px-3 font-medium">关系</th>
                <th class="py-2 px-3 font-medium">态度</th>
                <th class="py-2 px-3 font-medium">最近接触</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in detail.decisionContacts"
                :key="c.contactId"
                class="border-b border-[var(--line-light)] hover:bg-[var(--primary-light)]"
              >
                <td class="py-2.5 px-3 font-medium text-[var(--ink)]">{{ c.contactName }}</td>
                <td class="py-2.5 px-3 text-[var(--sub)]">{{ c.contactTitle }}</td>
                <td class="py-2.5 px-3 text-[var(--sub)]">{{ c.deptName }}</td>
                <td class="py-2.5 px-3">
                  <XqStatusBadge :status="c.roleType" :status-map="roleMap" size="small" />
                </td>
                <td class="py-2.5 px-3 text-[var(--sub)]">
                  {{ { high: '紧密', medium: '一般', low: '疏远' }[c.relationLevel] }}
                </td>
                <td class="py-2.5 px-3 text-[var(--sub)]">
                  {{
                    { support: '支持', neutral: '中立', oppose: '反对', unknown: '未知' }[
                      c.attitude
                    ]
                  }}
                </td>
                <td class="py-2.5 px-3 text-[var(--placeholder)] text-xs">
                  {{ c.lastContactTime || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 设备地图 -->
        <div v-if="activeTab === 'equipment'" class="space-y-4">
          <div v-for="eq in detail.equipments" :key="eq.equipmentId" class="card card-hover">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="text-md font-semibold text-[var(--ink)]">{{ eq.equipmentName }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <XqStatusBadge :status="eq.deployMode" :status-map="deployMap" size="small" />
                  <XqStatusBadge
                    :status="eq.status"
                    :status-map="equipmentStatusMap"
                    size="small"
                  />
                </div>
              </div>
              <div class="text-right text-sm">
                <div class="font-semibold text-[var(--ink)]">利用率 {{ eq.utilizationRate }}%</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--sub)]">
              <span>序列号：{{ eq.serialNo }}</span>
              <span>科室：{{ eq.deptName }}</span>
              <span>装机日：{{ eq.installDate }}</span>
              <span>保修到期：{{ eq.warrantyExpireDate }}</span>
              <span v-if="eq.relatedReagents">配套试剂：{{ eq.relatedReagents }}</span>
            </div>
          </div>
          <XqEmptyState v-if="!detail.equipments?.length" type="empty" title="暂无设备" />
        </div>

        <!-- 试剂账本 -->
        <div v-if="activeTab === 'reagent'" class="card">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--line)] text-left text-xs text-[var(--sub)]">
                <th class="py-2 px-3 font-medium">试剂</th>
                <th class="py-2 px-3 font-medium">适用设备</th>
                <th class="py-2 px-3 font-medium">科室</th>
                <th class="py-2 px-3 font-medium">近3月金额</th>
                <th class="py-2 px-3 font-medium">趋势</th>
                <th class="py-2 px-3 font-medium">库存</th>
                <th class="py-2 px-3 font-medium">库存状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in detail.reagents"
                :key="r.reagentId"
                class="border-b border-[var(--line-light)] hover:bg-[var(--primary-light)]"
              >
                <td class="py-2.5 px-3 font-medium text-[var(--ink)]">{{ r.reagentName }}</td>
                <td class="py-2.5 px-3 text-[var(--sub)]">{{ r.applicableEquipment }}</td>
                <td class="py-2.5 px-3 text-[var(--sub)]">{{ r.deptName }}</td>
                <td class="py-2.5 px-3 font-medium text-[var(--ink)]">
                  ¥{{ (r.last3MonthAmount / 10000).toFixed(1) }}万
                </td>
                <td class="py-2.5 px-3">
                  <XqStatusBadge :status="r.consumptionTrend" :status-map="trendMap" size="small" />
                </td>
                <td class="py-2.5 px-3 text-[var(--sub)]">
                  {{ r.currentStock }} / {{ r.safetyStock }}
                </td>
                <td class="py-2.5 px-3">
                  <XqStatusBadge :status="r.stockStatus" :status-map="stockMap" size="small" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 时间线 -->
        <div v-if="activeTab === 'timeline'">
          <XqTimeline
            :data="
              detail.timeline.map((t) => ({
                time: t.time,
                title: t.title,
                content: t.content,
                operator: t.operator,
              }))
            "
          />
        </div>
      </div>
    </template>

    <!-- 未找到 -->
    <div v-else class="flex items-center justify-center py-20">
      <XqEmptyState type="empty" title="客户不存在" description="该客户可能已被删除或您无权查看" />
    </div>
  </div>

  <!-- 预约拜访抽屉 -->
  <XqFormDrawer
    :visible="visitDrawerVisible"
    title="预约拜访"
    :fields="visitFormFields"
    :initial-values="visitFormData as unknown as Record<string, unknown>"
    :loading="visitFormLoading"
    @submit="handleVisitSubmit"
    @cancel="visitDrawerVisible = false"
  />

  <!-- 新建意向抽屉 -->
  <XqFormDrawer
    :visible="intentionDrawerVisible"
    title="新建意向"
    :fields="intentionFormFields"
    :initial-values="intentionFormData as unknown as Record<string, unknown>"
    :loading="intentionFormLoading"
    @submit="handleIntentionSubmit"
    @cancel="intentionDrawerVisible = false"
  />
</template>
