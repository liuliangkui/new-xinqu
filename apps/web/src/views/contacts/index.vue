<script setup lang="ts">
// 通讯录 — 列表页主入口
// 对应《通讯录功能与交互说明.md》v1.0
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { NavTabItem, StatusMap } from '@/types/common'
import {
  ContactRole,
  ContactAttitude,
  ContactType,
  type Contact,
  type ContactFormData,
  type ContactListParams,
  type TabType,
} from './types'
import {
  mockGetContactList,
  mockGetContactDetail,
  mockCreateContact,
  mockUpdateContact,
} from './mock'
import type { ContactStats } from './types'

const router = useRouter()

// ---- 响应式 ----
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

// ---- 状态 ----
const viewMode = ref<'card' | 'list'>(isMobile.value ? 'card' : 'list')
const contacts = ref<Contact[]>([])
const total = ref(0)
const loading = ref(false)
const stats = ref<ContactStats>({
  contactTotalCount: 0,
  decisionMakerCount: 0,
  influencerCount: 0,
  handlerCount: 0,
})

// 搜索与筛选
const keyword = ref('')
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const activeTab = ref<TabType>('all')
const filterValues = ref<Record<string, unknown>>({
  regionCode: '',
  contactRole: '',
  contactType: '',
  status: '',
})
const pagination = ref({ page: 1, size: 12 })

// 抽屉状态
const detailVisible = ref(false)
const detailContact = ref<Contact | null>(null)
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formData = ref<ContactFormData>(emptyForm())
const formLoading = ref(false)

// ---- 枚举映射 ----
const contactRoleMap: StatusMap = {
  [ContactRole.DECISION_MAKER]: { text: '决策者', color: 'blue' },
  [ContactRole.INFLUENCER]: { text: '影响者', color: 'orange' },
  [ContactRole.HANDLER]: { text: '经办人', color: 'gray' },
  [ContactRole.USER]: { text: '使用者', color: 'green' },
}

const attitudeMap: StatusMap = {
  [ContactAttitude.SUPPORT]: { text: '支持', color: 'green' },
  [ContactAttitude.NEUTRAL]: { text: '中立', color: 'orange' },
  [ContactAttitude.WAITING]: { text: '观望', color: 'gray' },
  [ContactAttitude.OPPOSE]: { text: '反对', color: 'red' },
}

// ---- Tabs ----
const tabs: NavTabItem[] = [
  { key: 'all', label: '全部联系人' },
  { key: 'my', label: '我的联系人' },
  { key: 'team', label: '团队联系人' },
  { key: 'org', label: '组织架构' },
]

// ---- 筛选 ----
const filterConfig = [
  {
    key: 'regionCode',
    label: '地区',
    options: [
      { value: '', label: '全部地区' },
      { value: '5301', label: '昆明' },
      { value: '5302', label: '曲靖' },
      { value: '5303', label: '玉溪' },
      { value: '5329', label: '大理' },
      { value: '5304', label: '红河' },
    ],
  },
  {
    key: 'contactRole',
    label: '角色',
    options: [
      { value: '', label: '全部角色' },
      { value: '1', label: '决策者' },
      { value: '2', label: '影响者' },
      { value: '3', label: '经办人' },
      { value: '4', label: '使用者' },
    ],
  },
  {
    key: 'contactType',
    label: '类型',
    options: [
      { value: '', label: '全部类型' },
      { value: '1', label: '客户联系人' },
      { value: '2', label: '经销商联系人' },
      { value: '3', label: '内部用户' },
    ],
  },
]

// ---- 表格列 ----
const tableColumns = [
  { title: '医院/机构', dataIndex: 'customerName', width: '200px' },
  { title: '联系人', dataIndex: 'contactName', width: '120px' },
  { title: '职务', dataIndex: 'jobTitle', width: '150px', mobileHidden: true },
  { title: '地区', dataIndex: 'regionName', width: '80px', mobileHidden: true },
  { title: '角色', dataIndex: 'contactRole', width: '80px' },
  { title: '操作', dataIndex: 'actions', width: '120px', fixed: 'right' as const },
]

