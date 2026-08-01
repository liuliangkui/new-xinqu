<script setup lang="ts">
/**
 * 工作台 — 首页
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { WorkbenchData, WorkbenchTodo } from './types'
import { getWorkbenchData } from './api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const data = ref<WorkbenchData | null>(null)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`
})

onMounted(() => {
  fetchData()
})

async function fetchData(): Promise<void> {
  loading.value = true
  try {
    data.value = await getWorkbenchData()
  } finally {
    loading.value = false
  }
}

function handleOpenApp(route?: string): void {
  if (!route) return
  router.push(route)
}

function handleOpenTodo(todo: WorkbenchTodo): void {
  if (todo.type === 'approval') router.push('/approval')
  else if (todo.type === 'task') router.push('/tasks')
  else router.push('/message')
}

function formatTime(time?: string): string {
  if (!time) return '-'
  const d = new Date(time)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <XqPageLayout title="工作台" :show-stats="false" :show-filter="false">
    <template #content>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <span class="text-[var(--sub)]">加载中...</span>
      </div>

      <div v-else-if="data" class="flex flex-col gap-5">
        <!-- 欢迎区 -->
        <div class="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold text-[var(--ink)]">
              {{ greeting }}，{{ authStore.user?.name || '用户' }}
            </h1>
            <p class="text-sm text-[var(--sub)] mt-1">今天是 {{ today }}，祝您工作愉快！</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn btn-primary" @click="router.push('/tasks')">
              <XqIcon name="task" size="14" />查看任务
            </button>
            <button class="btn btn-ghost" @click="router.push('/approval')">
              <XqIcon name="approval" size="14" />查看审批
            </button>
          </div>
        </div>

        <!-- KPI -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card p-4 flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"
            >
              <XqIcon name="task" size="24" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--ink)]">
                {{ data.stats.pendingTaskCount }}
              </div>
              <div class="text-sm text-[var(--sub)]">待办任务</div>
            </div>
          </div>
          <div class="card p-4 flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center"
            >
              <XqIcon name="approval" size="24" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--ink)]">
                {{ data.stats.pendingApprovalCount }}
              </div>
              <div class="text-sm text-[var(--sub)]">待审批</div>
            </div>
          </div>
          <div class="card p-4 flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center"
            >
              <XqIcon name="message" size="24" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--ink)]">
                {{ data.stats.unreadMessageCount }}
              </div>
              <div class="text-sm text-[var(--sub)]">未读消息</div>
            </div>
          </div>
          <div class="card p-4 flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center"
            >
              <XqIcon name="calendar" size="24" />
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--ink)]">
                {{ data.stats.todayScheduleCount }}
              </div>
              <div class="text-sm text-[var(--sub)]">今日日程</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- 快捷入口 -->
          <div class="card lg:col-span-2">
            <h2 class="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <XqIcon name="apps" size="16" />快捷入口
            </h2>
            <div class="grid grid-cols-4 sm:grid-cols-6 gap-4">
              <div
                v-for="app in data.favorites"
                :key="app.id"
                class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--gray-bg)] cursor-pointer transition-colors"
                @click="handleOpenApp(app.route)"
              >
                <div
                  class="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center"
                >
                  <XqIcon :name="app.icon || 'apps'" size="20" />
                </div>
                <span class="text-xs text-[var(--ink)] text-center">{{ app.name }}</span>
              </div>
            </div>
          </div>

          <!-- 今日日程 -->
          <div class="card">
            <h2 class="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
              <XqIcon name="calendar" size="16" />今日日程
            </h2>
            <div class="space-y-3">
              <div
                v-for="schedule in data.schedules"
                :key="schedule.scheduleId"
                class="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]"
              >
                <div class="text-sm font-medium text-[var(--primary)] w-12 text-center">
                  {{ formatTime(schedule.startTime) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-[var(--ink)] truncate">
                    {{ schedule.title }}
                  </div>
                  <div v-if="schedule.location" class="text-xs text-[var(--sub)] mt-0.5">
                    <XqIcon name="location" size="12" /> {{ schedule.location }}
                  </div>
                </div>
              </div>
              <div
                v-if="data.schedules.length === 0"
                class="text-sm text-[var(--sub)] text-center py-4"
              >
                今日暂无日程
              </div>
            </div>
          </div>
        </div>

        <!-- 待办事项 -->
        <div class="card">
          <h2 class="text-base font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <XqIcon name="bell" size="16" />待办事项
          </h2>
          <div class="space-y-2">
            <div
              v-for="todo in data.todos"
              :key="todo.todoId"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--gray-bg)] cursor-pointer transition-colors"
              @click="handleOpenTodo(todo)"
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-blue-500': todo.type === 'task',
                  'bg-orange-500': todo.type === 'approval',
                  'bg-red-500': todo.type === 'message',
                }"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-[var(--ink)]">{{ todo.title }}</div>
                <div class="text-xs text-[var(--sub)]">{{ todo.description }}</div>
              </div>
              <div class="text-xs text-[var(--placeholder)]">{{ formatTime(todo.time) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </XqPageLayout>
</template>
