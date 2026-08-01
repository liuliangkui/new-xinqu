<script setup lang="ts">
import { computed } from 'vue'
import type { StatusMap } from '@/types/common'

interface Props {
  status: string | number
  statusMap: StatusMap
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
})

const item = computed(() => props.statusMap[props.status] || { text: String(props.status), color: 'gray' })

const colorClass = computed(() => {
  const color = item.value.color || item.value.className || 'gray'
  const map: Record<string, string> = {
    gray: 'badge-gray',
    blue: 'badge-blue',
    green: 'badge-green',
    orange: 'badge-orange',
    red: 'badge-red',
    purple: 'badge-purple',
  }
  return map[color] || 'badge-gray'
})

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    small: 'text-[0.714rem] px-2 py-0.5',
    default: 'text-[0.786rem] px-2.5 py-0.5',
    large: 'text-[0.857rem] px-3 py-1',
  }
  return map[props.size]
})
</script>

<template>
  <span
    class="badge"
    :class="[colorClass, sizeClass]"
  >
    {{ item.text }}
  </span>
</template>
