<script setup lang="ts">
import { computed } from 'vue'
import type { NavTabItem } from '@/types/common'

interface Props {
  tabs: NavTabItem[]
  activeKey: string | number
  type?: 'line' | 'card' | 'pill'
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  showCount: true,
})

const emit = defineEmits<{
  'update:activeKey': [key: string | number]
  change: [key: string | number]
}>()

const baseClasses = computed(() => {
  const map: Record<string, string> = {
    line: 'px-4 py-2 text-sm border-b-2 border-transparent hover:text-[var(--primary)]',
    card: 'px-4 py-2 text-sm rounded-t-md border border-transparent',
    pill: 'px-4 py-1.5 text-sm rounded-full',
  }
  return map[props.type]
})

const activeClasses = computed(() => {
  const map: Record<string, string> = {
    line: 'text-[var(--primary)] border-[var(--primary)] font-medium',
    card: 'bg-[var(--card)] text-[var(--primary)] border-[var(--line)] border-b-[var(--card)] font-medium',
    pill: 'bg-[var(--primary)] text-white',
  }
  return map[props.type]
})

const inactiveClasses = computed(() => {
  const map: Record<string, string> = {
    line: 'text-[var(--sub)]',
    card: 'text-[var(--sub)] bg-[var(--panel)]',
    pill: 'text-[var(--sub)] hover:bg-[var(--gray-bg)]',
  }
  return map[props.type]
})

function isActive(key: string | number): boolean {
  return key === props.activeKey
}

function handleClick(tab: NavTabItem): void {
  if (tab.disabled) return
  emit('update:activeKey', tab.key)
  emit('change', tab.key)
}
</script>

<template>
  <div class="flex items-center gap-1 overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="whitespace-nowrap flex-shrink-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        baseClasses,
        isActive(tab.key) ? activeClasses : inactiveClasses,
      ]"
      :disabled="tab.disabled"
      @click="handleClick(tab)"
    >
      {{ tab.label }}
      <span
        v-if="showCount && tab.count !== undefined"
        class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
        :class="isActive(tab.key) ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'bg-[var(--gray-bg)] text-[var(--sub)]'"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
