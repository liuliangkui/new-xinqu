<script setup lang="ts">
interface Props {
  title?: string
  showBack?: boolean
  showStats?: boolean
  showFilter?: boolean
  padding?: string
}

withDefaults(defineProps<Props>(), {
  showBack: false,
  showStats: true,
  showFilter: true,
  padding: '16px',
})

const emit = defineEmits<{
  back: []
}>()

function handleBack(): void {
  emit('back')
}
</script>

<template>
  <div
    class="flex flex-col min-h-full bg-[var(--bg)] text-[var(--ink)]"
    :style="{ padding }"
  >
    <!-- 标题区 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3 min-w-0">
        <button
          v-if="showBack"
          class="btn btn-ghost p-2"
          @click="handleBack"
        >
          <XqIcon name="arrow-left" size="16" />
        </button>
        <h1 class="section-title text-ellipsis">
          <slot name="title">{{ title }}</slot>
        </h1>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <!-- 统计区 -->
    <div
      v-if="showStats"
      class="mb-4"
    >
      <slot name="stats" />
    </div>

    <!-- 操作区 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <slot name="operation" />
    </div>

    <!-- 筛选区 -->
    <div
      v-if="showFilter"
      class="mb-4"
    >
      <slot name="filter" />
    </div>

    <!-- 内容区 -->
    <div class="flex-1 min-h-0">
      <slot name="content" />
    </div>

    <!-- 分页区 -->
    <div class="mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