// ---- 表单字段 ----
const formFields = [
  { key: 'contactName', label: '姓名', required: true, placeholder: '请输入联系人姓名' },
  { key: 'customerId', label: '所属客户 ID', required: true, placeholder: '请输入客户ID' },
  { key: 'jobTitle', label: '职务', required: true, placeholder: '请输入职务' },
  {
    key: 'mobilePhone',
    label: '手机号',
    type: 'tel' as const,
    required: true,
    placeholder: '请输入手机号',
  },
  { key: 'email', label: '邮箱', type: 'email' as const },
  {
    key: 'contactRole',
    label: '角色',
    type: 'select' as const,
    required: true,
    placeholder: '请选择角色',
    options: [
      { value: '1', label: '决策者' },
      { value: '2', label: '影响者' },
      { value: '3', label: '经办人' },
      { value: '4', label: '使用者' },
    ],
  },
  {
    key: 'attitude',
    label: '态度',
    type: 'select' as const,
    options: [
      { value: '1', label: '支持' },
      { value: '2', label: '中立' },
      { value: '3', label: '观望' },
      { value: '4', label: '反对' },
    ],
  },
  {
    key: 'contactType',
    label: '联系人类型',
    type: 'select' as const,
    required: true,
    options: [
      { value: '1', label: '客户联系人' },
      { value: '2', label: '经销商联系人' },
      { value: '3', label: '内部用户' },
    ],
  },
  { key: 'department', label: '所属科室', placeholder: '请输入科室名称' },
  { key: 'remark', label: '备注', type: 'textarea' as const, placeholder: '请输入备注信息' },
]

// ---- 工具函数 ----
function emptyForm(): ContactFormData {
  return {
    contactName: '',
    customerId: null,
    jobTitle: '',
    contactRole: null,
    contactType: null,
    mobilePhone: '',
    email: '',
    department: '',
    remark: '',
    attitude: null,
  }
}

// ---- 数据获取 ----
async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: ContactListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(filterValues.value.regionCode
        ? { regionCode: String(filterValues.value.regionCode) }
        : {}),
      ...(filterValues.value.contactRole
        ? { contactRole: Number(filterValues.value.contactRole) }
        : {}),
      ...(filterValues.value.contactType
        ? { contactType: Number(filterValues.value.contactType) }
        : {}),
      ...(activeTab.value !== 'all' ? { tabType: activeTab.value } : {}),
    }
    const result = await mockGetContactList(params)
    contacts.value = result.list
    total.value = result.total
    stats.value = result.stats
  } finally {
    loading.value = false
  }
}

// ---- 搜索 ----
function handleSearch(val: string): void {
  keyword.value = val
  pagination.value.page = 1
  fetchList()
}

function handleSearchInput(): void {
  if (searchTimer.value) clearTimeout(searchTimer.value)
  searchTimer.value = setTimeout(() => {
    handleSearch(keyword.value)
  }, 300)
}

function handleSearchReset(): void {
  keyword.value = ''
  pagination.value.page = 1
  fetchList()
}

// ---- Tab 切换 ----
function handleTabChange(key: string | number): void {
  activeTab.value = key as TabType
  pagination.value.page = 1
  fetchList()
}

// ---- 筛选 ----
function handleFilterChange(values: Record<string, unknown>): void {
  filterValues.value = values
  pagination.value.page = 1
  fetchList()
}

function handleFilterReset(): void {
  filterValues.value = { regionCode: '', contactRole: '', contactType: '', status: '' }
  pagination.value.page = 1
  fetchList()
}

// ---- 视图切换 ----
function handleViewChange(val: 'card' | 'list'): void {
  viewMode.value = val
}

// ---- 行点击 —— 打开详情 ----
async function handleRowClick(record: Contact): Promise<void> {
  const detail = await mockGetContactDetail(record.contactId)
  if (detail) {
    detailContact.value = detail
    detailVisible.value = true
  }
}

// ---- 新建 ----
function openCreate(): void {
  formMode.value = 'create'
  formData.value = emptyForm()
  formVisible.value = true
}

