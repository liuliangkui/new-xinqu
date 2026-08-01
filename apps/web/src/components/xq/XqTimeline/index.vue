<script setup lang="ts">
interface TimelineItem {
  time: string
  title: string
  content: string
  operator?: string
  status?: string
  statusColor?: string
}

interface Props {
  data: TimelineItem[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="!data.length" class="py-6 text-center text-sm text-[var(--placeholder)]">
    暂无记录
  </div>
  <div v-else class="relative pl-6 space-y-5">
    <!-- Vertical line -->
    <div class="absolute left-2 top-1.5 bottom-1.5 w-px bg-[var(--line)]" />
    <div
      v-for="(item, idx) in data"
      :key="idx"
      class="relative"
    >
      <!-- Dot -->
      <div
        class="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--primary)]"
        :style="item.statusColor ? { backgroundColor: item.statusColor } : {}"
      />
      <div class="text-xs text-[var(--sub])] mb-1">
        {{ item.time }}
        <span
          v-if="item.operator"
          class="ml-2"
        >
          · {{ item.operator }}
        </span>
      </div>
      <div class="text-sm font-medium text-[var(--ink)]">
        {{ item.title }}
      </div>
      <div
        v-if="item.content"
        class="text-sm text-[var(--sub)] mt-0.5"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>
