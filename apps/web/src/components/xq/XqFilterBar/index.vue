<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface FilterOption {
  key: string
  label: string
  type?: 'select'
  options?: { value: string | number; label: string }[]
}

interface Props {
  filters: FilterOption[]
  values: Record<string, unknown>
  showReset?: boolean
  maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  values: () => ({}),
  showReset: true,
  maxVisible: 5,
})

const emit = defineEmits<{
  'update:values': [values: Record<string, unknown>]
  change: [values: Record<string, unknown>]
  reset: []
}>()

const isMobile = ref(false)
const showMore = ref(false)

function checkMobile(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const visibleFilters = computed(() => {
  if (isMobile.value) return props.filters
  if (showMore.value) return props.filters
  return props.filters.slice(0, props.maxVisible)
})

const hasMore = computed(() => props.filters.length > props.maxVisible)

function handleChange(key: string, value: unknown): void {
  const newValues = { ...props.values, [key]: value }
  emit('update:values', newValues)
  emit('change', newValues)
}

function handleReset(): void {
  const resetValues: Record<string, unknown> = {}
  for (const f of props.filters) {
    resetValues[f.key] = ''
  }
  emit('update:values', resetValues)
  emit('reset')
}
</script>

<template>
  <div v-if="isMobile">
    <!-- Mobile: filter chip -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2">
      <template
        v-for="f in filters"
        :key="f.key"
      >
        <select
          :value="(values[f.key] as string) ?? ''"
          class="min-w-0 px-3 py-1.5 text-xs rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]"
          @change="(e: Event) => handleChange(f.key, (e.target as HTMLSelectElement).value)"
        >
          <option value="">
            {{ f.label }}
          </option>
          <option
            v-for="opt in (f.options ?? [])"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </template>
      <button
        v-if="showReset"
        class="px-3 py-1.5 text-xs rounded-full text-[var(--primary)] whitespace-nowrap flex-shrink-0"
        @click="handleReset"
      >
        重置
      </button>
    </div>
  </div>

  <!-- Desktop: inline filters -->
  <div v-else class="flex items-center gap-3 flex-wrap">
    <template
      v-for="f in visibleFilters"
      :key="f.key"
    >
      <select
        :value="(values[f.key] as string) ?? ''"
        class="px-3 py-1.5 text-sm rounded-md border border-[var(--line)] bg-[var(--card)] text-[var(--ink)] min-w-[120px]"
        @change="(e: Event) => handleChange(f.key, (e.target as HTMLSelectElement).value)"
      >
        <option value="">
          {{ f.label }}
        </option>
        <option
          v-for="opt in (f.options ?? [])"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </template>
    <button
      v-if="hasMore"
      class="px-3 py-1.5 text-sm text-[var(--primary)] hover:underline"
      @click="showMore = !showMore"
    >
      {{ showMore ? '收起' : '更多筛选' }}
    </button>
    <button
      v-if="showReset"
      class="px-3 py-1.5 text-sm text-[var(--sub)] hover:text-[var(--ink)]"
      @click="handleReset"
    >
      清空筛选
    </button>
  </div>
</template>
