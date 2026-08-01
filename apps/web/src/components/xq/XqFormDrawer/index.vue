<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Field {
  key: string
  label: string
  type?: 'text' | 'select' | 'textarea' | 'tel' | 'email'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
}

interface Props {
  visible: boolean
  title?: string
  fields: Field[]
  initialValues?: Record<string, unknown>
  loading?: boolean
  okText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  fields: () => [],
  initialValues: () => ({}),
  loading: false,
  okText: '保存',
  cancelText: '取消',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [values: Record<string, unknown>]
  cancel: []
}>()

const isMobile = ref(false)
const formValues = ref<Record<string, unknown>>({})
const errors = ref<Record<string, string>>({})

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

watch(
  () => props.visible,
  (v) => {
    if (v) {
      formValues.value = { ...props.initialValues }
      errors.value = {}
    }
  },
)

function validate(): boolean {
  const newErrors: Record<string, string> = {}
  for (const field of props.fields) {
    if (field.required && !formValues.value[field.key]) {
      newErrors[field.key] = `${field.label}为必填项`
    }
    if (field.type === 'tel' && formValues.value[field.key]) {
      const val = String(formValues.value[field.key])
      if (!/^1\d{10}$/.test(val)) {
        newErrors[field.key] = '请输入正确的手机号'
      }
    }
    if (field.type === 'email' && formValues.value[field.key]) {
      const val = String(formValues.value[field.key])
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        newErrors[field.key] = '请输入正确的邮箱地址'
      }
    }
  }
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function handleSubmit(): void {
  if (!validate()) return
  emit('submit', { ...formValues.value })
}

function handleClose(): void {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <XqDrawer
    :visible="visible"
    :title="title"
    :width="isMobile ? '100%' : '560px'"
    @close="handleClose"
  >
    <div class="flex flex-col gap-5">
      <div
        v-for="field in fields"
        :key="field.key"
        class="flex flex-col gap-1.5"
      >
        <label class="text-sm font-medium text-[var(--ink)]">
          {{ field.label }}
          <span
            v-if="field.required"
            class="text-[var(--danger)] ml-0.5"
          >*</span>
        </label>

        <!-- text -->
        <input
          v-if="!field.type || field.type === 'text' || field.type === 'tel' || field.type === 'email'"
          :type="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : 'text'"
          :value="formValues[field.key] as string ?? ''"
          class="input"
          :class="{ '!border-[var(--danger)]': errors[field.key] }"
          :placeholder="field.placeholder || `请输入${field.label}`"
          @input="(e: Event) => { formValues[field.key] = (e.target as HTMLInputElement).value; delete errors[field.key] }"
        >

        <!-- textarea -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :value="formValues[field.key] as string ?? ''"
          class="input min-h-[80px] resize-y"
          :class="{ '!border-[var(--danger)]': errors[field.key] }"
          :placeholder="field.placeholder || `请输入${field.label}`"
          rows="3"
          @input="(e: Event) => { formValues[field.key] = (e.target as HTMLTextAreaElement).value; delete errors[field.key] }"
        />

        <!-- select -->
        <select
          v-else-if="field.type === 'select'"
          :value="formValues[field.key] as string ?? ''"
          class="input"
          :class="{ '!border-[var(--danger)]': errors[field.key] }"
          @change="(e: Event) => { formValues[field.key] = (e.target as HTMLSelectElement).value; delete errors[field.key] }"
        >
          <option value="">
            {{ field.placeholder || `请选择${field.label}` }}
          </option>
          <option
            v-for="opt in field.options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>

        <p
          v-if="errors[field.key]"
          class="text-xs text-[var(--danger)]"
        >
          {{ errors[field.key] }}
        </p>
      </div>
    </div>

    <template #footer>
      <button
        class="btn btn-ghost flex-1"
        @click="handleClose"
      >
        {{ cancelText }}
      </button>
      <button
        class="btn btn-primary flex-1"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span
          v-if="loading"
          class="icon icon-sm animate-spin mr-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
        </span>
        {{ loading ? '保存中…' : okText }}
      </button>
    </template>
  </XqDrawer>
</template>
