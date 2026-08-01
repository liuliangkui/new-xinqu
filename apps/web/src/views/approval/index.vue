<script setup lang="ts">
/**
 * 审批中心 — 列表页
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Approval, ApprovalForm, ApprovalListParams, ApprovalStats } from './types'
import { ApprovalModule, ApprovalStatus, ApprovalPriority } from './types'
import { getApprovalList, createApproval, updateApproval, deleteApproval } from './api'

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
const approvals = ref<Approval[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<ApprovalStats>({
  totalCount: 0,
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  withdrawnCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ module: '', status: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailApproval = ref<Approval | null>(null)

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<ApprovalForm>({} as ApprovalForm)
const formLoading = ref(false)
const editingApprovalId = ref<string | null>(null)

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

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审批' },
  { key: 'approved', label: '我已审批' },
  { key: 'initiated', label: '我发起的' },
  { key: 'cc', label: '抄送我的' },
]

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
  { title: '审批标题', dataIndex: 'title', width: '240px' },
  { title: '审批编号', dataIndex: 'approvalCode', width: '130px', mobileHidden: true },
  { title: '类型', dataIndex: 'module', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '90px' },
  { title: '申请人', dataIndex: 'applicantName', width: '90px', mobileHidden: true },
  { title: '当前审批人', dataIndex: 'currentApproverName', width: '100px', mobileHidden: true },
  { title: '申请时间', dataIndex: 'createdAt', width: '110px', mobileHidden: true },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'title', label: '审批标题', required: true, placeholder: '请输入审批标题' },
  {
    key: 'module',
    label: '审批类型',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'leave', label: '请假' },
      { value: 'expense', label: '报销' },
      { value: 'contract', label: '合同' },
      { value: 'discount', label: '折扣' },
      { value: 'purchase', label: '采购' },
      { value: 'other', label: '其他' },
    ],
  },
  {
    key: 'priority',
    label: '紧急程度',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'normal', label: '普通' },
      { value: 'urgent', label: '紧急' },
    ],
  },
  { key: 'businessKey', label: '业务编号', placeholder: '请输入业务编号' },
  {
    key: 'payload.amount',
    label: '金额',
    type: 'number' as const,
    placeholder: '请输入金额',
  },
  {
    key: 'payload.reason',
    label: '申请理由',
    type: 'textarea' as const,
    placeholder: '请输入申请理由',
  },
]

function emptyForm(): ApprovalForm {
  return {
    title: '',
    module: ApprovalModule.OTHER,
    priority: ApprovalPriority.NORMAL,
    businessKey: '',
    payload: { amount: 0, reason: '' },
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ApprovalListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value as any } : {}),
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
function openDetail(approval: Approval): void {
  detailApproval.value = approval
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
  editingApprovalId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(approval: Approval): void {
  formMode.value = 'edit'
  editingApprovalId.value = approval.approvalId
  formData.value = {
    title: approval.title,
    module: approval.module,
    priority: approval.priority,
    businessKey: approval.businessKey,
    payload: approval.payload || {},
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: ApprovalForm = {
      title: String(values.title || ''),
      module: String(values.module || ApprovalModule.OTHER) as ApprovalModule,
      priority: String(values.priority || ApprovalPriority.NORMAL) as ApprovalPriority,
      businessKey: values.businessKey ? String(values.businessKey) : undefined,
      payload: {
        amount: Number(values['payload.amount'] || 0),
        reason: String(values['payload.reason'] || ''),
      },
    }

    if (formMode.value === 'create') {
      await createApproval(data)
    } else if (editingApprovalId.value) {
      await updateApproval(editingApprovalId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(approval: Approval): Promise<void> {
  // eslint-disable-next-line no-alert
  if (!window.confirm(`确定删除审批「${approval.title}」吗？`)) return
  await deleteApproval(approval.approvalId)
  fetchList()
  if (detailApproval.value?.approvalId === approval.approvalId) {
    detailVisible.value = false
    detailApproval.value = null
  }
}

function handleApprove(): void {
  // eslint-disable-next-line no-alert
  window.alert('审批通过功能将在下一批次实现')
}

function handleReject(): void {
  // eslint-disable-next-line no-alert
  window.alert('审批驳回功能将在下一批次实现')
}
</script>

<template>
  <XqPageLayout title="审批中心">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />新建审批
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="审批总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="审批中" :value="stats.pendingCount" color="warning" />
        <XqKpiCard title="已通过" :value="stats.approvedCount" color="success" />
        <XqKpiCard title="已驳回" :value="stats.rejectedCount" color="danger" />
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
          placeholder="搜索审批标题、编号、业务关键字..."
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
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="approvals"
        :loading="loading"
        row-key="approvalId"
        @row-click="(r: Approval) => openDetail(r)"
      >
        <template #module="{ value }">
          <XqStatusBadge :status="value" :status-map="moduleMap" size="small" />
        </template>
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" size="small" />
        </template>
        <template #title="{ value, record }">
          <span
            class="text-[var(--primary)] cursor-pointer hover:underline"
            @click.stop="openDetail(record)"
          >
            {{ value }}
          </span>
        </template>
        <template #createdAt="{ value }">
          <span class="text-sm text-[var(--sub)]">{{ value ? value.slice(0, 10) : '-' }}</span>
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
        :data-source="approvals"
        :columns="4"
        :loading="loading"
        @item-click="(r: Approval) => openDetail(r)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.title }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] mb-2">{{ record.applicantName || '-' }}</p>
            <div class="flex items-center gap-2 mb-2">
              <XqStatusBadge :status="record.module" :status-map="moduleMap" size="small" />
              <XqStatusBadge :status="record.priority" :status-map="priorityMap" size="small" />
            </div>
            <div
              class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm"
            >
              <span class="text-[var(--sub)]">{{ record.currentApproverName || '-' }}</span>
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
    :title="detailApproval?.title || '审批详情'"
    width="720px"
    @close="detailVisible = false"
  >
    <div v-if="detailApproval" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">审批编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.approvalCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">业务编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.businessKey || '-' }}</div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">审批标题</span>
            <div class="text-[var(--ink)] mt-0.5 font-medium">{{ detailApproval.title }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">类型</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailApproval.module" :status-map="moduleMap" size="small" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">状态</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailApproval.status" :status-map="statusMap" />
            </div>
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
          <div>
            <span class="text-[var(--placeholder)]">申请时间</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailApproval.createdAt.slice(0, 10) }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">紧急程度</span>
            <div class="mt-0.5">
              <XqStatusBadge
                :status="detailApproval.priority"
                :status-map="priorityMap"
                size="small"
              />
            </div>
          </div>
          <div class="col-span-2" v-if="detailApproval.payload">
            <span class="text-[var(--placeholder)]">申请内容</span>
            <div class="text-[var(--ink)] mt-0.5">
              <div v-if="detailApproval.payload.amount">
                金额：{{ detailApproval.payload.amount }} 元
              </div>
              <div v-if="detailApproval.payload.reason">
                理由：{{ detailApproval.payload.reason }}
              </div>
            </div>
          </div>
          <div class="col-span-2" v-if="detailApproval.tasks && detailApproval.tasks.length > 0">
            <span class="text-[var(--placeholder)]">审批记录</span>
            <div class="mt-2 space-y-2">
              <div
                v-for="task in detailApproval.tasks"
                :key="task.taskId"
                class="flex items-center gap-3 text-sm"
              >
                <span class="text-[var(--sub)]">{{ task.assigneeName || task.assigneeId }}</span>
                <span
                  :class="
                    task.action === 'approve'
                      ? 'text-green-600'
                      : task.action === 'reject'
                        ? 'text-red-600'
                        : 'text-orange-500'
                  "
                >
                  {{ task.action ? (task.action === 'approve' ? '已通过' : '已驳回') : '待审批' }}
                </span>
                <span class="text-[var(--placeholder)]">{{ task.comment || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="openEdit(detailApproval!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button class="btn btn-danger flex-1" @click="handleReject">
        <XqIcon name="close" size="14" />驳回
      </button>
      <button class="btn btn-primary flex-1" @click="handleApprove">
        <XqIcon name="check" size="14" />通过
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑审批抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建审批' : '编辑审批'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
