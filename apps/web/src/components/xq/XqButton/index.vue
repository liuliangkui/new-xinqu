<script setup lang="ts">
interface Props {
  type?: 'primary' | 'ghost' | 'default'
  size?: 'small' | 'default' | 'large'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'default',
  loading: false,
  disabled: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent): void {
  emit('click', event)
}
</script>

<template>
  <button
    class="btn transition-colors duration-200"
    :class="[
      type === 'primary' ? 'btn-primary' : type === 'ghost' ? 'btn-ghost' : 'bg-transparent border border-[var(--line)]',
      size === 'small' ? 'px-3 py-1 text-xs' : size === 'large' ? 'px-5 py-2.5 text-base' : '',
      block ? 'w-full' : '',
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="icon icon-md animate-spin"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </span>
    <slot />
  </button>
</template>
