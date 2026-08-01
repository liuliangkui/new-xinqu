<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export interface MenuItem {
  key: string
  label: string
  icon: string
  path?: string
  children?: MenuItem[]
  permission?: string
}

defineProps<{
  menus: MenuItem[]
  collapsed: boolean
}>()

const emit = defineEmits<{
  'nav-click': [item: MenuItem]
}>()

const route = useRoute()

const expandedKeys = ref<string[]>([])

function isActive(item: MenuItem): boolean {
  if (item.path && route.path === item.path) return true
  if (item.children?.some((c) => c.path && route.path.startsWith(c.path))) return true
  return false
}

function isChildActive(item: MenuItem): boolean {
  return item.children?.some((c) => c.path && route.path.startsWith(c.path)) ?? false
}

function handleClick(item: MenuItem): void {
  if (item.children?.length) {
    const key = item.key
    const idx = expandedKeys.value.indexOf(key)
    if (idx > -1) {
      expandedKeys.value.splice(idx, 1)
    } else {
      expandedKeys.value.push(key)
    }
  }
  emit('nav-click', item)
}

function handleChildClick(parent: MenuItem, child: MenuItem): void {
  emit('nav-click', child)
}
</script>

<template>
  <nav class="flex flex-col py-3 overflow-y-auto h-full text-sm">
    <template v-for="item in menus" :key="item.key">
      <!-- 有子菜单 -->
      <div v-if="item.children?.length">
        <button
          class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200"
          :class="isChildActive(item) ? 'text-[var(--sidebar-active-ink)] bg-[var(--sidebar-active-bg)]' : 'text-[var(--sidebar-ink)] hover:bg-[var(--gray-bg)]'"
          @click="handleClick(item)"
        >
          <XqIcon :name="item.icon" :size="collapsed ? 20 : 16" />
          <span
            v-show="!collapsed"
            class="flex-1 truncate"
          >{{ item.label }}</span>
          <XqIcon
            v-show="!collapsed"
            name="arrow-right"
            size="12"
            class="transition-transform duration-200"
            :class="expandedKeys.includes(item.key) ? 'rotate-90' : ''"
          />
        </button>
        <div
          v-show="!collapsed && expandedKeys.includes(item.key)"
          class="ml-4 mr-2 border-l border-[var(--line)] pl-2"
        >
          <button
            v-for="child in item.children"
            :key="child.key"
            class="w-full flex items-center gap-2 px-4 py-2 text-left text-xs rounded-md transition-colors duration-200"
            :class="isActive(child) ? 'text-[var(--sidebar-active-ink)] bg-[var(--sidebar-active-bg)] font-medium' : 'text-[var(--sub)] hover:bg-[var(--gray-bg)]'"
            @click="handleChildClick(item, child)"
          >
            {{ child.label }}
          </button>
        </div>
      </div>

      <!-- 叶子菜单 -->
      <button
        v-else
        class="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-colors duration-200"
        :class="isActive(item) ? 'text-[var(--sidebar-active-ink)] bg-[var(--sidebar-active-bg)] font-medium' : 'text-[var(--sidebar-ink)] hover:bg-[var(--gray-bg)]'"
        @click="handleClick(item)"
      >
        <XqIcon :name="item.icon" :size="collapsed ? 20 : 16" />
        <span
          v-show="!collapsed"
          class="truncate"
        >{{ item.label }}</span>
      </button>
    </template>
  </nav>
</template>
