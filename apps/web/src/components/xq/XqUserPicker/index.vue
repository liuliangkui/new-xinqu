<script setup lang="ts">
/**
 * 人员选择器
 * 支持按部门筛选、关键词搜索、多选/单选、已选汇总
 */
import { ref, computed, onMounted, watch } from 'vue'
import { getUserList, getDepartmentList, type UserItem, type DepartmentItem } from '@/api/user'

interface Props {
  visible: boolean
  modelValue: string[]
  title?: string
  multiple?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '选择人员',
  multiple: true,
  placeholder: '搜索姓名、用户名',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:modelValue': [value: string[]]
  confirm: [value: string[]]
}>()

const loading = ref(false)
const departments = ref<DepartmentItem[]>([])
const users = ref<UserItem[]>([])
const selectedDeptId = ref<string>('')
const keyword = ref('')
const page = ref(1)
const pageSize = 50
const total = ref(0)
const selectedIds = ref<string[]>([])

const hasMore = computed(() => users.value.length < total.value)

const deptTree = computed(() => {
  const all: DepartmentItem[] = [{ id: '', name: '全部人员' }]
  return all.concat(departments.value)
})

const selectedMap = computed(() => new Set(selectedIds.value))

function buildUserDisplayName(user: UserItem): string {
  return user.name || user.username
}

function buildUserSubtitle(user: UserItem): string {
  const parts: string[] = []
  if (user.username && user.username !== user.name) parts.push(user.username)
  if (user.email) parts.push(user.email)
  return parts.join(' · ') || '-'
}

async function fetchDepartments() {
  try {
    const res = await getDepartmentList()
    departments.value = res.list || []
  } catch {
    departments.value = []
  }
}

async function fetchUsers(reset = false) {
  if (reset) {
    page.value = 1
    users.value = []
  }
  loading.value = true
  try {
    const res = await getUserList({
      page: page.value,
      pageSize,
      keyword: keyword.value || undefined,
      departmentId: selectedDeptId.value || undefined,
      status: 'ACTIVE',
    })
    const list = res.list || []
    users.value = reset ? list : users.value.concat(list)
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value += 1
  fetchUsers(false)
}

function toggleUser(user: UserItem) {
  if (props.multiple) {
    const set = new Set(selectedIds.value)
    if (set.has(user.id)) {
      set.delete(user.id)
    } else {
      set.add(user.id)
    }
    selectedIds.value = Array.from(set)
  } else {
    selectedIds.value = [user.id]
  }
}

function removeSelected(id: string) {
  selectedIds.value = selectedIds.value.filter((v) => v !== id)
}

function handleDeptChange(id: string) {
  selectedDeptId.value = id
  fetchUsers(true)
}

function handleSearch() {
  fetchUsers(true)
}

function handleConfirm() {
  emit('update:modelValue', [...selectedIds.value])
  emit('confirm', [...selectedIds.value])
  emit('update:visible', false)
}

function handleCancel() {
  emit('update:visible', false)
}

function reset() {
  selectedIds.value = [...props.modelValue]
  selectedDeptId.value = ''
  keyword.value = ''
  fetchUsers(true)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedIds.value = [...props.modelValue]
      fetchDepartments()
      fetchUsers(true)
    }
  },
)

onMounted(() => {
  if (props.visible) {
    reset()
  }
})
</script>

<template>
  <XqModal
    :visible="visible"
    :title="title"
    width="720px"
    @update:visible="(v: boolean) => emit('update:visible', v)"
  >
    <div class="flex flex-col h-[520px]">
      <!-- 搜索 -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 relative">
          <XqIcon
            name="search"
            size="16"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder)]"
          />
          <input
            v-model="keyword"
            type="text"
            class="input pl-9 w-full"
            :placeholder="placeholder"
            @keyup.enter="handleSearch"
          />
        </div>
        <button class="btn btn-ghost text-sm" @click="handleSearch">搜索</button>
      </div>

      <div class="flex flex-1 min-h-0 gap-4">
        <!-- 部门 -->
        <div class="w-44 flex-shrink-0 border border-[var(--line)] rounded-lg overflow-hidden">
          <div class="px-3 py-2 text-xs font-medium text-[var(--sub)] bg-[var(--bg)] border-b border-[var(--line)]">
            按部门筛选
          </div>
          <div class="overflow-y-auto h-[calc(100%-36px)] p-1.5">
            <div
              v-for="dept in deptTree"
              :key="dept.id"
              class="px-3 py-2 text-sm rounded-md cursor-pointer truncate"
              :class="
                selectedDeptId === dept.id
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
              "
              @click="handleDeptChange(dept.id)"
            >
              {{ dept.name }}
            </div>
          </div>
        </div>

        <!-- 用户列表 -->
        <div class="flex-1 border border-[var(--line)] rounded-lg overflow-hidden flex flex-col">
          <div class="px-4 py-2 text-xs text-[var(--sub)] bg-[var(--bg)] border-b border-[var(--line)]">
            共 {{ total }} 人
            <span v-if="selectedIds.length > 0" class="ml-2 text-[var(--primary)]"
              >已选 {{ selectedIds.length }} 人</span
            >
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="loading && users.length === 0" class="py-8 text-center text-sm text-[var(--placeholder)]">
              加载中…
            </div>
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--gray-bg)]"
              :class="selectedMap.has(user.id) ? 'bg-[var(--primary-light)]/50' : ''"
              @click="toggleUser(user)"
            >
              <div
                class="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
                :class="
                  selectedMap.has(user.id)
                    ? 'bg-[var(--primary)] border-[var(--primary)]'
                    : 'border-[var(--line)] bg-[var(--card)]'
                "
              >
                <XqIcon v-if="selectedMap.has(user.id)" name="check" size="12" class="text-white" />
              </div>
              <div class="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 text-sm font-medium">
                {{ buildUserDisplayName(user).slice(0, 1) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-[var(--ink)] truncate">
                  {{ buildUserDisplayName(user) }}
                </div>
                <div class="text-xs text-[var(--sub)] truncate">{{ buildUserSubtitle(user) }}</div>
              </div>
            </div>
            <div v-if="hasMore" class="py-3 text-center">
              <button class="text-sm text-[var(--primary)] hover:underline" @click.stop="loadMore">
                加载更多
              </button>
            </div>
            <div v-if="!loading && users.length === 0" class="py-8 text-center text-sm text-[var(--placeholder)]">
              暂无匹配人员
            </div>
          </div>
        </div>
      </div>

      <!-- 已选汇总 -->
      <div class="mt-4 pt-3 border-t border-[var(--line)]">
        <div class="text-xs text-[var(--sub)] mb-2">已选人员</div>
        <div class="flex flex-wrap gap-2 min-h-[36px]">
          <span
            v-for="id in selectedIds"
            :key="id"
            class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-[var(--primary-light)] text-[var(--primary)]"
          >
            {{ buildUserDisplayName(users.find((u) => u.id === id) || { id, name: id, username: id, roleIds: [], status: '', createdAt: '' }) }}
            <button class="hover:text-[var(--ink)]" @click="removeSelected(id)">
              <XqIcon name="close" size="12" />
            </button>
          </span>
          <span v-if="selectedIds.length === 0" class="text-sm text-[var(--placeholder)]">未选择</span>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-ghost flex-1" @click="handleCancel">取消</button>
      <button class="btn btn-primary flex-1" @click="handleConfirm">
        确定（{{ selectedIds.length }}）
      </button>
    </template>
  </XqModal>
</template>
