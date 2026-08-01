<script setup lang="ts">
/**
 * 设备管理 — 列表页
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NavTabItem, StatusMap } from '@/types/common'
import type { Equipment, EquipmentForm, EquipmentListParams, EquipmentStats } from './types'
import { EquipmentStatus } from './types'
import { getEquipmentList, createEquipment, updateEquipment, deleteEquipment } from './api'

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
const equipments = ref<Equipment[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<EquipmentStats>({
  totalCount: 0,
  runningCount: 0,
  maintainingCount: 0,
  scrappedCount: 0,
})
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref('all')
const filterValues = ref<Record<string, unknown>>({ status: '' })
const pagination = ref({ page: 1, size: 12 })
const detailVisible = ref(false)
const detailEquipment = ref<Equipment | null>(null)

// 表单抽屉
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<EquipmentForm>({} as EquipmentForm)
const formLoading = ref(false)
const editingEquipmentId = ref<number | null>(null)

const statusMap: StatusMap = {
  [EquipmentStatus.RUNNING]: { text: '运行中', color: 'green' },
  [EquipmentStatus.MAINTAINING]: { text: '维修中', color: 'orange' },
  [EquipmentStatus.SCRAPPED]: { text: '已报废', color: 'gray' },
}

const tabs: NavTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'my', label: '我的设备' },
  { key: 'running', label: '运行中' },
  { key: 'maintaining', label: '维修中' },
  { key: 'expiring', label: '保修临期' },
]

const filterConfig = [
  {
    key: 'status',
    label: '状态',
    options: [
      { value: '', label: '全部' },
      { value: 'running', label: '运行中' },
      { value: 'maintaining', label: '维修中' },
      { value: 'scrapped', label: '已报废' },
    ],
  },
]

const tableColumns = [
  { title: '设备名称', dataIndex: 'equipmentName', width: '200px' },
  { title: '设备编码', dataIndex: 'equipmentCode', width: '120px', mobileHidden: true },
  { title: '客户', dataIndex: 'customerName', width: '140px' },
  { title: '产品线', dataIndex: 'productLine', width: '140px', mobileHidden: true },
  { title: '序列号', dataIndex: 'serialNo', width: '120px', mobileHidden: true },
  { title: '状态', dataIndex: 'status', width: '90px' },
  { title: '保修到期', dataIndex: 'warrantyExpire', width: '110px', mobileHidden: true },
  { title: '负责人', dataIndex: 'ownerName', width: '90px', mobileHidden: true },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

const formFields = [
  { key: 'equipmentName', label: '设备名称', required: true, placeholder: '请输入设备名称' },
  { key: 'equipmentCode', label: '设备编码', placeholder: '留空自动生成' },
  { key: 'customerName', label: '客户名称', placeholder: '请输入客户名称' },
  { key: 'productLine', label: '产品线', placeholder: '请输入产品线' },
  { key: 'serialNo', label: '序列号', placeholder: '请输入序列号' },
  { key: 'installDate', label: '装机日期', placeholder: '如 2025-03-15' },
  { key: 'warrantyExpire', label: '保修到期', placeholder: '如 2028-03-14' },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'running', label: '运行中' },
      { value: 'maintaining', label: '维修中' },
      { value: 'scrapped', label: '已报废' },
    ],
  },
  { key: 'ownerName', label: '负责人', placeholder: '请输入负责人' },
]

function emptyForm(): EquipmentForm {
  return {
    equipmentName: '',
    customerName: '',
    productLine: '',
    serialNo: '',
    installDate: '',
    warrantyExpire: '',
    status: EquipmentStatus.RUNNING,
    ownerName: '张三',
  }
}

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: EquipmentListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value as any } : {}),
      ...(filterValues.value.status ? { status: String(filterValues.value.status) } : {}),
    }
    const result = await getEquipmentList(params)
    equipments.value = result.list
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
function openDetail(equipment: Equipment): void {
  detailEquipment.value = equipment
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
  editingEquipmentId.value = null
  formData.value = emptyForm()
  formVisible.value = true
}

function openEdit(equipment: Equipment): void {
  formMode.value = 'edit'
  editingEquipmentId.value = equipment.equipmentId
  formData.value = {
    equipmentName: equipment.equipmentName,
    equipmentCode: equipment.equipmentCode,
    customerName: equipment.customerName,
    productLine: equipment.productLine,
    serialNo: equipment.serialNo,
    installDate: equipment.installDate,
    warrantyExpire: equipment.warrantyExpire,
    status: equipment.status,
    ownerName: equipment.ownerName,
  }
  formVisible.value = true
  detailVisible.value = false
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: EquipmentForm = {
      equipmentName: String(values.equipmentName || ''),
      equipmentCode: values.equipmentCode ? String(values.equipmentCode) : undefined,
      customerName: values.customerName ? String(values.customerName) : undefined,
      productLine: values.productLine ? String(values.productLine) : undefined,
      serialNo: values.serialNo ? String(values.serialNo) : undefined,
      installDate: values.installDate ? String(values.installDate) : undefined,
      warrantyExpire: values.warrantyExpire ? String(values.warrantyExpire) : undefined,
      status: String(values.status || EquipmentStatus.RUNNING) as EquipmentStatus,
      ownerName: values.ownerName ? String(values.ownerName) : '张三',
    }

    if (formMode.value === 'create') {
      await createEquipment(data)
    } else if (editingEquipmentId.value !== null) {
      await updateEquipment(editingEquipmentId.value, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(equipment: Equipment): Promise<void> {
  // eslint-disable-next-line no-alert
  if (!window.confirm(`确定删除设备「${equipment.equipmentName}」吗？`)) return
  await deleteEquipment(equipment.equipmentId)
  fetchList()
  if (detailEquipment.value?.equipmentId === equipment.equipmentId) {
    detailVisible.value = false
    detailEquipment.value = null
  }
}

function handleMaintain(): void {
  // eslint-disable-next-line no-alert
  window.alert('维保记录功能将在下一批次实现')
}

function handleTicket(): void {
  // eslint-disable-next-line no-alert
  window.alert('报修工单功能将在下一批次实现')
}
</script>

<template>
  <XqPageLayout title="设备管理">
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />新建设备
      </XqButton>
    </template>
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <XqKpiCard title="设备总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="运行中" :value="stats.runningCount" color="success" />
        <XqKpiCard title="维修中" :value="stats.maintainingCount" color="warning" />
        <XqKpiCard title="已报废" :value="stats.scrappedCount" color="ink" />
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
          placeholder="搜索设备名称、编码、序列号..."
          :pinyin-search="true"
          @search="handleSearch"
          @reset="handleSearch('')"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterChange({ status: '' })"
        />
      </div>
    </template>
    <template #content>
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="equipments"
        :loading="loading"
        row-key="equipmentId"
        @row-click="(r: Equipment) => openDetail(r)"
      >
        <template #status="{ value }">
          <XqStatusBadge :status="value" :status-map="statusMap" size="small" />
        </template>
        <template #equipmentName="{ value, record }">
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
        :data-source="equipments"
        :columns="4"
        :loading="loading"
        @item-click="(r: Equipment) => openDetail(r)"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start justify-between mb-2">
              <h3 class="text-md font-semibold text-[var(--ink)] truncate flex-1 min-w-0 pr-2">
                {{ record.equipmentName }}
              </h3>
              <XqStatusBadge :status="record.status" :status-map="statusMap" size="small" />
            </div>
            <p class="text-sm text-[var(--sub)] mb-2">{{ record.customerName || '未绑定客户' }}</p>
            <div class="flex items-center gap-2 mb-2 text-xs text-[var(--placeholder)]">
              <span>{{ record.equipmentCode }}</span>
              <span v-if="record.serialNo">| {{ record.serialNo }}</span>
            </div>
            <div
              class="flex items-center justify-between pt-2 border-t border-[var(--line-light)] text-sm"
            >
              <span class="text-[var(--sub)]">{{ record.ownerName }}</span>
              <span class="text-xs text-[var(--placeholder)]">{{
                record.warrantyExpire || '-'
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
    :title="detailEquipment?.equipmentName || '设备详情'"
    width="720px"
    @close="detailVisible = false"
  >
    <div v-if="detailEquipment" class="flex flex-col gap-5">
      <div class="card">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-[var(--placeholder)]">设备编码</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.equipmentCode }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">状态</span>
            <div class="mt-0.5">
              <XqStatusBadge :status="detailEquipment.status" :status-map="statusMap" />
            </div>
          </div>
          <div class="col-span-2">
            <span class="text-[var(--placeholder)]">设备名称</span>
            <div class="text-[var(--ink)] mt-0.5 font-medium">
              {{ detailEquipment.equipmentName }}
            </div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">客户</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.customerName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">产品线</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.productLine || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">序列号</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.serialNo || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">负责人</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.ownerName || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">装机日期</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.installDate || '-' }}</div>
          </div>
          <div>
            <span class="text-[var(--placeholder)]">保修到期</span>
            <div class="text-[var(--ink)] mt-0.5">{{ detailEquipment.warrantyExpire || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-ghost flex-1" @click="openEdit(detailEquipment!)">
        <XqIcon name="edit" size="14" />编辑
      </button>
      <button class="btn btn-ghost flex-1" @click="handleMaintain">
        <XqIcon name="tool" size="14" />维保记录
      </button>
      <button class="btn btn-primary flex-1" @click="handleTicket">
        <XqIcon name="ticket" size="14" />报修工单
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑设备抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '新建设备' : '编辑设备'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>
