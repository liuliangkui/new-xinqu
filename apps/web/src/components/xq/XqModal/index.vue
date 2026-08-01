<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  width?: string
  maskClosable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  width: '560px',
  maskClosable: true,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

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
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4"
        @click.self="handleMaskClick"
      >
        <Transition name="modal-zoom">
          <div
            v-if="visible"
            class="bg-[var(--card)] rounded-xl shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh] w-full"
            :style="{ maxWidth: width }"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] flex-shrink-0"
            >
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
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="flex items-center gap-3 px-6 py-4 border-t border-[var(--line)] flex-shrink-0]"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
// 空脚本块，保持 SFC 结构
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
