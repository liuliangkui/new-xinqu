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
  ApprovalStage,
} from './types'
import { ApprovalModule, ApprovalStatus, ApprovalPriority } from './types'
import ApprovalFlowDesigner from './components/ApprovalFlowDesigner.vue'
import XqUserPicker from '@/components/xq/XqUserPicker/index.vue'
import {
  getApprovalList,
  createApproval,
  updateApproval,
  approveApproval,
  rejectApproval,
  withdrawApproval,
  undoApproval,
  getApprovalTimeline,
} from './api'
import { getUserList, type UserItem } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

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

const statusColorMap: Record<string, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#9ca3af',
}

function statusColor(status?: string): string {
  if (!status) return statusColorMap.pending!
  return statusColorMap[status] || statusColorMap.pending!
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

const emptyStateText = computed(() => {
  const map: Record<string, string> = {
    all: '当前没有任何审批记录',
    pending: '暂无待我审批的事项',
    approved: '暂无我已审批的事项',
    initiated: '暂无我发起的审批',
    cc: '暂无抄送我的审批',
  }
  return map[activeTab.value] || map.all
})

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
    stages: [],
    approverIds: [],
    ccUserIds: [],
    nodes: [],
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

// ---- 流程式发起弹窗 ----
const composeVisible = ref(false)
const composeLoading = ref(false)
const composeForm = ref<ApprovalForm>(emptyForm())
const pickerVisible = ref(false)
const pickerTarget = ref<'approver' | 'cc'>('approver')
const editingStageIndex = ref<number | null>(null)
const editingApproverIndex = ref<number | null>(null)
const pickerSelectedIds = ref<string[]>([])

const pickerMultiple = computed(() => {
  if (pickerTarget.value === 'cc') return true
  const stages = composeForm.value.stages || []
  const stage = editingStageIndex.value !== null ? stages[editingStageIndex.value] : undefined
  return stage?.mode === 'parallel'
})

function computePickerInitialIds(): string[] {
  if (pickerTarget.value === 'cc') return composeForm.value.ccUserIds || []
  const stages = composeForm.value.stages || []
  if (editingStageIndex.value === null || editingApproverIndex.value === null) return []
  const stage = stages[editingStageIndex.value]
  const approver = stage?.approvers[editingApproverIndex.value]
  return approver?.id ? [approver.id] : []
}

function updatePickerSelectedIds(val: string[]): void {
  pickerSelectedIds.value = val
}

function openCompose(): void {
  composeForm.value = emptyForm()
  composeVisible.value = true
}

const templateChips = [
  { label: '请假', module: ApprovalModule.LEAVE, title: '请假申请', icon: 'calendar' },
  { label: '报销', module: ApprovalModule.EXPENSE, title: '费用报销', icon: 'wallet' },
  { label: '合同', module: ApprovalModule.CONTRACT, title: '合同审批', icon: 'file-text' },
  { label: '折扣', module: ApprovalModule.DISCOUNT, title: '折扣申请', icon: 'tag' },
  { label: '采购', module: ApprovalModule.PURCHASE, title: '采购申请', icon: 'shopping-cart' },
]

function applyTemplate(chip: (typeof templateChips)[number]): void {
  composeForm.value.module = chip.module
  composeForm.value.title = chip.title
}

const advancedExpanded = ref(false)

function composeFlowSummary(): string {
  const stages = composeForm.value.stages || []
  if (stages.length === 0) return '尚未配置审批流程'
  const parts = stages.map((s, i) => {
    const names = s.approvers.filter((a) => a.id).map((a) => a.name || a.id)
    const nameText = names.length ? names.join('、') : '未选择'
    return `阶段${i + 1}（${s.mode === 'parallel' ? '并行' : '串行'}）：${nameText}`
  })
  return parts.join(' → ')
}

function ensureStages(): ApprovalStage[] {
  if (!composeForm.value.stages) {
    composeForm.value.stages = []
  }
  return composeForm.value.stages
}

function openApproverPicker(stageIndex: number, approverIndex: number): void {
  editingStageIndex.value = stageIndex
  editingApproverIndex.value = approverIndex
  pickerTarget.value = 'approver'
  pickerSelectedIds.value = computePickerInitialIds()
  pickerVisible.value = true
}

function updateStages(stages: ApprovalStage[]): void {
  composeForm.value.stages = stages.map((s, i) => ({
    ...s,
    name: s.name || `${s.mode === 'parallel' ? '并行' : '串行'}阶段 ${i + 1}`,
  }))
}

function openCcPicker(): void {
  pickerTarget.value = 'cc'
  editingStageIndex.value = null
  editingApproverIndex.value = null
  pickerSelectedIds.value = computePickerInitialIds()
  pickerVisible.value = true
}

function buildUserName(id: string): string {
  const user = userOptions.value.find((u) => u.value === id)
  return user?.label.split(' ')[0] || id
}

function handlePickerConfirm(ids: string[]): void {
  const selected = ids.length > 0 ? ids : pickerSelectedIds.value
  if (pickerTarget.value === 'cc') {
    composeForm.value.ccUserIds = selected
    return
  }
  const stages = ensureStages()
  if (
    editingStageIndex.value === null ||
    editingApproverIndex.value === null ||
    editingStageIndex.value >= stages.length ||
    selected.length === 0
  ) {
    return
  }

  const newStages = [...stages]
  const stage = { ...newStages[editingStageIndex.value]! }

  if (stage.mode === 'parallel') {
    // 并行阶段：多选填充，从当前 slot 开始覆盖/追加
    const approvers = [...stage.approvers]
    const startIdx = editingApproverIndex.value
    selected.forEach((id, idx) => {
      const targetIdx = startIdx + idx
      if (targetIdx < approvers.length) {
        approvers[targetIdx] = { id, name: buildUserName(id) }
      } else {
        approvers.push({ id, name: buildUserName(id) })
      }
    })
    stage.approvers = approvers
  } else {
    // 串行阶段：仅取第一个
    const selectedId = selected[0]
    if (!selectedId) return
    const approvers = [...stage.approvers]
    approvers[editingApproverIndex.value] = { id: selectedId, name: buildUserName(selectedId) }
    stage.approvers = approvers
  }

  newStages[editingStageIndex.value] = stage
  composeForm.value.stages = newStages
}

function validateStages(stages?: ApprovalStage[]): { valid: boolean; message?: string } {
  if (!stages || stages.length === 0) {
    return { valid: false, message: '请至少添加一个审批阶段' }
  }
  for (const [idx, stage] of stages.entries()) {
    if (stage.mode === 'serial' && stage.approvers.filter((a) => a.id).length === 0) {
      return { valid: false, message: `串行阶段 ${idx + 1} 未选择审批人` }
    }
    if (stage.mode === 'parallel' && stage.approvers.filter((a) => a.id).length < 2) {
      return { valid: false, message: `并行阶段 ${idx + 1} 至少需要两个审批人` }
    }
  }
  return { valid: true }
}

async function handleComposeSubmit(): Promise<void> {
  const form = composeForm.value
  if (!form.title?.trim()) {
    window.alert('请输入审批主题')
    return
  }
  const validation = validateStages(form.stages)
  if (!validation.valid) {
    window.alert(validation.message || '审批流程配置不完整')
    return
  }

  composeLoading.value = true
  try {
    await createApproval({
      title: form.title,
      module: form.module,
      priority: form.priority,
      rejectAction: form.rejectAction,
      rejectTargetIndex: form.rejectTargetIndex,
      stages: form.stages,
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
const actionRejectTarget = ref<'end' | 'prev' | 'node'>('end')
const actionRejectNodeIndex = ref<number | null>(null)
const actionRejectAssigneeId = ref<string | null>(null)

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

function canUndo(record: Approval | null): boolean {
  if (!record || record.status !== ApprovalStatus.PENDING) return false
  const userId = authStore.user?.id
  if (!userId) return false

  const completedTasks =
    record.tasks?.filter((t) => t.assigneeId === userId && t.action && t.completedAt) ?? []
  if (completedTasks.length === 0) return false

  const latestCompleted = completedTasks.sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
  )[0]
  if (!latestCompleted?.completedAt) return false

  const latestCompletedTime = new Date(latestCompleted.completedAt).getTime()
  const hasLaterCompleted = record.tasks?.some(
    (t) =>
      t.action &&
      t.completedAt &&
      t.assigneeId !== userId &&
      new Date(t.completedAt).getTime() > latestCompletedTime,
  )
  if (hasLaterCompleted) return false

  // 必须还有未完成的待审任务（即下一级尚未处理完）
  return (record.tasks?.filter((t) => !t.action).length ?? 0) > 0
}

function buildRejectStageOptions() {
  const approval = detailApproval.value
  if (!approval) return []
  const stages = (approval.payload?.stages as ApprovalStage[] | undefined) || []
  const userMap = new Map<string, string>()
  approval.tasks?.forEach((t) => {
    if (t.assigneeId && t.assigneeName) userMap.set(t.assigneeId, t.assigneeName)
  })
  return stages.map((stage, idx) => {
    const approvers = stage.approvers
      .filter((a) => a.id)
      .map((a) => ({
        id: a.id,
        name:
          userMap.get(a.id) ||
          userOptions.value.find((u) => u.value === a.id)?.label.split(' ')[0] ||
          a.name ||
          a.id,
      }))
    return {
      index: idx,
      label: `阶段 ${idx + 1}`,
      assigneeName: approvers.map((a) => a.name).join('、') || '未配置',
      stageMode: stage.mode,
      approvers,
    }
  })
}

function selectRejectStage(opt: ReturnType<typeof buildRejectStageOptions>[number]) {
  actionRejectNodeIndex.value = opt.index
  actionRejectAssigneeId.value = opt.approvers[0]?.id || null
}

function openAction(type: 'approve' | 'reject'): void {
  actionType.value = type
  actionComment.value = ''
  actionRejectTarget.value = 'end'
  actionRejectNodeIndex.value = null
  actionRejectAssigneeId.value = null
  actionModalVisible.value = true
}

async function handleActionSubmit(): Promise<void> {
  if (!detailApproval.value || !actionType.value) return
  actionLoading.value = true
  try {
    if (actionType.value === 'approve') {
      await approveApproval(detailApproval.value.approvalId, actionComment.value)
    } else {
      let targetNodeIndex: number | undefined
      if (actionRejectTarget.value === 'prev') {
        targetNodeIndex = Math.max(
          0,
          (detailApproval.value.tasks?.findIndex((t) => !t.action) || 0) - 1,
        )
      } else if (actionRejectTarget.value === 'node' && actionRejectNodeIndex.value !== null) {
        targetNodeIndex = actionRejectNodeIndex.value
      }
      await rejectApproval(
        detailApproval.value.approvalId,
        actionComment.value,
        targetNodeIndex,
        actionRejectAssigneeId.value || undefined,
      )
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

async function handleUndo(): Promise<void> {
  if (!detailApproval.value) return
  if (!window.confirm('撤销后下一级已生成的待审任务将被收回，您需要重新审批。确定撤销吗？')) return
  actionLoading.value = true
  try {
    await undoApproval(detailApproval.value.approvalId)
    await openDetail(detailApproval.value)
    await fetchList()
  } catch (e) {
    window.alert(e instanceof Error ? e.message : '撤销失败')
  } finally {
    actionLoading.value = false
  }
}

function formatTime(iso?: string): string {
  if (!iso) return '-'
  return dayjs(iso).format('YYYY-MM-DD HH:mm')
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
      node.action === 'approve'
        ? '已通过'
        : node.action === 'reject'
          ? '已驳回'
          : node.action === 'withdraw'
            ? '已撤回'
            : '待审批'
    }`,
    content: node.comment || undefined,
    operator: node.assigneeName || node.assigneeId || '-',
    status: node.action || 'pending',
    statusColor:
      node.action === 'approve'
        ? 'var(--success)'
        : node.action === 'reject'
          ? 'var(--danger)'
          : node.action === 'withdraw'
            ? 'var(--sub)'
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
      <!-- 空状态 -->
      <div
        v-if="!loading && approvals.length === 0"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[var(--placeholder)] mb-4"
        >
          <XqIcon name="inbox" size="32" />
        </div>
        <h3 class="text-base font-medium text-[var(--ink)] mb-1">暂无审批</h3>
        <p class="text-sm text-[var(--sub)] mb-4">
          {{ emptyStateText }}
        </p>
        <XqButton type="primary" @click="openCompose">
          <XqIcon name="plus" size="14" /> 发起审批
        </XqButton>
      </div>

      <!-- 列表视图：审批卡片行 -->
      <XqDataTable
        v-else-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="approvals"
        :loading="loading"
        row-key="approvalId"
        @row-click="(r: Approval) => openDetail(r)"
      >
        <template #title="{ value, record }">
          <div class="flex items-center gap-3 py-1">
            <div
              class="w-1 h-10 rounded-full flex-shrink-0"
              :style="{ backgroundColor: statusColor(record.status) }"
            />
            <div class="flex flex-col gap-1 min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-medium text-[var(--ink)] truncate">{{ value }}</span>
                <XqStatusBadge :status="record.module" :status-map="moduleMap" size="small" />
                <XqStatusBadge
                  v-if="record.priority === 'urgent'"
                  :status="record.priority"
                  :status-map="priorityMap"
                  size="small"
                />
              </div>
              <div class="flex items-center gap-3 text-xs text-[var(--sub)]">
                <span class="truncate max-w-[200px]">{{ approvalSnippet(record) }}</span>
                <span class="hidden sm:inline text-[var(--placeholder)]">|</span>
                <span class="hidden sm:inline">当前：{{ record.currentApproverName || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #applicantName="{ value, record }">
          <div class="flex items-center gap-2 text-sm">
            <div
              class="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-medium flex-shrink-0"
            >
              {{ (value || '?').slice(0, 1) }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[var(--ink)] truncate">{{ value || '-' }}</span>
              <span class="text-xs text-[var(--sub)]">{{ record.applicantId }}</span>
            </div>
          </div>
        </template>
        <template #createdAt="{ value, record }">
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col text-sm text-right">
              <span class="text-[var(--sub)]">{{
                value ? dayjs(value).format('MM-DD') : '-'
              }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                value ? dayjs(value).format('HH:mm') : ''
              }}</span>
            </div>
            <button
              v-if="canApprove(record)"
              class="btn btn-primary btn-sm hidden lg:flex"
              @click.stop="openDetail(record)"
            >
              审批
            </button>
            <XqStatusBadge v-else :status="record.status" :status-map="statusMap" size="small" />
          </div>
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
          <div class="card card-hover cursor-pointer flex flex-col gap-3 relative overflow-hidden">
            <div
              class="absolute left-0 top-0 bottom-0 w-1"
              :style="{ backgroundColor: statusColor(record.status) }"
            />
            <div class="flex items-start justify-between gap-2 pl-2">
              <h3 class="text-base font-semibold text-[var(--ink)] truncate flex-1">
                {{ record.title }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <div class="flex items-center gap-2 flex-wrap pl-2">
              <XqStatusBadge :status="record.module" :status-map="moduleMap" size="small" />
              <XqStatusBadge
                v-if="record.priority === 'urgent'"
                :status="record.priority"
                :status-map="priorityMap"
                size="small"
              />
            </div>
            <p class="text-sm text-[var(--sub)] line-clamp-2 pl-2">{{ approvalSnippet(record) }}</p>
            <div
              class="flex items-center justify-between text-sm pt-2 border-t border-[var(--line-light)] pl-2"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xs font-medium"
                >
                  {{ (record.applicantName || '?').slice(0, 1) }}
                </div>
                <span class="text-[var(--sub)]">{{ record.applicantName || '-' }}</span>
              </div>
              <span class="text-xs text-[var(--placeholder)]">{{
                dayjs(record.createdAt).format('YYYY-MM-DD')
              }}</span>
            </div>
            <button
              v-if="canApprove(record)"
              class="btn btn-primary btn-sm w-full mt-1"
              @click.stop="openDetail(record)"
            >
              去审批
            </button>
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

  <!-- 流程式发起弹窗 -->
  <XqModal v-model:visible="composeVisible" title="发起审批" width="800px">
    <div class="flex flex-col gap-5">
      <!-- 快捷模板 -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-[var(--sub)]">快捷选择</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="chip in templateChips"
            :key="chip.module"
            class="px-3 py-1.5 text-sm rounded-full border transition-colors"
            :class="
              composeForm.module === chip.module
                ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
                : 'border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
            "
            @click="applyTemplate(chip)"
          >
            <XqIcon :name="chip.icon" size="12" class="inline mr-1" />
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- 主题 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]"
          >审批主题<span class="text-[var(--danger)]">*</span></label
        >
        <input v-model="composeForm.title" type="text" class="input" placeholder="请输入审批主题" />
      </div>

      <!-- 审批流程设计器 -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-[var(--ink)]">审批流程</label>
          <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--gray-bg)] text-[var(--sub)]">
            {{ composeFlowSummary() }}
          </span>
        </div>
        <ApprovalFlowDesigner
          :stages="composeForm.stages || []"
          :current-user-id="authStore.user?.id"
          @update:stages="updateStages"
          @click-approver="openApproverPicker"
        />
      </div>

      <!-- 抄送 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]">抄送人</label>
        <div
          class="flex flex-wrap items-center gap-2 p-2 border border-[var(--line)] rounded-lg bg-[var(--bg)] min-h-[44px]"
        >
          <span
            v-for="id in composeForm.ccUserIds || []"
            :key="id"
            class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-[var(--gray-bg)] text-[var(--sub)]"
          >
            {{ userOptions.find((u) => u.value === id)?.label.split(' ')[0] || id }}
            <button
              class="hover:text-[var(--ink)]"
              @click.stop="
                composeForm.ccUserIds = (composeForm.ccUserIds || []).filter((v) => v !== id)
              "
            >
              <XqIcon name="close" size="12" />
            </button>
          </span>
          <button class="text-sm text-[var(--primary)] hover:underline" @click="openCcPicker">
            <XqIcon name="plus" size="12" class="inline" /> 选择抄送人
          </button>
        </div>
      </div>

      <!-- 高级设置（可折叠） -->
      <div class="rounded-xl border border-[var(--line)] overflow-hidden">
        <button
          class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--gray-bg)] transition-colors"
          @click="advancedExpanded = !advancedExpanded"
        >
          <span>高级设置</span>
          <XqIcon :name="advancedExpanded ? 'chevron-up' : 'chevron-down'" size="14" />
        </button>
        <div v-if="advancedExpanded" class="p-4 flex flex-col gap-4">
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
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-[var(--ink)]">驳回策略</label>
            <select v-model="composeForm.rejectAction" class="input">
              <option value="end">直接结束</option>
              <option value="prev">驳回到上一阶段</option>
              <option value="node">驳回到指定阶段</option>
            </select>
            <div v-if="composeForm.rejectAction === 'node'" class="flex flex-col gap-2 mt-2">
              <span class="text-sm text-[var(--sub)]">选择驳回目标阶段</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(stage, idx) in composeForm.stages || []"
                  :key="stage.id"
                  class="px-2.5 py-1 text-xs rounded-md border"
                  :class="
                    composeForm.rejectTargetIndex === idx
                      ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
                      : 'border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)]'
                  "
                  :disabled="stage.approvers.filter((a) => a.id).length === 0"
                  @click="composeForm.rejectTargetIndex = idx"
                >
                  阶段 {{ idx + 1 }}
                  <span class="ml-1 text-[var(--placeholder)]">
                    {{ stage.approvers.map((a) => a.name || '未选择').join('、') || '未选择' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

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

  <!-- 人员选择器 -->
  <XqUserPicker
    v-model:visible="pickerVisible"
    :model-value="pickerSelectedIds"
    :title="
      pickerTarget === 'cc' ? '选择抄送人' : pickerMultiple ? '选择审批人（可多选）' : '选择审批人'
    "
    :multiple="pickerMultiple"
    @update:model-value="updatePickerSelectedIds"
    @confirm="handlePickerConfirm"
  />

  <!-- 详情弹窗 -->
  <XqModal
    :visible="detailVisible"
    :title="detailApproval?.title || '审批详情'"
    width="800px"
    @close="detailVisible = false"
  >
    <div v-if="detailApproval" class="flex flex-col gap-5">
      <!-- 状态头 -->
      <div
        class="rounded-2xl p-5 text-white relative overflow-hidden"
        :style="{ backgroundColor: statusColor(detailApproval.status) }"
      >
        <div class="relative z-10 flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-xs opacity-80 mb-1">{{ detailApproval.approvalCode }}</div>
              <h2 class="text-xl font-semibold">{{ detailApproval.title }}</h2>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30"
            >
              {{ statusMap[detailApproval.status]?.text || detailApproval.status }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm opacity-90">
            <div class="flex items-center gap-1.5">
              <div
                class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium"
              >
                {{ (detailApproval.applicantName || '?').slice(0, 1) }}
              </div>
              <span>申请人：{{ detailApproval.applicantName || '-' }}</span>
            </div>
            <span>当前审批人：{{ detailApproval.currentApproverName || '-' }}</span>
            <span>{{ formatTime(detailApproval.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- 左侧：审批信息 -->
        <div class="card flex flex-col gap-4">
          <div class="text-sm font-medium text-[var(--ink)]">审批信息</div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-[var(--placeholder)]">审批类型</span>
              <div class="text-[var(--ink)] mt-0.5">
                {{
                  (detailApproval.module && moduleMap[detailApproval.module]?.text) ||
                  detailApproval.module ||
                  '-'
                }}
              </div>
            </div>
            <div>
              <span class="text-[var(--placeholder)]">紧急程度</span>
              <div class="text-[var(--ink)] mt-0.5">
                {{
                  (detailApproval.priority && priorityMap[detailApproval.priority]?.text) ||
                  detailApproval.priority ||
                  '-'
                }}
              </div>
            </div>
            <div>
              <span class="text-[var(--placeholder)]">业务编号</span>
              <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.businessKey || '-' }}</div>
            </div>
            <div v-if="detailApproval.payload?.amount">
              <span class="text-[var(--placeholder)]">金额</span>
              <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.payload.amount }} 元</div>
            </div>
          </div>
          <div v-if="detailApproval.payload?.reason" class="text-sm">
            <span class="text-[var(--placeholder)]">申请理由</span>
            <div class="text-[var(--ink)] mt-1 whitespace-pre-wrap bg-[var(--bg)] rounded-lg p-3">
              {{ detailApproval.payload.reason }}
            </div>
          </div>
        </div>

        <!-- 右侧：流程预览 -->
        <div class="card flex flex-col gap-4">
          <div class="text-sm font-medium text-[var(--ink)]">审批流程</div>
          <ApprovalFlowDesigner
            :stages="(detailApproval.payload?.stages as ApprovalStage[]) || []"
            :readonly="true"
          />
        </div>
      </div>

      <!-- 审批进度 -->
      <div class="card">
        <div class="text-sm font-medium text-[var(--ink)] mb-3">审批进度</div>
        <div v-if="timelineLoading" class="py-4 text-center text-sm text-[var(--placeholder)]">
          加载中…
        </div>
        <XqTimeline v-else :data="timelineItems()" />
      </div>
    </div>
    <template #footer>
      <button
        v-if="detailApproval?.status === ApprovalStatus.PENDING"
        class="btn btn-ghost"
        :disabled="actionLoading"
        @click="openEdit(detailApproval!)"
      >
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
        v-if="canUndo(detailApproval)"
        class="btn btn-warning"
        :disabled="actionLoading"
        @click="handleUndo"
      >
        <XqIcon name="rotate-ccw" size="14" />撤销本人审批
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
    width="520px"
    @close="actionModalVisible = false"
  >
    <div class="flex flex-col gap-4">
      <!-- 迷你摘要 -->
      <div
        v-if="detailApproval"
        class="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
          :style="{
            backgroundColor: statusColor(detailApproval.status) + '20',
            color: statusColor(detailApproval.status),
          }"
        >
          {{ (detailApproval.applicantName || '?').slice(0, 1) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-[var(--ink)] truncate">
            {{ detailApproval.title }}
          </div>
          <div class="text-xs text-[var(--sub)] mt-0.5">
            {{ moduleMap[detailApproval.module]?.text || detailApproval.module }} ·
            {{ detailApproval.applicantName }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-[var(--ink)]">
          审批意见
          <span class="text-[var(--placeholder)] font-normal">（可选）</span>
        </label>
        <textarea
          v-model="actionComment"
          rows="3"
          class="input resize-y"
          :placeholder="
            actionType === 'approve' ? '可填写审批意见，留空直接通过' : '请说明驳回原因'
          "
        />
      </div>

      <!-- 驳回目标选择 -->
      <div v-if="actionType === 'reject'" class="flex flex-col gap-2">
        <label class="text-sm font-medium text-[var(--ink)]">驳回方式</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            class="px-2 py-2 text-sm rounded-md border flex flex-col items-center gap-1"
            :class="
              actionRejectTarget === 'end'
                ? 'bg-[var(--danger-light)] text-[var(--danger)] border-[var(--danger)]'
                : 'border-[var(--line)] text-[var(--sub)] hover:border-[var(--danger)]'
            "
            @click="actionRejectTarget = 'end'"
          >
            <XqIcon name="x-circle" size="16" />
            <span>直接结束</span>
          </button>
          <button
            class="px-2 py-2 text-sm rounded-md border flex flex-col items-center gap-1"
            :class="
              actionRejectTarget === 'prev'
                ? 'bg-[var(--danger-light)] text-[var(--danger)] border-[var(--danger)]'
                : 'border-[var(--line)] text-[var(--sub)] hover:border-[var(--danger)]'
            "
            @click="actionRejectTarget = 'prev'"
          >
            <XqIcon name="corner-up-left" size="16" />
            <span>上一阶段</span>
          </button>
          <button
            class="px-2 py-2 text-sm rounded-md border flex flex-col items-center gap-1"
            :class="
              actionRejectTarget === 'node'
                ? 'bg-[var(--danger-light)] text-[var(--danger)] border-[var(--danger)]'
                : 'border-[var(--line)] text-[var(--sub)] hover:border-[var(--danger)]'
            "
            @click="actionRejectTarget = 'node'"
          >
            <XqIcon name="map-pin" size="16" />
            <span>指定阶段</span>
          </button>
        </div>

        <div v-if="actionRejectTarget === 'node'" class="flex flex-col gap-2 mt-1">
          <span class="text-xs text-[var(--sub)]">选择要驳回到的阶段</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in buildRejectStageOptions()"
              :key="opt.index"
              class="px-3 py-2 text-sm rounded-md border flex items-center gap-2"
              :class="
                actionRejectNodeIndex === opt.index
                  ? 'bg-[var(--danger-light)] text-[var(--danger)] border-[var(--danger)]'
                  : 'border-[var(--line)] text-[var(--ink)] hover:border-[var(--danger)]'
              "
              @click="selectRejectStage(opt)"
            >
              <span
                class="w-5 h-5 rounded-full bg-[var(--gray-bg)] text-xs flex items-center justify-center flex-shrink-0"
              >
                {{ opt.index + 1 }}
              </span>
              <span class="truncate max-w-[120px]">{{ opt.assigneeName }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                opt.stageMode === 'parallel' ? '并行' : '串行'
              }}</span>
            </button>
          </div>

          <!-- 指定具体处理人 -->
          <div v-if="actionRejectNodeIndex !== null" class="flex flex-col gap-1.5 mt-2">
            <span class="text-xs text-[var(--sub)]"
              >指定该阶段的处理人（不选则默认给阶段原审批人）</span
            >
            <select v-model="actionRejectAssigneeId" class="input text-sm">
              <option value="" disabled>请选择处理人</option>
              <option v-for="u in userOptions" :key="u.value" :value="u.value">
                {{ u.label }}
              </option>
            </select>
          </div>

          <p
            v-if="buildRejectStageOptions().length === 0"
            class="text-xs text-[var(--placeholder)]"
          >
            未获取到审批阶段信息
          </p>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="actionModalVisible = false">取消</button>
      <button
        class="flex-1"
        :class="actionType === 'approve' ? 'btn btn-primary' : 'btn btn-danger'"
        :disabled="
          actionLoading ||
          (actionType === 'reject' &&
            actionRejectTarget === 'node' &&
            actionRejectNodeIndex === null)
        "
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
