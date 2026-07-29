<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'flat' | ''
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'ink'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  trend: '',
  color: 'primary',
  clickable: false,
})

const emit = defineEmits<{
  click: []
}>()

const colorClass = computed(() => {
  const map: Record<string, string> = {
    primary: 'text-[var(--primary)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
    ink: 'text-[var(--ink)]',
  }
  return map[props.color] || map.primary
})

const trendIcon = computed(() => {
  const map: Record<string, string> = {
    up: '↑',
    down: '↓',
    flat: '—',
  }
  return map[props.trend] || ''
})

function handleClick(): void {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div
    class="card min-w-[120px] flex flex-col justify-between"
    :class="clickable ? 'cursor-pointer card-hover' : ''"
    @click="handleClick"
  >
    <div class="text-xs text-[var(--sub)] mb-2 truncate">
      {{ title }}
    </div>
    <div class="flex items-baseline gap-1">
      <span
        class="kpi-value truncate"
        :class="colorClass"
      >
        {{ value }}
      </span>
      <span
        v-if="unit"
        class="text-sm text-[var(--sub)]"
      >
        {{ unit }}
      </span>
      <span
        v-if="trend"
        class="text-sm ml-1"
        :class="colorClass"
      >
        {{ trendIcon }}
      </span>
    </div>
  </div>
</template>
