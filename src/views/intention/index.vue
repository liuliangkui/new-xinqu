<script setup lang="ts">
/**
 * 意向管理 — 列表页
 * 对应《意向管理功能与交互说明.md》v1.4
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Intention } from './types'
import { BusinessType, IntentionStatus } from './types'
import { mockGetIntentionList } from './mock'
import type { IntentionStats } from './types'

const isMobile = ref(false)

function checkMobile(): void { isMobile.value = window.innerWidth < 768 }

onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile); fetchList() })
onUnmounted(() => { window.removeEventListener('resize', checkMobile) })

const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'list')
const intentions = ref<Intention[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<IntentionStats>({ totalCount: 0, draftCount: 0, approvingCount: 0, effectiveCount: 0, rejectedCount: 0, closedCount: 0 })
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ businessType: '', status: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailIntention = ref<Intention | null>(null)

// ---- Enums ----
const businessTypeMap: StatusMap = {
  [BusinessType.BID]: { text: '招标', color: 'blue' },
  [BusinessType.NON_BID]: { text: '非招标', color: 'green' },
  [BusinessType.TP]: { text: 'TP', color: 'orange' },
  [BusinessType.DONATION]: { text: '捐赠', color: 'purple' },
}

const statusMap: StatusMap = {
  [IntentionStatus.DRAFT]: { text: '草稿', color: 'gray' },
  [IntentionStatus.APPROVING]: { text: '审批中', color: 'orange' },
  [IntentionStatus.EFFECTIVE]: { text: '生效中', color: 'green' },
  [IntentionStatus.REJECTED]: { text: '被驳回', color: 'red' },
  [IntentionStatus.CLOSED]: { text: '已结束', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'my', label: '我的意向' },
  { key: 'draft', label: '草稿' },
  { key: 'approving', label: '审批中' },
  { key: 'effective', label: '生效中' },
]

const filterConfig = [
  { key: 'businessType', label: '业务类型', options: [{ value: '', label: '全部' }, { value: '1', label: '招标' }, { value: '2', label: '非招标' }, { value: '3', label: 'TP' }, { value: '4', label: '捐赠' }] },
  { key: 'status', label: '状态', options: [{ value: '', label: '全部' }, { value: 'draft', label: '草稿' }, { value: 'approving', label: '审批中' }, { value: 'effective', label: '生效中' }, { value: 'rejected', label: '被驳回' }, { value: 'closed', label: '已结束' }] },
]

const tableColumns = [
  { title: '客户', dataIndex: 'customerName', width: '180px' },
  { title: '项目名称', dataIndex: 'projectName', width: '240px', mobileHidden: true },
  { title: '业务类型', dataIndex: 'businessType', width: '90px' },
  { title: '金额', dataIndex: 'amount', width: '100px' },
  { title: '产品线', dataIndex: 'productLine', width: '140px', mobileHidden: true },
  { title: '状态', dataIndex: 'status', width: '90px' },
  { title: '负责人', dataIndex: 'ownerName', width: '80px', mobileHidden: true },
  { title: '最近更新', dataIndex: 'updateTime', width: '100px', mobileHidden: true },
]

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const result = await mockGetIntentionList({
      pageNum: pagination.value.page, pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value } : {}),
      ...(filterValues.value.businessType ? { businessType: Number(filterValues.value.businessType) } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
    })
    intentions.value = result.list; total.value = result.total; stats.value = result.stats
  } finally { loading.value = false }
}

function handleSearch(val: string): void { keyword.value = val; pagination.value.page = 1; fetchList() }
function handleSearchInput(): void {
  if (searchTimer.value) clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => handleSearch(keyword.value), 300)
}
function handleTabChange(key: string | number): void { activeTab.value = String(key); pagination.value.page = 1; fetchList() }
function handleFilterChange(values: Record<string, unknown>): void { filterValues.value = values; pagination.value.page = 1; fetchList() }
function handleViewChange(val: 'card' | 'list'): void { viewMode.value = val }
function openDetail(intention: Intention): void { detailIntention.value = intention; detailVisible.value = true }
function pageChange(page: number): void { pagination.value.page = page; fetchList() }
const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)
</script>

<template>
  <XqPageLayout title="意向管理">
    <template #actions>
      <XqButton type="primary">
        <XqIcon name="plus" size="14" />新建意向
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <XqKpiCard title="总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="草稿" :value="stats.draftCount" color="ink" />
        <XqKpiCard title="审批中" :value="stats.approvingCount" color="warning" />
        <XqKpiCard title="生效中" :value="stats.effectiveCount" color="success" />
        <XqKpiCard title="被驳回" :value="stats.rejectedCount" color="danger" />
        <XqKpiCard title="已结束" :value="stats.closedCount" color="ink" />
      </div>
    </template>
    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqViewSwitch :value="viewMode" @change="handleViewChange" />
    </template>
    <template #filter>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <XqSearchBar v-model="keyword" placeholder="搜索客户、项目名称..." :pinyin-search="true" @search="handleSearch" @reset="handleSearch('')" @update:model-value="handleSearchInput" />
        <XqFilterBar :filters="filterConfig" :values="filterValues" @change="handleFilterChange" @reset="handleFilterChange({ businessType: '', status: '' })" />
      </div>
    </template>
    <template #content>
      <XqDataTable v-if="viewMode === 'list'" :columns="tableColumns" :data-source="intentions" :loading="loading" row-key="intentionId" @row-click="(r: Intention) => openDetail(r)">
        <template #businessType="{ value }"><XqStatusBadge :status="value" :status-map="businessTypeMap" size="small" /></template>
        <template #status="{ value }"><XqStatusBadge :status="value" :status-map="statusMap" size="small" /></template>
        <template #customerName="{ value, record }"><span class="text-[var(--primary)] cursor-pointer hover:underline" @click.stop="openDetail(record)">{{ value }}</span></template>
        <template #amount="{ value }"><span v-if="value" class="font-medium text-[var(--ink)]">¥{{ Number(value).toLocaleString() }}</span><span v-else class="text-[var(--placeholder)]">-</span></template>
      </XqDataTable>
      <XqCardGrid v-else :data-source="intentions" :columns="4" :loading="loading" @item-click="(r: Intention) => openDetail(r)">
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">{{ record.customerName }}</h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] mb-2 truncate">{{ record.projectName }}</p>
            <div class="flex items-center gap-2 mb-2">
              <XqStatusBadge :status="record.businessType" :status-map="businessTypeMap" size="small" />
              <span v-if="record.amount" class="text-sm font-semibold text-[var(--ink)]">¥{{ record.amount.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm">
              <span class="text-[var(--sub)]">{{ record.ownerName }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{ record.updateTime.slice(0, 10) }}</span>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>
    <template #footer>
      <div class="flex items-center justify-between text-sm text-[var(--sub)]">
        <span>{{ pagination.page }} / {{ Math.ceil(total / pagination.size) }} 页，共 {{ total }} 条</span>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost text-sm" :disabled="pagination.page <= 1" @click="pageChange(pagination.page - 1)">上一页</button>
          <button class="btn btn-ghost text-sm" :disabled="!hasMore" @click="pageChange(pagination.page + 1)">下一页</button>
        </div>
      </div>
    </template>
  </XqPageLayout>

  <!-- 详情抽屉 -->
  <XqDrawer :visible="detailVisible" :title="detailIntention?.customerName || '意向详情'" :width="isMobile ? '100%' : '720px'" @close="detailVisible = false">
    <div v-if="detailIntention" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-[var(--placeholder)]">意向编码</span><div class="text-[var(--ink)] mt-0.5">{{ detailIntention.intentionCode }}</div></div>
          <div><span class="text-[var(--placeholder)]">状态</span><div class="mt-0.5"><XqStatusBadge :status="detailIntention.status" :status-map="statusMap" /></div></div>
          <div class="col-span-2"><span class="text-[var(--placeholder)]">项目名称</span><div class="text-[var(--ink)] mt-0.5 font-medium">{{ detailIntention.projectName }}</div></div>
          <div><span class="text-[var(--placeholder)]">业务类型</span><div class="mt-0.5"><XqStatusBadge :status="detailIntention.businessType" :status-map="businessTypeMap" size="small" /></div></div>
          <div><span class="text-[var(--placeholder)]">金额</span><div class="text-[var(--ink)] mt-0.5 font-semibold">{{ detailIntention.amount ? '¥' + detailIntention.amount.toLocaleString() : '-' }}</div></div>
          <div><span class="text-[var(--placeholder)]">产品线</span><div class="text-[var(--ink)] mt-0.5">{{ detailIntention.productLine }}</div></div>
          <div><span class="text-[var(--placeholder)]">负责人</span><div class="text-[var(--ink)] mt-0.5">{{ detailIntention.ownerName }}</div></div>
        </div>
      </div>
      <div v-if="detailIntention.approvalLog?.length">
        <h4 class="text-md font-semibold text-[var(--ink)] mb-3">审批记录</h4>
        <XqTimeline :data="detailIntention.approvalLog.map((l) => ({ time: l.time, title: `${l.operator} · ${l.action}`, content: l.comment || '', operator: l.operator }))" />
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1"><XqIcon name="approval" size="14" />审批</button>
      <button class="btn btn-primary flex-1"><XqIcon name="edit" size="14" />跟进</button>
    </template>
  </XqDrawer>
</template>
