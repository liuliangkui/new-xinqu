<script setup lang="ts">
/**
 * 后台设置
 */
import { ref, onMounted } from 'vue'
import type { SettingGroup, SettingItem } from './types'
import { getSettings, saveSettingItem } from './api'

const loading = ref(false)
const groups = ref<SettingGroup[]>([])

async function fetchSettings(): Promise<void> {
  loading.value = true
  try {
    const result = await getSettings()
    groups.value = result.groups
  } finally {
    loading.value = false
  }
}

async function handleSwitchChange(
  group: SettingGroup,
  item: SettingItem,
  val: boolean,
): Promise<void> {
  await saveSettingItem(group.groupId, item.itemId, val)
  await fetchSettings()
}

async function handleValueChange(
  group: SettingGroup,
  item: SettingItem,
  val: string | number,
): Promise<void> {
  await saveSettingItem(group.groupId, item.itemId, val)
  await fetchSettings()
}

onMounted(fetchSettings)
</script>

<template>
  <XqPageLayout title="后台设置" :show-stats="false" :show-filter="false">
    <template #content>
      <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="group in groups"
          :key="group.groupId"
          class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4"
        >
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--line)]">
            <XqIcon v-if="group.icon" :name="group.icon" size="18" class="text-[var(--primary)]" />
            <span class="font-semibold text-[var(--ink)]">{{ group.groupName }}</span>
          </div>
          <div class="space-y-4">
            <div
              v-for="item in group.items"
              :key="item.itemId"
              class="flex items-center justify-between gap-4"
            >
              <div class="min-w-0">
                <div class="text-sm font-medium text-[var(--ink)]">{{ item.itemName }}</div>
                <div v-if="item.description" class="text-xs text-[var(--sub)]">
                  {{ item.description }}
                </div>
              </div>
              <div class="flex-shrink-0">
                <template v-if="item.valueType === 'SWITCH'">
                  <button
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="item.value ? 'bg-[var(--primary)]' : 'bg-[var(--line)]'"
                    @click="handleSwitchChange(group, item, !item.value)"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="item.value ? 'translate-x-6' : 'translate-x-1'"
                    />
                  </button>
                </template>
                <template v-else-if="item.valueType === 'SELECT'">
                  <select
                    :value="item.value"
                    class="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                    @change="
                      handleValueChange(group, item, ($event.target as HTMLSelectElement).value)
                    "
                  >
                    <option v-for="opt in item.options" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <input
                    :value="item.value"
                    :type="item.valueType === 'NUMBER' ? 'number' : 'text'"
                    class="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                    @blur="
                      handleValueChange(
                        group,
                        item,
                        item.valueType === 'NUMBER'
                          ? Number(($event.target as HTMLInputElement).value)
                          : ($event.target as HTMLInputElement).value,
                      )
                    "
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </XqPageLayout>
</template>
