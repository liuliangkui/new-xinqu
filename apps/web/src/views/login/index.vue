<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin(): Promise<void> {
  if (!username.value || !password.value) {
    errorMsg.value = t('login.error')
    return
  }
  loading.value = true
  errorMsg.value = ''

  try {
    // Mock 登录 — 后续替换为真实接口
    await new Promise((r) => setTimeout(r, 600))
    authStore.login('mock-token', {
      id: 1,
      name: username.value,
      deptId: 1,
      deptName: '销售部',
      roles: ['sales'],
      permissions: ['*'],
    })
    router.push('/')
  } catch {
    errorMsg.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--bg)] p-5">
    <div class="card w-full max-w-[400px] p-8">
      <div class="text-center mb-8">
        <span
          class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)] text-white text-xl font-bold mb-4"
        >
          鑫
        </span>
        <h1 class="text-xl font-semibold text-[var(--ink)]">{{ t('login.title') }}</h1>
        <p class="text-sm text-[var(--sub)] mt-1">{{ t('login.subtitle') }}</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm text-[var(--ink)] mb-1.5">{{ t('login.username') }}</label>
          <input
            v-model="username"
            type="text"
            class="input"
            :placeholder="t('login.username')"
            autocomplete="username"
          />
        </div>

        <div>
          <label class="block text-sm text-[var(--ink)] mb-1.5">{{ t('login.password') }}</label>
          <input
            v-model="password"
            type="password"
            class="input"
            :placeholder="t('login.password')"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="text-xs text-[var(--danger)]">
          {{ errorMsg }}
        </p>

        <button type="submit" class="btn btn-primary w-full mt-2" :disabled="loading">
          <span v-if="loading" class="icon icon-sm animate-spin mr-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              />
            </svg>
          </span>
          {{ loading ? t('common.loading') : t('login.submit') }}
        </button>
      </form>

      <p class="text-xs text-[var(--placeholder)] text-center mt-6">鑫渠 CRM v1.0.0</p>
    </div>
  </div>
</template>
