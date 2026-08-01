<script setup lang="ts">
/**
 * 收藏夹
 */
import { ref, computed, onMounted } from 'vue'
import type { FavoriteItem, FavoriteType } from './types'
import { getFavoriteList, removeFavorite } from './api'

const loading = ref(false)
const favorites = ref<FavoriteItem[]>([])
const activeType = ref<FavoriteType | 'ALL'>('ALL')

const typeOptions: { value: FavoriteType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'APP', label: '应用' },
  { value: 'CUSTOMER', label: '客户' },
  { value: 'LEAD', label: '线索' },
  { value: 'INTENTION', label: '意向' },
]

const typeNames: Record<FavoriteType, string> = {
  APP: '应用',
  CUSTOMER: '客户',
  LEAD: '线索',
  INTENTION: '意向',
}

const filteredFavorites = computed(() => {
  if (activeType.value === 'ALL') return favorites.value
  return favorites.value.filter((f) => f.targetType === activeType.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getFavoriteList()
    favorites.value = res.list || []
  } finally {
    loading.value = false
  }
}

async function handleRemove(item: FavoriteItem) {
  if (!confirm(`确定取消收藏「${item.title}」？`)) return
  await removeFavorite(item.id)
  await fetchList()
}

function handleClick(item: FavoriteItem) {
  if (item.route) {
    window.location.href = item.route
  }
}

onMounted(fetchList)
</script>

<template>
  <XqPageLayout title="favorites" :show-stats="false" :show-filter="false" padding="16px">
    <template #title>
      <span class="section-title">收藏夹</span>
    </template>

    <template #content>
      <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
        <!-- 类型筛选 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              activeType === opt.value
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--ink)] hover:bg-[var(--gray-bg)]'
            "
            @click="activeType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>

        <div
          v-else-if="filteredFavorites.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="item in filteredFavorites"
            :key="item.id"
            class="group relative p-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] hover:shadow-md transition-all cursor-pointer"
            @click="handleClick(item)"
          >
            <div class="flex items-start gap-3">
              <div
                v-if="item.icon"
                class="w-10 h-10 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0"
              >
                <XqIcon :name="item.icon" size="20" />
              </div>
              <div
                v-else
                class="w-10 h-10 rounded-lg bg-[var(--gray-bg)] text-[var(--ink)] flex items-center justify-center text-lg font-semibold flex-shrink-0"
              >
                {{ item.title.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-[var(--ink)] truncate">{{ item.title }}</p>
                <p v-if="item.subtitle" class="text-xs text-[var(--sub)] truncate">
                  {{ item.subtitle }}
                </p>
                <p class="text-xs text-[var(--sub)] mt-1">{{ typeNames[item.targetType] }}</p>
              </div>
            </div>
            <button
              class="absolute top-3 right-3 p-1.5 rounded-md text-[var(--sub)] opacity-0 group-hover:opacity-100 hover:bg-[var(--gray-bg)] transition-all"
              @click.stop="handleRemove(item)"
            >
              <XqIcon name="delete" size="14" />
            </button>
          </div>
        </div>

        <XqEmptyState
          v-else
          type="empty"
          title="暂无收藏"
          description="在应用中心、客户详情等页面点击收藏，即可在这里查看"
        />
      </div>
    </template>
  </XqPageLayout>
</template>
