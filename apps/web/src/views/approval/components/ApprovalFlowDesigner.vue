<script setup lang="ts">
/**
 * 审批流程可视化设计器
 * 展示审批节点链，支持添加、删除、重排节点，显示每个节点审批人
 */
import { ref, computed } from 'vue'

export interface FlowNode {
  id: string
  name: string
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
}

interface Props {
  nodes: FlowNode[]
  mode?: 'serial' | 'parallel'
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'serial',
  readonly: false,
})

const emit = defineEmits<{
  'update:nodes': [value: FlowNode[]]
  'update:mode': [value: 'serial' | 'parallel']
  'click-node': [node: FlowNode, index: number]
  'add-node': []
}>()

const draggingIndex = ref<number | null>(null)

const containerClass = computed(() =>
  props.mode === 'parallel'
    ? 'flex flex-wrap items-start gap-4'
    : 'flex items-center gap-2 overflow-x-auto pb-2',
)

function updateNodes(list: FlowNode[]) {
  emit('update:nodes', list)
}

function removeNode(index: number) {
  const list = props.nodes.filter((_, i) => i !== index)
  updateNodes(list)
}

function moveNode(index: number, direction: 'left' | 'right') {
  const list = [...props.nodes]
  const target = direction === 'left' ? index - 1 : index + 1
  if (target < 0 || target >= list.length) return
  const a = list[index]
  const b = list[target]
  if (!a || !b) return
  list[index] = b
  list[target] = a
  updateNodes(list)
}

function handleDragStart(index: number) {
  draggingIndex.value = index
}

function handleDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (draggingIndex.value === null || draggingIndex.value === index) return
  const list = [...props.nodes]
  const [moved] = list.splice(draggingIndex.value, 1)
  if (!moved) return
  list.splice(index, 0, moved)
  draggingIndex.value = index
  updateNodes(list)
}

function handleDragEnd() {
  draggingIndex.value = null
}

function nodeInitials(node: FlowNode): string {
  return (node.assigneeName || node.name || '审').slice(0, 1)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-[var(--ink)]">审批流程</span>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[var(--sub)]">审批模式</span>
        <button
          class="px-2.5 py-1 text-xs rounded-md border"
          :class="
            mode === 'serial'
              ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
              : 'border-[var(--line)] text-[var(--sub)]'
          "
          @click="!readonly && $emit('update:mode', 'serial')"
        >
          串行
        </button>
        <button
          class="px-2.5 py-1 text-xs rounded-md border"
          :class="
            mode === 'parallel'
              ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]'
              : 'border-[var(--line)] text-[var(--sub)]'
          "
          @click="!readonly && $emit('update:mode', 'parallel')"
        >
          并行
        </button>
      </div>
    </div>

    <div :class="containerClass">
      <template v-for="(node, index) in nodes" :key="node.id">
        <div
          class="relative group"
          :draggable="!readonly"
          @dragstart="handleDragStart(index)"
          @dragover="(e) => handleDragOver(e, index)"
          @dragend="handleDragEnd"
        >
          <div
            class="flex items-center gap-3 px-4 py-3 rounded-xl border min-w-[140px] cursor-pointer transition-all"
            :class="
              node.assigneeId
                ? 'border-[var(--primary)] bg-[var(--primary-light)]/30'
                : 'border-[var(--line)] bg-[var(--card)] hover:border-[var(--primary)]'
            "
            @click="$emit('click-node', node, index)"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
              :class="node.assigneeId ? 'bg-[var(--primary)] text-white' : 'bg-[var(--gray-bg)] text-[var(--sub)]'"
            >
              {{ nodeInitials(node) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[var(--ink)] truncate">
                {{ node.assigneeName || '选择审批人' }}
              </div>
              <div class="text-xs text-[var(--sub)] truncate">{{ node.name }}</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div
            v-if="!readonly"
            class="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1"
          >
            <button
              v-if="index > 0"
              class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
              title="前移"
              @click.stop="moveNode(index, 'left')"
            >
              <XqIcon name="arrow-left" size="10" />
            </button>
            <button
              v-if="index < nodes.length - 1"
              class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
              title="后移"
              @click.stop="moveNode(index, 'right')"
            >
              <XqIcon name="arrow-right" size="10" />
            </button>
            <button
              class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
              title="删除"
              @click.stop="removeNode(index)"
            >
              <XqIcon name="close" size="10" />
            </button>
          </div>
        </div>

        <!-- 串行箭头 -->
        <div
          v-if="mode === 'serial' && index < nodes.length - 1"
          class="flex items-center text-[var(--placeholder)] flex-shrink-0"
        >
          <XqIcon name="arrow-right" size="16" />
        </div>
      </template>

      <!-- 添加节点 -->
      <button
        v-if="!readonly"
        class="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex-shrink-0"
        @click="$emit('add-node')"
      >
        <XqIcon name="plus" size="14" />
        <span class="text-sm">添加节点</span>
      </button>
    </div>

    <p class="text-xs text-[var(--sub)]">
      {{ mode === 'serial' ? '按节点顺序依次审批，任一节点驳回则按策略执行。' : '所有节点同时审批，全部通过才算通过。' }}
    </p>
  </div>
</template>
