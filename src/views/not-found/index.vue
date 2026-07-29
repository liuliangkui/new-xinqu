<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome(): void {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
    <div class="text-6xl font-bold text-[var(--placeholder)]">404</div>
    <h1 class="text-lg text-[var(--ink)]">页面不存在</h1>
    <p class="text-sm text-[var(--sub)]">您访问的页面可能已被移除或地址输入有误</p>
    <button class="btn btn-primary mt-4" @click="goHome">
      返回工作台
    </button>
  </div>
</template>
