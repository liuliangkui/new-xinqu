<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'empty' | 'search' | 'permission' | 'error'
  title?: string
  description?: string
  action?: {
    text: string
    onClick: () => void
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'empty',
  title: '',
  description: '',
  action: null,
})

const defaultTitles: Record<string, string> = {
  empty: '暂无相关数据',
  search: '未找到匹配结果',
  permission: '暂无权限',
  error: '加载失败',
}

const defaultDescriptions: Record<string, string> = {
  empty: '当前没有任何数据',
  search: '请尝试更换关键词或筛选条件',
  permission: '请联系管理员申请权限',
  error: '请稍后重试或联系技术支持',
}

const displayTitle = computed(() => props.title || defaultTitles[props.type])
const displayDescription = computed(() => props.description || defaultDescriptions[props.type])

const iconName = computed(() => {
  const map: Record<string, string> = {
    empty: 'more',
    search: 'search',
    permission: 'settings',
    error: 'close',
  }
  return map[props.type]
})

function handleAction(): void {
  props.action?.onClick()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 rounded-full bg-[var(--gray-bg)] flex items-center justify-center mb-4 text-[var(--placeholder)]">
      <XqIcon :name="iconName" size="32" />
    </div>
    <h3 class="text-base font-medium text-[var(--ink)] mb-2">
      {{ displayTitle }}
    </h3>
    <p class="text-sm text-[var(--sub)] mb-6 max-w-xs">
      {{ displayDescription }}
    </p>
    <XqButton
      v-if="action"
      type="primary"
      @click="handleAction"
    >
      {{ action.text }}
    </XqButton>
  </div>
</template>
