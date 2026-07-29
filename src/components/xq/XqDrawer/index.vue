<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  title?: string
  width?: string
  maskClosable?: boolean
  placement?: 'right' | 'left'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  width: '720px',
  maskClosable: true,
  placement: 'right',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const isMobile = ref(false)

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

function handleClose(): void {
  emit('update:visible', false)
  emit('close')
}

function handleMaskClick(): void {
  if (props.maskClosable) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[1000] bg-black/40"
        @click="handleMaskClick"
      />
    </Transition>
    <Transition name="drawer-slide">
      <div
        v-if="visible"
        class="fixed top-0 bottom-0 z-[1001] bg-[var(--card)] shadow-[var(--shadow-modal)] flex flex-col"
        :class="{
          'right-0': placement === 'right',
          'left-0': placement === 'left',
        }"
        :style="{ width: isMobile ? '100%' : width }"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] flex-shrink-0">
          <h2 class="text-lg font-semibold text-[var(--ink)] truncate">
            <slot name="title">{{ title }}</slot>
          </h2>
          <button
            class="p-1.5 rounded-md text-[var(--sub)] hover:bg-[var(--gray-bg)] transition-colors"
            @click="handleClose"
          >
            <XqIcon name="close" size="18" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="flex items-center gap-3 px-6 py-4 border-t border-[var(--line)] flex-shrink-0"
          :class="isMobile ? 'sticky bottom-0 bg-[var(--card)]' : ''"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s ease;
}
.drawer-slide-enter-from {
  transform: translateX(100%);
}
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
