<script setup lang="ts">
import { computed } from 'vue'
import type { ViewOption } from '@/types/common'

interface Props {
  value: 'card' | 'list'
  options?: ViewOption[]
}

const props = withDefaults(defineProps<Props>(), {
  value: 'card',
  options: () => [
    { key: 'card', label: '卡片', icon: 'grid' },
    { key: 'list', label: '列表', icon: 'list' },
  ],
})

const emit = defineEmits<{
  'update:value': [value: 'card' | 'list']
  change: [value: 'card' | 'list']
}>()

const normalizedOptions = computed(() =>
  props.options.map((opt) => ({
    ...opt,
    label: opt.label || (opt.key === 'card' ? '卡片' : '列表'),
    icon: opt.icon || (opt.key === 'card' ? 'grid' : 'list'),
  })),
)

function isActive(key: string): boolean {
  return key === props.value
}

function handleClick(key: string): void {
  if (key === 'card' || key === 'list') {
    emit('update:value', key)
    emit('change', key)
  }
}
</script>

<template>
  <div class="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--card)] p-0.5">
    <button
      v-for="opt in normalizedOptions"
      :key="opt.key"
      class="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors duration-200"
      :class="isActive(opt.key) ? 'bg-[var(--primary-light)] text-[var(--primary)] font-medium' : 'text-[var(--sub)] hover:bg-[var(--gray-bg)]'"
      @click="handleClick(opt.key)"
    >
      <XqIcon :name="opt.icon" size="14" />
      <span>{{ opt.label }}</span>
    </button>
  </div>
</template>
