<script setup lang="ts">
/**
 * 审批中心 — 收件箱式列表 + 邮件式发起
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type {
  Approval,
  ApprovalForm,
  ApprovalListParams,
  ApprovalStats,
  ApprovalTimelineNode,
} from './types'
import { ApprovalModule, ApprovalStatus, ApprovalPriority } from './types'
import {
  getApprovalList,
  createApproval,
  updateApproval,
  approveApproval,
  rejectApproval,
  withdrawApproval,
  getApprovalTimeline,
} from './api'
import { getUserList, type UserItem } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const isMobile = ref(false)
const authStore = useAuthStore()
const userOptions = ref<{ value: string; label: string }[]>([])

function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

async function fetchUsers() {
  try {
    const res = await getUserList({ page: 1, size: 200 })
    userOptions.value = (res.list || []).map((u: UserItem) => ({
      value: u.id,
      label: `${u.name} (${u.username})`,
    }))
  } catch {
    userOptions.value = [
      { value: 'user_admin', label: '系统管理员' },
      { value: 'user_sales_01', label: '张销售' },
      { value: 'user_region_01', label: '王经理' },
      { value: 'user_readonly_01', label: '李只读' },
    ]
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchList()
  fetchUsers()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'list')
const approvals = ref<Approval[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<ApprovalStats>({
  totalCount: 0,
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  withdrawnCount: 0,
  initiatedCount: 0,
  ccCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('pending')
const filterValues = ref<Record<string, unknown>>({ module: '', status: '' })
const pagination = ref({ page: 1, size: 12 })

const moduleMap: StatusMap = {
  [ApprovalModule.LEAVE]: { text: '请假', color: 'blue' },
  [ApprovalModule.EXPENSE]: { text: '报销', color: 'orange' },
  [ApprovalModule.CONTRACT]: { text: '合同', color: 'purple' },
  [ApprovalModule.DISCOUNT]: { text: '折扣', color: 'red' },
  [ApprovalModule.PURCHASE]: { text: '采购', color: 'green' },
  [ApprovalModule.OTHER]: { text: '其他', color: 'gray' },
}

const statusMap: StatusMap = {
  [ApprovalStatus.PENDING]: { text: '审批中', color: 'orange' },
  [ApprovalStatus.APPROVED]: { text: '已通过', color: 'green' },
  [ApprovalStatus.REJECTED]: { text: '已驳回', color: 'red' },
  [ApprovalStatus.WITHDRAWN]: { text: '已撤回', color: 'gray' },
}

const priorityMap: StatusMap = {
  [ApprovalPriority.NORMAL]: { text: '普通', color: 'gray' },
  [ApprovalPriority.URGENT]: { text: '紧急', color: 'red' },
}

const tabs = computed<NavTabItem[]>(() => [
  { key: 'all', label: '全部', count: stats.value.totalCount },
  { key: 'pending', label: '待我审批', count: stats.value.pendingCount },
  { key: 'approved', label: '我已审批', count: stats.value.approvedCount },
  { key: 'initiated', label: '我发起的', count: stats.value.initiatedCount },
  { key: 'cc', label: '抄送我的', count: stats.value.ccCount },
])

const filterConfig = [
  {
    key: 'module',
    label: '审批类型',
    options: [
      { value: '', label: '全部' },
      { value: 'leave', label: '请假' },
      { value: 'expense', label: '报销' },
      { value: 'contract', label: '合同' },
      { value: 'discount', label: '折扣' },
      { value: 'purchase', label: '采购' },
      { value: 'other', label: '其他' },
    ],
  },
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'pending', label: '审批中' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已驳回' },
      { value: 'withdrawn', label: '已撤回' },
    ],
  },
]

const tableColumns = [
  { title: '审批', dataIndex: 'title', width: 'auto' },
  { title: '申请人', dataIndex: 'applicantName', width: '120px', mobileHidden: true },
  { title: '时间', dataIndex: 'createdAt', width: '110px', mobileHidden: true },
]

function emptyForm(): ApprovalForm {
  return {
    title: '',
    module: ApprovalModule.OTHER,
    priority: ApprovalPriority.NORMAL,
    mode: 'serial',
    rejectAction: 'end',
    rejectTargetIndex: 0,
    approverIds: [],
    ccUserIds: [],
    businessKey: '',
    payload: { amount: undefined, reason: '' },
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ApprovalListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all'
        ? { tabType: activeTab.value as ApprovalListParams['tabType'] }
        : {}),
      ...(filterValues.value.module ? { module: String(filterValues.value.module) } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
    }
    const result = await getApprovalList(params)
    approvals.value = result.list
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
function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}
const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)

// ---- 详情弹窗 ----
const detailVisible = ref(false)
const detailApproval = ref<Approval | null>(null)
const timeline = ref<ApprovalTimelineNode[]>([])
const timelineLoading = ref(false)

async function openDetail(approval: Approval): Promise<void> {
  detailApproval.value = approval
  detailVisible.value = true
  timeline.value = []
  timelineLoading.value = true
  try {
    const res = await getApprovalTimeline(approval.approvalId)
    timeline.value = res.timeline || []
  } finally {
    timelineLoading.value = false
  }
}

// ---- 邮件式发起弹窗 ----
const composeVisible = ref(false)
const composeLoading = ref(false)
const composeForm = ref<ApprovalForm>(emptyForm())
const approverSearch = ref('')
const ccSearch = ref('')

function openCompose(): void {
  composeForm.value = emptyForm()
  composeVisible.value = true
}

function toggleApprover(userId: string): void {
  const list = composeForm.value.approverIds || []
  if (list.includes(userId)) {
    composeForm.value.approverIds = list.filter((id) => id !== userId)
  } else {
    composeForm.value.approverIds = [...list, userId]
  }
}

function removeApprover(userId: string): void {
  const list = composeForm.value.approverIds || []
  composeForm.value.approverIds = list.filter((id) => id !== userId)
}

function toggleCc(userId: string): void {
  const list = composeForm.value.ccUserIds || []
  if (list.includes(userId)) {
    composeForm.value.ccUserIds = list.filter((id) => id !== userId)
  } else {
    composeForm.value.ccUserIds = [...list, userId]
  }
}

function removeCc(userId: string): void {
  const list = composeForm.value.ccUserIds || []
  composeForm.value.ccUserIds = list.filter((id) => id !== userId)
}

const filteredApproverOptions = computed(() => {
  const selected = new Set(composeForm.value.approverIds || [])
  const kw = approverSearch.value.trim().toLowerCase()
  return userOptions.value.filter(
    (u) => !selected.has(u.value) && u.label.toLowerCase().includes(kw),
  )
})

const filteredCcOptions = computed(() => {
  const selected = new Set(composeForm.value.ccUserIds || [])
  const kw = ccSearch.value.trim().toLowerCase()
  return userOptions.value.filter(
    (u) => !selected.has(u.value) && u.label.toLowerCase().includes(kw),
  )
})

function selectedApproverChips() {
  return (composeForm.value.approverIds || [])
    .map((id) => userOptions.value.find((u) => u.value === id))
    .filter(Boolean)
}

function selectedCcChips() {
  return (composeForm.value.ccUserIds || [])
    .map((id) => userOptions.value.find((u) => u.value === id))
    .filter(Boolean)
}

async function handleComposeSubmit(): Promise<void> {
  const form = composeForm.value
  if (!form.title?.trim()) {
    window.alert('请输入审批主题')
    return
  }
  if (!form.approverIds || form.approverIds.length === 0) {
    window.alert('请选择至少一个审批人')
    return
  }

  composeLoading.value = true
  try {
    await createApproval({
      title: form.title,
      module: form.module,
      priority: form.priority,
      mode: form.mode,
      rejectAction: form.rejectAction,
      rejectTargetIndex: form.rejectTargetIndex,
      approverIds: form.approverIds,
      ccUserIds: form.ccUserIds,
      businessKey: form.businessKey,
      payload: {
        amount: Number(form.payload?.amount || 0),
        reason: String(form.payload?.reason || ''),
      },
    })
    composeVisible.value = false
    activeTab.value = 'initiated'
    pagination.value.page = 1
    await fetchList()
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '发起审批失败')
  } finally {
    composeLoading.value = false
  }
}

// ---- 编辑抽屉 ----
const formVisible = ref(false)
const editingApprovalId = ref<string | null>(null)
const editForm = ref<ApprovalForm>(emptyForm())
const editLoading = ref(false)

function openEdit(approval: Approval): void {
  editingApprovalId.value = approval.approvalId
  editForm.value = {
    title: approval.title,
    businessKey: approval.businessKey,
    payload: approval.payload || {},
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleEditSubmit(values: Record<string, unknown>): Promise<void> {
  if (!editingApprovalId.value) return
  editLoading.value = true
  try {
    await updateApproval(editingApprovalId.value, {
      title: String(values.title || ''),
      businessKey: values.businessKey ? String(values.businessKey) : undefined,
      payload: {
        amount: Number(values['payload.amount'] || 0),
        reason: String(values['payload.reason'] || ''),
      },
    })
    formVisible.value = false
    await fetchList()
  } finally {
    editLoading.value = false
  }
}

// ---- 审批操作 ----
const actionLoading = ref(false)
const actionModalVisible = ref(false)
const actionType = ref<'approve' | 'reject' | null>(null)
const actionComment = ref('')

function canApprove(record: Approval | null): boolean {
  if (!record || record.status !== ApprovalStatus.PENDING) return false
  const currentTask = record.tasks?.find((t) => !t.action)
  if (!currentTask) return false
  return currentTask.assigneeId === authStore.user?.id || authStore.hasRole('super_admin')
}

function canWithdraw(record: Approval | null): boolean {
  if (!record || record.status !== ApprovalStatus.PENDING) return false
  return record.applicantId === authStore.user?.id || authStore.hasRole('super_admin')
}

function openAction(type: 'approve' | 'reject'): void {
  actionType.value = type
  actionComment.value = ''
  actionModalVisible.value = true
}

async function handleActionSubmit(): Promise<void> {
  if (!detailApproval.value || !actionType.value) return
  actionLoading.value = true
  try {
    if (actionType.value === 'approve') {
      await approveApproval(detailApproval.value.approvalId, actionComment.value)
    } else {
      await rejectApproval(detailApproval.value.approvalId, actionComment.value)
    }
    actionModalVisible.value = false
    detailVisible.value = false
    await fetchList()
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '操作失败')
  } finally {
    actionLoading.value = false
  }
}

async function handleWithdraw(): Promise<void> {
  if (!detailApproval.value) return
  if (!window.confirm('确定撤回该审批吗？')) return
  actionLoading.value = true
  try {
    await withdrawApproval(detailApproval.value.approvalId)
    detailVisible.value = false
    await fetchList()
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '撤回失败')
  } finally {
    actionLoading.value = false
  }
}

function formatTime(iso?: string): string {
  if (!iso) return '-'
  return iso.slice(0, 16).replace('T', ' ')
}

function approvalSnippet(approval: Approval): string {
  const reason = approval.payload?.reason as string | undefined
  if (reason) return reason
  const amount = approval.payload?.amount as number | undefined
  if (amount) return `金额：${amount} 元`
  return '暂无内容摘要'
}

function timelineItems() {
  return timeline.value.map((node) => ({
    time: node.endTime ? formatTime(node.endTime) : formatTime(node.startTime),
    title: `${node.nodeName || node.nodeId} · ${
      node.action === 'approve' ? '已通过' : node.action === 'reject' ? '已驳回' : '待审批'
    }`,
    content: node.comment || undefined,
    operator: node.assigneeName || node.assigneeId || '-',
    status: node.action || 'pending',
    statusColor:
      node.action === 'approve'
        ? 'var(--success)'
        : node.action === 'reject'
          ? 'var(--danger)'
          : 'var(--warning)',
  }))
}
</script>

<template>
  <XqPageLayout title="审批中心">
    <template #actions>
      <XqButton type="primary" @click="openCompose">
        <XqIcon name="plus" size="14" />发起审批
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <XqKpiCard title="审批总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="待我审批" :value="stats.pendingCount" color="warning" />
        <XqKpiCard title="我已审批" :value="stats.approvedCount" color="success" />
        <XqKpiCard title="已驳回" :value="stats.rejectedCount" color="danger" />
        <XqKpiCard title="我发起的" :value="stats.initiatedCount" color="ink" />
        <XqKpiCard title="抄送我的" :value="stats.ccCount" color="ink" />
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
          placeholder="搜索审批主题、编号、业务关键字..."
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ module: '', status: '' })"
        />
      </div>
    </template>
    <template #content>
      <!-- 列表视图：邮件收件箱风格 -->
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="approvals"
        :loading="loading"
        row-key="approvalId"
        @row-click="(r: Approval) => openDetail(r)"
      >
        <template #title="{ value, record }">
          <div class="flex flex-col gap-1 py-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-[var(--ink)]">{{ value }}</span>
              <XqStatusBadge :status="record.module" :status-map="moduleMap" size="small" />
              <XqStatusBadge :status="record.priority" :status-map="priorityMap" size="small" />
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <div class="text-sm text-[var(--sub)] truncate max-w-md">
              {{ approvalSnippet(record) }}
            </div>
          </div>
        </template>
        <template #applicantName="{ value, record }">
          <div class="flex flex-col text-sm">
            <span class="text-[var(--ink)]">{{ value || '-' }}</span>
            <span class="text-xs text-[var(--sub)]"
              >当前：{{ record.currentApproverName || '-' }}</span
            >
          </div>
        </template>
        <template #createdAt="{ value }">
          <span class="text-sm text-[var(--sub)]">{{ value ? value.slice(0, 10) : '-' }}</span>
        </template>
      </XqDataTable>

      <!-- 卡片视图 -->
      <XqCardGrid
        v-else
        :data-source="approvals"
        :columns="isMobile ? 1 : 3"
        :loading="loading"
        @item-click="(r: Approval) => openDetail(r)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer flex flex-col gap-3">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-base font-semibold text-[var(--ink)] truncate flex-1">
                {{ record.title }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <XqStatusBadge :status="record.module" :status-map="moduleMap" size="small" />
              <XqStatusBadge :status="record.priority" :status-map="priorityMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] line-clamp-2">{{ approvalSnippet(record) }}</p>
            <div
              class="flex items-center justify-between text-sm pt-2 border-t border-[var(--line-light)]"
            >
              <span class="text-[var(--sub)]">{{ record.applicantName || '-' }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                record.createdAt.slice(0, 10)
              }}</span>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>
    <template #footer>
      <div class="flex items-center justify-between text-sm text-[var(--sub)]">
        <span
          >{{ pagination.page }} / {{ Math.max(1, Math.ceil(total / pagination.size)) }} 页，共
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

  <!-- 邮件式发起弹窗 -->
  <XqModal v-model:visible="composeVisible" title="发起审批" width="720px">
    <div class="flex flex-col gap-5">
      <!-- 审批人 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]"
          >收件人（审批人）<span class="text-[var(--danger)]">*</span></label
        >
        <div
          class="flex flex-wrap items-center gap-2 p-2 border border-[var(--line)] rounded-lg bg-[var(--bg)] min-h-[44px]"
        >
          <span
            v-for="chip in selectedApproverChips()"
            :key="chip!.value"
            class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-[var(--primary-light)] text-[var(--primary)]"
          >
            {{ chip!.label }}
            <button class="hover:text-[var(--ink)]" @click.stop="removeApprover(chip!.value)">
              <XqIcon name="close" size="12" />
            </button>
          </span>
          <select
            v-model="approverSearch"
            class="bg-transparent text-sm outline-none min-w-[120px] flex-1"
            @change="
              (e: Event) => {
                const target = e.target as HTMLSelectElement
                if (target.value) {
                  toggleApprover(target.value)
                  target.value = ''
                  approverSearch = ''
                }
              }
            "
          >
            <option value="">添加审批人</option>
            <option v-for="u in filteredApproverOptions" :key="u.value" :value="u.value">
              {{ u.label }}
            </option>
          </select>
        </div>
        <p class="text-xs text-[var(--sub)]">
          按选择顺序依次审批；选择多人时可在下方切换为并行审批。
        </p>
      </div>

      <!-- 抄送 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]">抄送</label>
        <div
          class="flex flex-wrap items-center gap-2 p-2 border border-[var(--line)] rounded-lg bg-[var(--bg)] min-h-[44px]"
        >
          <span
            v-for="chip in selectedCcChips()"
            :key="chip!.value"
            class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-[var(--gray-bg)] text-[var(--sub)]"
          >
            {{ chip!.label }}
            <button class="hover:text-[var(--ink)]" @click.stop="removeCc(chip!.value)">
              <XqIcon name="close" size="12" />
            </button>
          </span>
          <select
            v-model="ccSearch"
            class="bg-transparent text-sm outline-none min-w-[120px] flex-1"
            @change="
              (e: Event) => {
                const target = e.target as HTMLSelectElement
                if (target.value) {
                  toggleCc(target.value)
                  target.value = ''
                  ccSearch = ''
                }
              }
            "
          >
            <option value="">添加抄送人</option>
            <option v-for="u in filteredCcOptions" :key="u.value" :value="u.value">
              {{ u.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 主题 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]"
          >主题<span class="text-[var(--danger)]">*</span></label
        >
        <input v-model="composeForm.title" type="text" class="input" placeholder="请输入审批主题" />
      </div>

      <!-- 类型 / 紧急 / 模式 / 驳回策略 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">审批类型</label>
          <select v-model="composeForm.module" class="input">
            <option
              v-for="m in [
                { v: 'leave', l: '请假' },
                { v: 'expense', l: '报销' },
                { v: 'contract', l: '合同' },
                { v: 'discount', l: '折扣' },
                { v: 'purchase', l: '采购' },
                { v: 'other', l: '其他' },
              ]"
              :key="m.v"
              :value="m.v"
            >
              {{ m.l }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">紧急程度</label>
          <select v-model="composeForm.priority" class="input">
            <option value="normal">普通</option>
            <option value="urgent">紧急</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">审批模式</label>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1.5 text-sm rounded-md border"
              :class="
                composeForm.mode === 'serial'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
                  : 'border-[var(--line)] text-[var(--sub)]'
              "
              @click="composeForm.mode = 'serial'"
            >
              串行审批
            </button>
            <button
              class="px-3 py-1.5 text-sm rounded-md border"
              :class="
                composeForm.mode === 'parallel'
                  ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
                  : 'border-[var(--line)] text-[var(--sub)]'
              "
              @click="composeForm.mode = 'parallel'"
            >
              并行审批
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">驳回策略</label>
          <select v-model="composeForm.rejectAction" class="input">
            <option value="end">直接结束</option>
            <option value="prev">驳回到上一节点</option>
            <option value="node">驳回到指定节点</option>
          </select>
          <div v-if="composeForm.rejectAction === 'node'" class="flex items-center gap-2 mt-1">
            <span class="text-sm text-[var(--sub)]">目标节点序号</span>
            <input
              v-model.number="composeForm.rejectTargetIndex"
              type="number"
              min="0"
              class="input w-24"
            />
            <span class="text-xs text-[var(--sub)]">从 0 开始</span>
          </div>
        </div>
      </div>

      <!-- 业务编号 / 金额 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">业务编号</label>
          <input
            v-model="composeForm.businessKey"
            type="text"
            class="input"
            placeholder="请输入业务编号"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-[var(--ink)]">金额</label>
          <input
            v-model.number="(composeForm.payload as any).amount"
            type="number"
            class="input"
            placeholder="请输入金额"
          />
        </div>
      </div>

      <!-- 正文 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]">申请理由</label>
        <textarea
          v-model="(composeForm.payload as any).reason"
          rows="4"
          class="input min-h-[100px] resize-y"
          placeholder="请输入申请理由"
        />
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="composeVisible = false">取消</button>
      <button
        class="btn btn-primary flex-1"
        :disabled="composeLoading"
        @click="handleComposeSubmit"
      >
        <XqIcon v-if="composeLoading" name="loading" size="14" class="animate-spin mr-1" />
        {{ composeLoading ? '提交中…' : '发送审批' }}
      </button>
    </template>
  </XqModal>

  <!-- 详情弹窗 -->
  <XqModal
    :visible="detailVisible"
    :title="detailApproval?.title || '审批详情'"
    width="760px"
    @close="detailVisible = false"
  >
    <div v-if="detailApproval" class="flex flex-col gap-5">
      <div class="card">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-2 flex-wrap">
            <XqStatusBadge :status="detailApproval.module" :status-map="moduleMap" size="small" />
            <XqStatusBadge
              :status="detailApproval.priority"
              :status-map="priorityMap"
              size="small"
            />
            <XqStatusBadge :status="detailApproval.status" :status-map="statusMap" size="small" />
          </div>
          <span class="text-xs text-[var(--placeholder)]">{{
            formatTime(detailApproval.createdAt)
          }}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">审批编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.approvalCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">业务编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.businessKey || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">申请人</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.applicantName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">当前审批人</span>
            <div class="text-[var(--ink)] mt-0.5">
              {{ detailApproval.currentApproverName || '-' }}
            </div>
          </div>
          <div v-if="detailApproval.payload?.amount" class="col-span-2">
            <span class="text-[var(--placeholder)]">金额</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.payload.amount }} 元</div>
          </div>
          <div v-if="detailApproval.payload?.reason" class="col-span-2">
            <span class="text-[var(--placeholder)]">申请理由</span>
            <div class="text-[var(--ink)] mt-0.5 whitespace-pre-wrap">
              {{ detailApproval.payload.reason }}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="text-sm font-medium text-[var(--ink)] mb-3">审批进度</div>
        <div v-if="timelineLoading" class="py-4 text-center text-sm text-[var(--placeholder)]">
          加载中…
        </div>
        <XqTimeline v-else :data="timelineItems()" />
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost" :disabled="actionLoading" @click="openEdit(detailApproval!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button
        v-if="canWithdraw(detailApproval)"
        class="btn btn-ghost"
        :disabled="actionLoading"
        @click="handleWithdraw"
      >
        <XqIcon name="arrow-left" size="14" />撤回
      </button>
      <button
        v-if="canApprove(detailApproval)"
        class="btn btn-danger flex-1"
        :disabled="actionLoading"
        @click="openAction('reject')"
      >
        <XqIcon name="close" size="14" />驳回
      </button>
      <button
        v-if="canApprove(detailApproval)"
        class="btn btn-primary flex-1"
        :disabled="actionLoading"
        @click="openAction('approve')"
      >
        <XqIcon name="check" size="14" />通过
      </button>
    </template>
  </XqModal>

  <!-- 审批意见弹窗 -->
  <XqModal
    :visible="actionModalVisible"
    :title="actionType === 'approve' ? '审批通过' : '审批驳回'"
    width="480px"
    @close="actionModalVisible = false"
  >
    <div class="flex flex-col gap-3">
      <label class="text-sm font-medium text-[var(--ink)]">审批意见（可选）</label>
      <textarea
        v-model="actionComment"
        rows="3"
        class="input resize-y"
        placeholder="请输入审批意见"
      />
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="actionModalVisible = false">取消</button>
      <button
        class="flex-1"
        :class="actionType === 'approve' ? 'btn btn-primary' : 'btn btn-danger'"
        :disabled="actionLoading"
        @click="handleActionSubmit"
      >
        {{ actionType === 'approve' ? '确认通过' : '确认驳回' }}
      </button>
    </template>
  </XqModal>

  <!-- 编辑抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    title="编辑审批"
    :fields="[
      { key: 'title', label: '审批标题', required: true },
      { key: 'businessKey', label: '业务编号' },
      { key: 'payload.amount', label: '金额', placeholder: '请输入金额' },
      { key: 'payload.reason', label: '申请理由', type: 'textarea', placeholder: '请输入申请理由' },
    ]"
    :initial-values="editForm as unknown as Record<string, unknown>"
    :loading="editLoading"
    @submit="handleEditSubmit"
    @cancel="formVisible = false"
  />
</template>
