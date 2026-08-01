<script setup lang="ts">
/**
 * 工单管理 — 列表页
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Ticket, TicketForm, TicketListParams, TicketStats } from './types'
import { TicketType, TicketPriority, TicketStatus } from './types'
import { getTicketList, createTicket, updateTicket, deleteTicket } from './api'

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
const tickets = ref<Ticket[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<TicketStats>({
  totalCount: 0,
  pendingCount: 0,
  processingCount: 0,
  waitingCount: 0,
  resolvedCount: 0,
  closedCount: 0,
  urgentCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '', priority: '', type: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailTicket = ref<Ticket | null>(null)

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<TicketForm>({} as TicketForm)
const formLoading = ref(false)
const editingTicketId = ref<number | null>(null)

const typeMap: StatusMap = {
  [TicketType.REPAIR]: { text: '维修', color: 'orange' },
  [TicketType.MAINTENANCE]: { text: '保养', color: 'blue' },
  [TicketType.CONSULT]: { text: '咨询', color: 'green' },
  [TicketType.COMPLAINT]: { text: '投诉', color: 'red' },
}

const priorityMap: StatusMap = {
  [TicketPriority.LOW]: { text: '低', color: 'gray' },
  [TicketPriority.MEDIUM]: { text: '中', color: 'blue' },
  [TicketPriority.HIGH]: { text: '高', color: 'orange' },
  [TicketPriority.URGENT]: { text: '紧急', color: 'red' },
}

const statusMap: StatusMap = {
  [TicketStatus.PENDING]: { text: '待处理', color: 'orange' },
  [TicketStatus.PROCESSING]: { text: '处理中', color: 'blue' },
  [TicketStatus.WAITING]: { text: '待反馈', color: 'warning' },
  [TicketStatus.RESOLVED]: { text: '已解决', color: 'green' },
  [TicketStatus.CLOSED]: { text: '已关闭', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'my', label: '我的工单' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'overdue', label: '已超时' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'waiting', label: '待反馈' },
      { value: 'resolved', label: '已解决' },
      { value: 'closed', label: '已关闭' },
    ],
  },
  {
    key: 'priority',
    label: '优先级',
    options: [
      { value: '', label: '全部' },
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' },
      { value: 'urgent', label: '紧急' },
    ],
  },
  {
    key: 'type',
    label: '类型',
    options: [
      { value: '', label: '全部' },
      { value: 'repair', label: '维修' },
      { value: 'maintenance', label: '保养' },
      { value: 'consult', label: '咨询' },
      { value: 'complaint', label: '投诉' },
    ],
  },
]

const tableColumns = [
  { title: '工单标题', dataIndex: 'title', width: '220px' },
  { title: '工单编号', dataIndex: 'ticketCode', width: '120px', mobileHidden: true },
  { title: '客户', dataIndex: 'customerName', width: '140px' },
  { title: '类型', dataIndex: 'type', width: '80px' },
  { title: '优先级', dataIndex: 'priority', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '90px' },
  { title: '处理人', dataIndex: 'assigneeName', width: '90px', mobileHidden: true },
  { title: '创建时间', dataIndex: 'createdAt', width: '110px', mobileHidden: true },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'title', label: '工单标题', required: true, placeholder: '请输入工单标题' },
  {
    key: 'type',
    label: '工单类型',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'repair', label: '维修' },
      { value: 'maintenance', label: '保养' },
      { value: 'consult', label: '咨询' },
      { value: 'complaint', label: '投诉' },
    ],
  },
  {
    key: 'priority',
    label: '优先级',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' },
      { value: 'urgent', label: '紧急' },
    ],
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'waiting', label: '待反馈' },
      { value: 'resolved', label: '已解决' },
      { value: 'closed', label: '已关闭' },
    ],
  },
  { key: 'customerName', label: '客户名称', placeholder: '请输入客户名称' },
  { key: 'equipmentName', label: '设备名称', placeholder: '请输入设备名称' },
  { key: 'assigneeName', label: '处理人', placeholder: '请输入处理人' },
  {
    key: 'content',
    label: '工单内容',
    type: 'textarea' as const,
    required: true,
    placeholder: '请输入工单内容',
  },
  { key: 'solution', label: '解决方案', type: 'textarea' as const, placeholder: '请输入解决方案' },
]

function emptyForm(): TicketForm {
  return {
    title: '',
    type: TicketType.REPAIR,
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.PENDING,
    customerName: '',
    equipmentName: '',
    reporterName: '张三',
    assigneeName: '',
    content: '',
    solution: '',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: TicketListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value as any } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
      ...(filterValues.value.priority ? { priority: String(filterValues.value.priority) } : {}),
      ...(filterValues.value.type ? { type: String(filterValues.value.type) } : {}),
    }
    const result = await getTicketList(params)
    tickets.value = result.list
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
function openDetail(ticket: Ticket): void {
  detailTicket.value = ticket
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
  editingTicketId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(ticket: Ticket): void {
  formMode.value = 'edit'
  editingTicketId.value = ticket.ticketId
  formData.value = {
    title: ticket.title,
    type: ticket.type,
    priority: ticket.priority,
    status: ticket.status,
    customerName: ticket.customerName,
    equipmentName: ticket.equipmentName,
    assigneeName: ticket.assigneeName,
    content: ticket.content,
    solution: ticket.solution,
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: TicketForm = {
      title: String(values.title || ''),
      type: String(values.type || TicketType.REPAIR) as TicketType,
      priority: String(values.priority || TicketPriority.MEDIUM) as TicketPriority,
      status: String(values.status || TicketStatus.PENDING) as TicketStatus,
      customerName: values.customerName ? String(values.customerName) : undefined,
      equipmentName: values.equipmentName ? String(values.equipmentName) : undefined,
      assigneeName: values.assigneeName ? String(values.assigneeName) : undefined,
      content: String(values.content || ''),
      solution: values.solution ? String(values.solution) : undefined,
    }

    if (formMode.value === 'create') {
      await createTicket(data)
    } else if (editingTicketId.value !== null) {
      await updateTicket(editingTicketId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(ticket: Ticket): Promise<void> {
  // eslint-disable-next-line no-alert
  if (!window.confirm(`确定删除工单「${ticket.title}」吗？`)) return
  await deleteTicket(ticket.ticketId)
  fetchList()
  if (detailTicket.value?.ticketId === ticket.ticketId) {
    detailVisible.value = false
    detailTicket.value = null
  }
}

function handleDispatch(): void {
  // eslint-disable-next-line no-alert
  window.alert('派单功能将在下一批次实现')
}

function handleResolve(): void {
  // eslint-disable-next-line no-alert
  window.alert('结单功能将在下一批次实现')
}
</script>

<template>
  <XqPageLayout title="工单管理">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />新建工单
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="工单总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="待处理" :value="stats.pendingCount" color="warning" />
        <XqKpiCard title="处理中" :value="stats.processingCount" color="primary" />
        <XqKpiCard title="紧急未关闭" :value="stats.urgentCount" color="danger" />
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
          placeholder="搜索工单标题、编号、客户..."
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ status: '', priority: '', type: '' })"
        />
      </div>
    </template>
    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="tickets"
        :loading="loading"
        row-key="ticketId"
        @row-click="(r: Ticket) => openDetail(r)"
      >
        <template #type="{ value }">
          <XqStatusBadge :status="value" :status-map="typeMap" size="small" />
        </template>
        <template #priority="{ value }">
          <XqStatusBadge :status="value" :status-map="priorityMap" size="small" />
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
        :data-source="tickets"
        :columns="4"
        :loading="loading"
        @item-click="(r: Ticket) => openDetail(r)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.title }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] mb-2">{{ record.customerName || '未绑定客户' }}</p>
            <div class="flex items-center gap-2 mb-2">
              <XqStatusBadge :status="record.type" :status-map="typeMap" size="small" />
              <XqStatusBadge :status="record.priority" :status-map="priorityMap" size="small" />
            </div>
            <div
              class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm"
            >
              <span class="text-[var(--sub)]">{{ record.assigneeName || '待分配' }}</span>
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

  <!-- 详情抽屉 -->
  <XqDrawer
    :visible="detailVisible"
    :title="detailTicket?.title || '工单详情'"
    :width="isMobile ? '100%' : '720px'"
    @close="detailVisible = false"
  >
    <div v-if="detailTicket" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">工单编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.ticketCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">状态</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailTicket.status" :status-map="statusMap" />
            </div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">工单标题</span>
            <div class="text-[var(--ink)] mt-0.5 font-medium">{{ detailTicket.title }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">类型</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailTicket.type" :status-map="typeMap" size="small" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">优先级</span>
            <div class="mt-0.5">
              <XqStatusBadge
                :status="detailTicket.priority"
                :status-map="priorityMap"
                size="small"
              />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">客户</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.customerName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">设备</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.equipmentName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">处理人</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.assigneeName || '待分配' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">创建时间</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.createdAt.slice(0, 10) }}</div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">工单内容</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.content }}</div>
          </div>
          <div v-if="detailTicket.solution" class="col-span-2">
            <span class="text-[var(--placeholder)]">解决方案</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTicket.solution }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="openEdit(detailTicket!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button class="btn btn-ghost flex-1" @click="handleDispatch">
        <XqIcon name="user-add" size="14" />派单
      </button>
      <button class="btn btn-primary flex-1" @click="handleResolve">
        <XqIcon name="check" size="14" />结单
      </button>
    </template>
  </XqDrawer>

  <!-- 新建/编辑工单抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建工单' : '编辑工单'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
