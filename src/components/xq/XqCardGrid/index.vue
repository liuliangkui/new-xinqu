<script setup lang="ts" generic="T extends Record<string, unknown>">
interface Props {
  dataSource: T[]
  columns?: number
  gap?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  columns: 4,
  gap: '16px',
  loading: false,
})

const emit = defineEmits<{
  'item-click': [record: T]
}>()

const isMobile = ref(false)

function checkMobile(): void {
  const w = window.innerWidth
  isMobile.value = w < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const cols = computed(() => (isMobile.value ? 1 : props.columns))
</script>

<template>
  <div
    v-if="loading"
    class="py-12 text-center text-[var(--placeholder)]"
  >
    加载中…
  </div>
  <div
    v-else-if="!dataSource.length"
    class="py-12"
  >
    <XqEmptyState type="empty" />
  </div>
  <div
    v-else
    class="grid"
    :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }"
  >
    <div
      v-for="(record, idx) in dataSource"
      :key="idx"
      @click="emit('item-click', record)"
    >
      <slot
        name="item"
        :record="record"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
</script>
