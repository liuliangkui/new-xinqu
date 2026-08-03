<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import XqButton from '@/components/xq/XqButton/index.vue'
import XqIcon from '@/components/xq/XqIcon/index.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const demoAccounts = [
  { label: '系统管理员', username: 'admin', password: 'admin123' },
  { label: '销售代表', username: '13800000001', password: '123456' },
  { label: '区域经理', username: '13900000002', password: '123456' },
  { label: '只读用户', username: '13700000003', password: '123456' },
]

async function handleLogin(u?: string, p?: string): Promise<void> {
  const finalUser = u ?? username.value
  const finalPass = p ?? password.value

  if (!finalUser || !finalPass) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''

  try {
    await authStore.loginByCredentials(finalUser, finalPass)
    router.push('/')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '登录失败，请重试'
  } finally {
    loading.value = false
  }
}

function fillDemo(account: { username: string; password: string }) {
  username.value = account.username
  password.value = account.password
  void handleLogin(account.username, account.password)
}
</script>

<template>
  <div class="min-h-screen flex bg-[var(--bg)]">
    <!-- 左侧品牌区（PC 展示） -->
    <div
      class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between overflow-hidden text-white"
      style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)"
    >
      <!-- 装饰圆 -->
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
        style="background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)"
      />
      <div
        class="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-15"
        style="background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)"
      />
      <div
        class="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full opacity-20"
        style="background: radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)"
      />

      <!-- 顶部 Logo -->
      <div class="relative z-10 p-10">
        <div class="flex items-center gap-3">
          <span
            class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold"
          >
            鑫
          </span>
          <span class="text-xl font-semibold tracking-wide">鑫渠 CRM</span>
        </div>
      </div>

      <!-- 中部标语 -->
      <div class="relative z-10 px-10 xl:px-20 max-w-2xl">
        <h1 class="text-4xl xl:text-5xl font-bold leading-tight mb-6">连接业务<br />驱动增长</h1>
        <p class="text-lg text-white/80 leading-relaxed mb-10">
          鑫渠业务协同运营平台，为客户提供、线索、商机、工单、审批一站式管理，让团队协作更高效。
        </p>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <XqIcon name="customer" size="16" />
            </span>
            <span class="text-base">全生命周期客户管理</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <XqIcon name="approval" size="16" />
            </span>
            <span class="text-base">流程化审批与工单协同</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <XqIcon name="dashboard" size="16" />
            </span>
            <span class="text-base">数据驱动的经营驾驶舱</span>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="relative z-10 p-10 text-sm text-white/60">
        © 2026 鑫渠 CRM. All rights reserved.
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="flex-1 flex flex-col justify-center items-center p-6 sm:p-10">
      <div class="w-full max-w-[420px]">
        <!-- 移动端 Logo -->
        <div class="lg:hidden text-center mb-8">
          <span
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)] text-white text-xl font-bold mb-3"
          >
            鑫
          </span>
          <h1 class="text-xl font-semibold text-[var(--ink)]">鑫渠 CRM</h1>
          <p class="text-sm text-[var(--sub)] mt-1">业务协同运营平台</p>
        </div>

        <div class="card p-8 sm:p-10">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-[var(--ink)]">欢迎回来</h2>
            <p class="text-sm text-[var(--sub)] mt-2">请登录您的账号以继续使用</p>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="handleLogin()">
            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-1.5">用户名</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder)]">
                  <XqIcon name="user" size="18" />
                </span>
                <input
                  v-model="username"
                  type="text"
                  class="input pl-10"
                  placeholder="请输入用户名 / 手机号"
                  autocomplete="username"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--ink)] mb-1.5">密码</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--placeholder)]">
                  <XqIcon name="lock" size="18" />
                </span>
                <input
                  v-model="password"
                  type="password"
                  class="input pl-10"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-[var(--sub)] cursor-pointer">
                <input type="checkbox" class="rounded border-[var(--line)] text-[var(--primary)]" />
                记住我
              </label>
              <a href="#" class="text-[var(--primary)] hover:underline">忘记密码？</a>
            </div>

            <div
              v-if="errorMsg"
              class="flex items-center gap-2 text-sm text-[var(--danger)] bg-[var(--danger-bg)] px-3 py-2 rounded-lg"
            >
              <XqIcon name="close" size="14" />
              <span>{{ errorMsg }}</span>
            </div>

            <XqButton type="primary" size="large" block :loading="loading" @click="handleLogin()">
              {{ loading ? '登录中…' : '立即登录' }}
            </XqButton>
          </form>

          <!-- 演示账号快速登录 -->
          <div class="mt-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="flex-1 h-px bg-[var(--line)]" />
              <span class="text-xs text-[var(--placeholder)]">演示账号快速登录</span>
              <div class="flex-1 h-px bg-[var(--line)]" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="account in demoAccounts"
                :key="account.username"
                type="button"
                class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-sm text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                @click="fillDemo(account)"
              >
                {{ account.label }}
              </button>
            </div>
          </div>
        </div>

        <p class="text-xs text-[var(--placeholder)] text-center mt-6">
          鑫渠 CRM v1.0.0 · 演示环境数据每日重置
        </p>
      </div>
    </div>
  </div>
</template>
