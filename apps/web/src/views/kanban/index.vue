<script setup lang="ts">
/**
 * 工单看板
 */
import { ref, onMounted } from 'vue'
import type { StatusMap } from '@/types/common'
import type { KanbanColumn, KanbanStats } from './types'
import { getKanbanData, getKanbanStats } from './api'

const loading = ref(false)
const columns = ref<KanbanColumn[]>([])
const stats = ref<KanbanStats>({
  totalCount: 0,
  pendingCount: 0,
  processingCount: 0,
  waitingCount: 0,
  resolvedCount: 0,
})

const statusMap: StatusMap = {
  PENDING: { text: '待处理', color: 'orange' },
  PROCESSING: { text: '处理中', color: 'blue' },
  WAITING: { text: '待反馈', color: 'warning' },
  RESOLVED: { text: '已解决', color: 'green' },
  CLOSED: { text: '已关闭', color: 'gray' },
}

const priorityMap: StatusMap = {
  LOW: { text: '低', color: 'gray' },
  NORMAL: { text: '普通', color: 'blue' },
  HIGH: { text: '高', color: 'orange' },
  URGENT: { text: '紧急', color: 'red' },
}

async function fetchData(): Promise<void> {
  loading.value = true
  try {
    const [data, statResult] = await Promise.all([getKanbanData(), getKanbanStats()])
    columns.value = data.columns
    stats.value = statResult
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <XqPageLayout title="工单看板" :show-filter="false">
    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <XqKpiCard title="工单总数" :value="stats.totalCount" color="primary" />
        <XqKpiCard title="待处理" :value="stats.pendingCount" color="orange" />
        <XqKpiCard title="处理中" :value="stats.processingCount" color="blue" />
        <XqKpiCard title="待反馈" :value="stats.waitingCount" color="warning" />
        <XqKpiCard title="已解决" :value="stats.resolvedCount" color="green" />
      </div>
    </template>

    <template #content>
      <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>
      <div v-else class="h-full overflow-x-auto">
        <div class="flex gap-4 min-w-[1024px] h-full">
          <div
            v-for="col in columns"
            :key="col.status"
            class="flex-1 min-w-[200px] bg-[var(--gray-bg)] rounded-xl p-3 flex flex-col"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <XqStatusBadge :status="col.status" :status-map="statusMap" />
                <span class="text-sm font-medium text-[var(--ink)]">{{ col.title }}</span>
              </div>
              <span class="text-xs text-[var(--sub)] bg-[var(--card)] px-2 py-0.5 rounded-full">{{
                col.tickets.length
              }}</span>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                v-for="ticket in col.tickets"
                :key="ticket.ticketId"
                class="bg-[var(--card)] rounded-lg p-3 border border-[var(--line)] cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span class="text-xs text-[var(--sub)]">{{ ticket.ticketCode }}</span>
                  <XqStatusBadge :status="ticket.priority" :status-map="priorityMap" size="small" />
                </div>
                <div class="text-sm font-medium text-[var(--ink)] mb-2 line-clamp-2">
                  {{ ticket.title }}
                </div>
                <div class="text-xs text-[var(--sub)] truncate mb-1">{{ ticket.customerName }}</div>
                <div class="flex items-center justify-between text-xs text-[var(--placeholder)]">
                  <span>{{ ticket.assigneeName }}</span>
                  <span v-if="ticket.deadline">截止 {{ ticket.deadline }}</span>
                </div>
              </div>
              <div
                v-if="col.tickets.length === 0"
                class="text-center py-8 text-xs text-[var(--sub)]"
              >
                暂无工单
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </XqPageLayout>
</template>
