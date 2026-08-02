<script setup lang="ts">
/**
 * 任务管理 — 列表页
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Task, TaskForm, TaskListParams, TaskStats } from './types'
import { TaskType, TaskPriority, TaskStatus } from './types'
import { getTaskList, createTask, updateTask, deleteTask } from './api'

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
const tasks = ref<Task[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<TaskStats>({
  totalCount: 0,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 0,
  overdueCount: 0,
  urgentCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ taskType: '', priority: '', status: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailTask = ref<Task | null>(null)

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<TaskForm>({} as TaskForm)
const formLoading = ref(false)
const editingTaskId = ref<number | null>(null)

const typeMap: StatusMap = {
  [TaskType.FOLLOW_UP]: { text: '跟进', color: 'blue' },
  [TaskType.VISIT]: { text: '拜访', color: 'green' },
  [TaskType.PHONE]: { text: '电话', color: 'orange' },
  [TaskType.MEETING]: { text: '会议', color: 'purple' },
  [TaskType.DOCUMENT]: { text: '资料', color: 'gray' },
  [TaskType.OTHER]: { text: '其他', color: 'default' },
}

const priorityMap: StatusMap = {
  [TaskPriority.LOW]: { text: '低', color: 'gray' },
  [TaskPriority.MEDIUM]: { text: '中', color: 'blue' },
  [TaskPriority.HIGH]: { text: '高', color: 'orange' },
  [TaskPriority.URGENT]: { text: '紧急', color: 'red' },
}

const statusMap: StatusMap = {
  [TaskStatus.PENDING]: { text: '待处理', color: 'orange' },
  [TaskStatus.PROCESSING]: { text: '进行中', color: 'blue' },
  [TaskStatus.COMPLETED]: { text: '已完成', color: 'green' },
  [TaskStatus.CANCELLED]: { text: '已取消', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'my', label: '我的任务' },
  { key: 'team', label: '团队任务' },
  { key: 'collaboration', label: '协作任务' },
  { key: 'overdue', label: '逾期预警' },
]

const filterConfig = [
  {
    key: 'taskType',
    label: '任务类型',
    options: [
      { value: '', label: '全部' },
      { value: 'follow_up', label: '跟进' },
      { value: 'visit', label: '拜访' },
      { value: 'phone', label: '电话' },
      { value: 'meeting', label: '会议' },
      { value: 'document', label: '资料' },
      { value: 'other', label: '其他' },
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
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '进行中' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' },
    ],
  },
]

const tableColumns = [
  { title: '任务标题', dataIndex: 'title', width: '220px' },
  { title: '任务编号', dataIndex: 'taskCode', width: '120px', mobileHidden: true },
  { title: '客户', dataIndex: 'customerName', width: '140px' },
  { title: '类型', dataIndex: 'taskType', width: '80px' },
  { title: '优先级', dataIndex: 'priority', width: '80px' },
  { title: '状态', dataIndex: 'status', width: '90px' },
  { title: '负责人', dataIndex: 'ownerName', width: '90px', mobileHidden: true },
  { title: '截止时间', dataIndex: 'dueDate', width: '110px', mobileHidden: true },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'title', label: '任务标题', required: true, placeholder: '请输入任务标题' },
  {
    key: 'taskType',
    label: '任务类型',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'follow_up', label: '跟进' },
      { value: 'visit', label: '拜访' },
      { value: 'phone', label: '电话' },
      { value: 'meeting', label: '会议' },
      { value: 'document', label: '资料' },
      { value: 'other', label: '其他' },
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
      { value: 'processing', label: '进行中' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' },
    ],
  },
  { key: 'customerName', label: '客户名称', placeholder: '请输入客户名称' },
  { key: 'ownerName', label: '负责人', placeholder: '请输入负责人' },
  {
    key: 'dueDate',
    label: '截止时间',
    type: 'date' as const,
    placeholder: '请选择截止时间',
  },
  {
    key: 'description',
    label: '任务描述',
    type: 'textarea' as const,
    placeholder: '请输入任务描述',
  },
]

function emptyForm(): TaskForm {
  return {
    title: '',
    taskType: TaskType.FOLLOW_UP,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    customerName: '',
    ownerName: '张三',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: '',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: TaskListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all'
        ? { tabType: activeTab.value as TaskListParams['tabType'] }
        : {}),
      ...(filterValues.value.taskType ? { taskType: String(filterValues.value.taskType) } : {}),
      ...(filterValues.value.priority ? { priority: String(filterValues.value.priority) } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
    }
    const result = await getTaskList(params)
    tasks.value = result.list
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
function openDetail(task: Task): void {
  detailTask.value = task
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
  editingTaskId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(task: Task): void {
  formMode.value = 'edit'
  editingTaskId.value = task.taskId
  formData.value = {
    title: task.title,
    taskType: task.taskType,
    priority: task.priority,
    status: task.status,
    customerName: task.customerName,
    ownerName: task.ownerName,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : undefined,
    description: task.description,
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: TaskForm = {
      title: String(values.title || ''),
      taskType: String(values.taskType || TaskType.FOLLOW_UP) as TaskType,
      priority: String(values.priority || TaskPriority.MEDIUM) as TaskPriority,
      status: String(values.status || TaskStatus.PENDING) as TaskStatus,
      customerName: values.customerName ? String(values.customerName) : undefined,
      ownerName: values.ownerName ? String(values.ownerName) : undefined,
      dueDate: values.dueDate ? String(values.dueDate) : undefined,
      description: values.description ? String(values.description) : undefined,
    }

    if (formMode.value === 'create') {
      await createTask(data)
    } else if (editingTaskId.value !== null) {
      await updateTask(editingTaskId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(task: Task): Promise<void> {
  if (!window.confirm(`确定删除任务「${task.title}」吗？`)) return
  await deleteTask(task.taskId)
  fetchList()
  if (detailTask.value?.taskId === task.taskId) {
    detailVisible.value = false
    detailTask.value = null
  }
}
</script>

<template>
  <XqPageLayout title="任务管理">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />新建任务
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="任务总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="待处理" :value="stats.pendingCount" color="warning" />
        <XqKpiCard title="进行中" :value="stats.processingCount" color="primary" />
        <XqKpiCard title="紧急任务" :value="stats.urgentCount" color="danger" />
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
          placeholder="搜索任务标题、编号、客户..."
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ taskType: '', priority: '', status: '' })"
        />
      </div>
    </template>
    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="tasks"
        :loading="loading"
        row-key="taskId"
        @row-click="(r: Task) => openDetail(r)"
      >
        <template #taskType="{ value }">
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
        <template #dueDate="{ value }">
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
        :data-source="tasks"
        :columns="4"
        :loading="loading"
        @item-click="(r: Task) => openDetail(r)"
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
              <XqStatusBadge :status="record.taskType" :status-map="typeMap" size="small" />
              <XqStatusBadge :status="record.priority" :status-map="priorityMap" size="small" />
            </div>
            <div
              class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm"
            >
              <span class="text-[var(--sub)]">{{ record.ownerName || '未分配' }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                record.dueDate ? record.dueDate.slice(0, 10) : '-'
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
    :title="detailTask?.title || '任务详情'"
    width="720px"
    @close="detailVisible = false"
  >
    <div v-if="detailTask" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">任务编号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTask.taskCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">状态</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailTask.status" :status-map="statusMap" />
            </div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">任务标题</span>
            <div class="text-[var(--ink)] mt-0.5 font-medium">{{ detailTask.title }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">类型</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailTask.taskType" :status-map="typeMap" size="small" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">优先级</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailTask.priority" :status-map="priorityMap" size="small" />
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">客户</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTask.customerName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">负责人</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTask.ownerName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">截止时间</span>
            <div class="text-[var(--ink)] mt-0.5">
              {{ detailTask.dueDate ? detailTask.dueDate.slice(0, 10) : '-' }}
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">参与人</span>
            <div class="text-[var(--ink)] mt-0.5">
              {{ detailTask.participantNames?.join(', ') || '-' }}
            </div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">任务描述</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailTask.description || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="openEdit(detailTask!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button class="btn btn-primary flex-1" @click="detailVisible = false">
        <XqIcon name="check" size="14" />知道了
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑任务抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建任务' : '编辑任务'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