async function handleFormSubmit(values: Record<string, unknown>): Promise<void> {
  formLoading.value = true
  try {
    const data: ContactFormData = {
      ...emptyForm(),
      ...values,
      customerId: Number(values.customerId) || null,
      contactRole: Number(values.contactRole) as ContactRole | null,
      contactType: Number(values.contactType) as ContactType | null,
      attitude: values.attitude ? (Number(values.attitude) as ContactAttitude) : null,
    }

    if (formMode.value === 'create') {
      await mockCreateContact(data)
    } else if (detailContact.value) {
      await mockUpdateContact(detailContact.value.contactId, data)
    }

    formVisible.value = false
    fetchList()
  } finally {
    formLoading.value = false
  }
}

// ---- 编辑（从详情抽屉）----
function openEditFromDetail(): void {
  if (!detailContact.value) return
  formMode.value = 'edit'
  formData.value = {
    contactName: detailContact.value.contactName,
    customerId: detailContact.value.customerId,
    customerName: detailContact.value.customerName,
    jobTitle: detailContact.value.jobTitle,
    contactRole: detailContact.value.contactRole,
    contactType: detailContact.value.contactType,
    mobilePhone: detailContact.value.mobilePhone,
    email: detailContact.value.email,
    department: detailContact.value.department,
    remark: detailContact.value.remark,
    attitude: detailContact.value.attitude ?? null,
  }
  formVisible.value = true
}

// ---- 跳转客户 ----
function goToCustomer(): void {
  if (detailContact.value) {
    router.push(`/customer/${detailContact.value.customerId}`)
  }
}

// ---- 快捷操作 ----
function callPhone(): void {
  if (detailContact.value?.mobilePhone) {
    window.location.href = `tel:${detailContact.value.mobilePhone}`
  }
}

// ---- 分页 ----
const hasMore = computed(() => pagination.value.page * pagination.value.size < total.value)

function pageChange(page: number): void {
  pagination.value.page = page
  fetchList()
}

// ---- 脱敏 ----
function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(7)
}
</script>

