<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  allowClear?: boolean
  pinyinSearch?: boolean
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索',
  allowClear: true,
  pinyinSearch: false,
  width: '240px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  reset: []
}>()

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    inputValue.value = val
  },
)

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
}

function handleSearch(): void {
  // 拼音搜索先保留 prop，实际逻辑后续实现
  if (props.pinyinSearch) {
    // TODO: pinyin search
  }
  emit('search', inputValue.value)
}

function handleClear(): void {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('reset')
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div
    class="relative flex items-center"
    :style="{ width }"
  >
    <XqIcon
      name="search"
      size="16"
      class="absolute left-3 text-[var(--placeholder)]"
    />
    <input
      v-model="inputValue"
      type="text"
      class="input w-full pl-9 pr-8"
      :placeholder="placeholder"
      @input="handleInput"
      @keydown="handleKeydown"
    >
    <button
      v-if="allowClear && inputValue"
      class="absolute right-2 p-1 text-[var(--placeholder)] hover:text-[var(--sub)]"
      @click="handleClear"
    >
      <XqIcon name="close" size="14" />
    </button>
  </div>
</template>
