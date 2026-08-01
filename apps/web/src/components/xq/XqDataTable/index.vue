<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'

interface Column {
  title: string
  dataIndex: string
  width?: string | number
  fixed?: 'left' | 'right'
  mobileHidden?: boolean
}

interface Props {
  columns: Column[]
  dataSource: T[]
  loading?: boolean
  rowKey?: string
  pagination?: false | object
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: 'id',
  pagination: () => false,
})

const emit = defineEmits<{
  'row-click': [record: T]
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

const visibleColumns = computed(() =>
  isMobile.value
    ? props.columns.filter((c) => !c.mobileHidden)
    : props.columns,
)
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-[var(--panel)] border-b border-[var(--line)]">
          <th
            v-for="col in visibleColumns"
            :key="col.dataIndex"
            class="px-4 py-3 text-left text-xs font-medium text-[var(--sub)] whitespace-nowrap"
            :style="{ width: col.width, minWidth: col.width }"
            :class="{
              'sticky left-0 z-10 bg-[var(--panel)]': col.fixed === 'left',
              'sticky right-0 z-10 bg-[var(--panel)]': col.fixed === 'right',
            }"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="loading"
          class="border-b border-[var(--line-light)]"
        >
          <td
            :colspan="visibleColumns.length"
            class="px-4 py-12 text-center text-[var(--placeholder)]"
          >
            加载中…
          </td>
        </tr>
        <tr
          v-else-if="!dataSource.length"
          class="border-b border-[var(--line-light)]"
        >
          <td
            :colspan="visibleColumns.length"
            class="px-4 py-12 text-center"
          >
            <XqEmptyState type="empty" />
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="record in dataSource"
            :key="String(record[rowKey])"
            class="border-b border-[var(--line-light)] hover:bg-[var(--primary-light)] cursor-pointer transition-colors duration-150"
            @click="emit('row-click', record)"
          >
            <td
              v-for="col in visibleColumns"
              :key="col.dataIndex"
              class="px-4 py-3 whitespace-nowrap"
              :class="{
                'sticky left-0 z-10 bg-white hover:bg-[var(--primary-light)]': col.fixed === 'left',
                'sticky right-0 z-10 bg-white hover:bg-[var(--primary-light)]': col.fixed === 'right',
              }"
            >
              <slot
                :name="col.dataIndex"
                :record="record"
                :value="record[col.dataIndex]"
              >
                {{ record[col.dataIndex] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
</script>