<template>
  <XqPageLayout title="通讯录">
    <!-- 标题右侧操作 -->
    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <XqIcon name="plus" size="14" />
        添加联系人
      </XqButton>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-x-auto">
        <XqKpiCard title="总联系人" :value="stats.contactTotalCount" color="primary" />
        <XqKpiCard title="决策者" :value="stats.decisionMakerCount" color="primary" />
        <XqKpiCard title="影响者" :value="stats.influencerCount" color="warning" />
        <XqKpiCard title="经办人" :value="stats.handlerCount" color="ink" />
      </div>
    </template>

    <!-- Tab + 视图切换 -->
    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
      <XqViewSwitch :value="viewMode" @change="handleViewChange" />
    </template>

    <!-- 搜索 + 筛选 -->
    <template #filter>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <XqSearchBar
          v-model="keyword"
          placeholder="搜索医院、联系人、职务…"
          :pinyin-search="true"
          width="240px"
          @search="handleSearch"
          @reset="handleSearchReset"
          @update:model-value="handleSearchInput"
        />
        <XqFilterBar
          :filters="filterConfig"
          :values="filterValues"
          @change="handleFilterChange"
          @reset="handleFilterReset"
        />
      </div>
    </template>

    <!-- 内容区 -->
    <template #content>
      <!-- 列表视图 -->
      <XqDataTable
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="contacts"
        :loading="loading"
        row-key="contactId"
        @row-click="handleRowClick"
      >
        <template #contactRole="{ value }">
          <XqStatusBadge :status="value" :status-map="contactRoleMap" />
        </template>
        <template #actions="{ record }">
          <div class="flex items-center gap-2" @click.stop>
            <button
              class="text-sm text-[var(--primary)] hover:underline"
              @click="handleRowClick(record)"
            >
              查看
            </button>
            <button
              class="text-sm text-[var(--sub)] hover:underline"
              @click="(handleRowClick(record), openEditFromDetail())"
            >
              编辑
            </button>
          </div>
        </template>
      </XqDataTable>

      <!-- 卡片视图 -->
      <XqCardGrid
        v-else
        :data-source="contacts"
        :columns="4"
        :loading="loading"
        @item-click="handleRowClick"
      >
        <template #item="{ record }">
          <div class="card card-hover cursor-pointer">
            <div class="flex items-start gap-3">
              <!-- 头像 -->
              <div
                class="w-10 h-10 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold text-md flex-shrink-0"
              >
                {{ record.contactName.charAt(0) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-md font-medium text-[var(--ink)] truncate">
                    {{ record.contactName }}
                  </span>
                  <XqStatusBadge
                    :status="record.contactRole"
                    :status-map="contactRoleMap"
                    size="small"
                  />
                </div>
                <div class="text-sm text-[var(--sub)] truncate">
                  {{ record.jobTitle }}
                </div>
                <div class="text-sm text-[var(--sub)] truncate mt-0.5">
                  {{ record.customerName }}
                </div>
                <div
                  class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--line-light)]"
                >
                  <span class="text-xs text-[var(--placeholder)]">
                    {{ record.regionName }}
                  </span>
                  <span v-if="record.lastContactTime" class="text-xs text-[var(--placeholder)]">
                    {{ record.lastContactTime }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </XqCardGrid>
    </template>

    <!-- 分页 -->
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

  <!-- 移动端底部悬浮按钮 -->
  <div v-if="isMobile" class="fixed bottom-5 right-5 z-50">
    <button
      class="w-14 h-14 rounded-full bg-[var(--primary)] text-white shadow-lg flex items-center justify-center"
      @click="openCreate"
    >
      <XqIcon name="plus" size="24" />
    </button>
  </div>

  <!-- 联系人详情弹窗 -->
  <XqModal
    :visible="detailVisible"
    :title="detailContact?.contactName || '联系人详情'"
    width="720px"
    @close="detailVisible = false"
  >
    <div v-if="detailContact" class="flex flex-col gap-5">
      <!-- 基本信息卡片 -->
      <div class="card">
        <div class="flex items-start gap-4">
          <div
            class="w-14 h-14 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center text-xl font-semibold flex-shrink-0"
          >
            {{ detailContact.contactName.charAt(0) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-[var(--ink)]">
                {{ detailContact.contactName }}
              </h3>
              <XqStatusBadge :status="detailContact.contactRole" :status-map="contactRoleMap" />
              <XqStatusBadge
                v-if="detailContact.attitude"
                :status="detailContact.attitude"
                :status-map="attitudeMap"
              />
            </div>
            <div class="text-sm text-[var(--sub)] mb-1">
              {{ detailContact.jobTitle }}
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span class="text-[var(--sub)]">
                科室：{{ detailContact.department || '未填写' }}
              </span>
              <span class="text-[var(--sub)]"> 医院：{{ detailContact.customerName }} </span>
            </div>
            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-1">
              <span class="text-[var(--sub)]">
                手机：{{ maskPhone(detailContact.mobilePhone) }}
              </span>
              <span v-if="detailContact.email" class="text-[var(--sub)]">
                邮箱：{{ detailContact.email }}
              </span>
            </div>
            <div class="text-xs text-[var(--placeholder)] mt-2">
              最近接触：{{ detailContact.lastContactTime || '暂无' }} · 负责人：{{
                detailContact.ownerName
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最近互动 -->
      <div v-if="detailContact.recentInteractions?.length">
        <h4 class="text-md font-semibold text-[var(--ink)] mb-3">最近互动</h4>
        <XqTimeline :data="detailContact.recentInteractions" />
      </div>

      <!-- 备注 -->
      <div v-if="detailContact.remark" class="card">
        <div class="text-xs text-[var(--placeholder)] mb-1">备注</div>
        <div class="text-sm text-[var(--ink)]">
          {{ detailContact.remark }}
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-ghost flex-1" @click="callPhone">
        <XqIcon name="bell" size="14" />
        拨打电话
      </button>
      <button class="btn btn-ghost flex-1" @click="goToCustomer">
        <XqIcon name="customer" size="14" />
        查看客户
      </button>
      <button class="btn btn-primary flex-1" @click="openEditFromDetail">
        <XqIcon name="edit" size="14" />
        编辑
      </button>
    </template>
  </XqModal>

  <!-- 新建/编辑表单抽屉 -->
  <XqFormDrawer
    :visible="formVisible"
    :title="formMode === 'create' ? '添加联系人' : '编辑联系人'"
    :fields="formFields"
    :initial-values="formData as unknown as Record<string, unknown>"
    :loading="formLoading"
    @submit="handleFormSubmit"
    @cancel="formVisible = false"
  />
</template>

<script lang="ts">
import { onUnmounted } from 'vue'
</script>
