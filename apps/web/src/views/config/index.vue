<script setup lang="ts">
/**
 * 应用配置
 */
import { ref, computed, onMounted } from 'vue'
import type { ConfigItem, ConfigForm } from './types'
import { getConfigList, saveConfig } from './api'

const loading = ref(false)
const configs = ref<ConfigItem[]>([])
const keyword = ref('')
const moduleFilter = ref('')
const formVisible = ref(false)
const formData = ref<ConfigForm>({
  module: 'SYSTEM',
  key: '',
  value: '',
  valueType: 'STRING',
  description: '',
})

const moduleOptions = [
  { value: '', label: '全部模块' },
  { value: 'SYSTEM', label: '系统' },
  { value: 'CUSTOMER', label: '客户' },
  { value: 'WORKFLOW', label: '工作流' },
  { value: 'CALENDAR', label: '日历' },
]

const filteredConfigs = computed(() => {
  let list = configs.value
  if (moduleFilter.value) {
    list = list.filter((c) => c.module === moduleFilter.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(
      (c) =>
        c.key.toLowerCase().includes(kw) ||
        (c.description && c.description.toLowerCase().includes(kw)),
    )
  }
  return list
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getConfigList()
    configs.value = res.list || []
  } finally {
    loading.value = false
  }
}

function openEdit(item: ConfigItem) {
  formData.value = {
    id: item.id,
    module: item.module,
    key: item.key,
    value: item.value,
    valueType: item.valueType,
    description: item.description,
  }
  formVisible.value = true
}

function openCreate() {
  formData.value = { module: 'SYSTEM', key: '', value: '', valueType: 'STRING', description: '' }
  formVisible.value = true
}

async function handleSave() {
  if (!formData.value.key || !formData.value.value) {
    alert('请填写键和值')
    return
  }
  await saveConfig(formData.value)
  formVisible.value = false
  await fetchList()
}

onMounted(fetchList)
</script>

<template>
  <XqPageLayout title="config" :show-stats="false" :show-filter="false" padding="16px">
    <template #title>
      <span class="section-title">应用配置</span>
    </template>

    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <span class="flex items-center gap-1">
          <XqIcon name="plus" size="14" />
          <span>新增配置</span>
        </span>
      </XqButton>
    </template>

    <template #content>
      <div class="bg-[var(--card)] rounded-xl border border-[var(--line)] p-4">
        <!-- 筛选 -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <select
            v-model="moduleFilter"
            class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option v-for="opt in moduleOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索配置键或说明"
            class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>

        <div v-else-if="filteredConfigs.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-[var(--sub)] border-b border-[var(--line)]">
                <th class="text-left py-2 px-3">模块</th>
                <th class="text-left py-2 px-3">配置键</th>
                <th class="text-left py-2 px-3">配置值</th>
                <th class="text-left py-2 px-3">类型</th>
                <th class="text-left py-2 px-3">说明</th>
                <th class="text-left py-2 px-3">更新时间</th>
                <th class="text-right py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredConfigs"
                :key="item.id"
                class="border-b border-[var(--line)] hover:bg-[var(--bg)]"
              >
                <td class="py-3 px-3 text-[var(--ink)]">{{ item.module }}</td>
                <td class="py-3 px-3 text-[var(--ink)] font-mono">{{ item.key }}</td>
                <td class="py-3 px-3 text-[var(--ink)]">{{ item.value }}</td>
                <td class="py-3 px-3 text-[var(--ink)]">{{ item.valueType }}</td>
                <td class="py-3 px-3 text-[var(--sub)]">{{ item.description || '-' }}</td>
                <td class="py-3 px-3 text-[var(--sub)]">{{ item.updatedAt }}</td>
                <td class="py-3 px-3 text-right">
                  <button
                    class="text-sm text-[var(--primary)] hover:underline"
                    @click="openEdit(item)"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <XqEmptyState v-else type="empty" title="暂无配置" description="点击右上角新增配置" />
      </div>
    </template>
  </XqPageLayout>

  <!-- 编辑/新增弹窗 -->
  <XqModal
    v-model:visible="formVisible"
    :title="formData.id ? '编辑配置' : '新增配置'"
    width="480px"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >模块 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.module"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >配置键 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.key"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >配置值 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.value"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">值类型</label>
        <select
          v-model="formData.valueType"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        >
          <option value="STRING">STRING</option>
          <option value="NUMBER">NUMBER</option>
          <option value="BOOLEAN">BOOLEAN</option>
          <option value="JSON">JSON</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">说明</label>
        <textarea
          v-model="formData.description"
          rows="2"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] resize-none"
        />
      </div>
    </div>
    <template #footer>
      <XqButton @click="formVisible = false">取消</XqButton>
      <XqButton type="primary" @click="handleSave">保存</XqButton>
    </template>
  </XqModal>
</template>
