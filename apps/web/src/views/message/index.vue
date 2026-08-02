<script setup lang="ts">
/**
 * 消息中心
 */
import { ref, computed, onMounted } from 'vue'
import type { Message, MessageListParams } from './types'
import { getMessageList, markMessageRead, markAllRead } from './api'

const loading = ref(false)
const messages = ref<Message[]>([])
const total = ref(0)
const unreadCount = ref(0)
const activeTab = ref('all')
const pagination = ref({ page: 1, size: 12 })

const typeNames: Record<Message['type'], string> = {
  SYSTEM: '系统',
  TASK: '任务',
  APPROVAL: '审批',
  REMIND: '提醒',
  NOTICE: '公告',
}

const typeColors: Record<Message['type'], string> = {
  SYSTEM: 'bg-blue-100 text-blue-700',
  TASK: 'bg-green-100 text-green-700',
  APPROVAL: 'bg-purple-100 text-purple-700',
  REMIND: 'bg-orange-100 text-orange-700',
  NOTICE: 'bg-gray-100 text-gray-700',
}

const tabs = [
  { key: 'all', label: '全部消息' },
  { key: 'UNREAD', label: '未读消息' },
  { key: 'SYSTEM', label: '系统' },
  { key: 'TASK', label: '任务' },
  { key: 'APPROVAL', label: '审批' },
]

const filteredMessages = computed(() => {
  if (activeTab.value === 'all') return messages.value
  return messages.value.filter((m) => m.status === activeTab.value || m.type === activeTab.value)
})

async function fetchList(): Promise<void> {
  loading.value = true
  try {
    const params: MessageListParams = {
      pageNum: pagination.value.page,
      pageSize: pagination.value.size,
      ...(activeTab.value === 'UNREAD'
        ? { status: 'UNREAD' }
        : activeTab.value !== 'all'
          ? { type: activeTab.value }
          : {}),
    }
    const result = await getMessageList(params)
    messages.value = result.list
    total.value = result.total
    unreadCount.value = result.unreadCount
  } finally {
    loading.value = false
  }
}

function handleTabChange(key: string | number): void {
  activeTab.value = String(key)
  pagination.value.page = 1
  fetchList()
}

async function handleRead(item: Message): Promise<void> {
  if (item.status === 'READ') return
  await markMessageRead(item.messageId)
  await fetchList()
}

async function handleReadAll(): Promise<void> {
  await markAllRead()
  await fetchList()
}

function handleClick(item: Message): void {
  handleRead(item)
  if (item.route) {
    window.location.href = item.route
  }
}

onMounted(fetchList)
</script>

<template>
  <XqPageLayout title="消息中心" :show-filter="false">
    <template #actions>
      <XqButton type="primary" :disabled="unreadCount === 0" @click="handleReadAll">
        <XqIcon name="check" size="14" />
        全部已读
      </XqButton>
    </template>

    <template #stats>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div class="card p-3 flex items-center justify-between">
          <span class="text-sm text-[var(--sub)]">未读消息</span>
          <span class="text-xl font-semibold text-[var(--primary)]">{{ unreadCount }}</span>
        </div>
      </div>
    </template>

    <template #operation>
      <XqNavTabs :tabs="tabs" :active-key="activeTab" @change="handleTabChange" />
    </template>

    <template #content>
      <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
        <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>
        <div v-else-if="filteredMessages.length > 0" class="space-y-2">
          <div
            v-for="item in filteredMessages"
            :key="item.messageId"
            class="flex items-start gap-3 p-3 rounded-lg border border-[var(--line)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
            :class="item.status === 'UNREAD' ? 'bg-[var(--primary-light)]/30' : 'bg-[var(--card)]'"
            @click="handleClick(item)"
          >
            <div
              class="w-2 h-2 mt-2 rounded-full flex-shrink-0"
              :class="item.status === 'UNREAD' ? 'bg-[var(--primary)]' : 'bg-transparent'"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-[var(--ink)]">{{ item.title }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs" :class="typeColors[item.type]">{{
                  typeNames[item.type]
                }}</span>
              </div>
              <div class="text-sm text-[var(--sub)] line-clamp-2">{{ item.content }}</div>
              <div class="flex items-center gap-3 mt-2 text-xs text-[var(--placeholder)]">
                <span>{{ item.senderName }}</span>
                <span>{{ item.createdAt }}</span>
              </div>
            </div>
            <button
              v-if="item.status === 'UNREAD'"
              class="text-sm text-[var(--primary)] hover:underline flex-shrink-0"
              @click.stop="handleRead(item)"
            >
              标记已读
            </button>
          </div>
        </div>
        <XqEmptyState v-else type="empty" title="暂无消息" description="当前没有符合条件的消息" />
      </div>
    </template>
  </XqPageLayout>
</template>
