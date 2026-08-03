<script setup lang="ts">
/**
 * 审批流程可视化设计器（阶段流）
 * 支持混合串并行：阶段之间串行，每个阶段内部可串行（1人）或并行（多人会签）。
 */
import { ref } from 'vue'
import type { ApprovalStage, ApprovalStageApprover, ApprovalMode } from '../types'

export type FlowStage = ApprovalStage

interface Props {
  stages: FlowStage[]
  readonly?: boolean
  currentUserId?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

const emit = defineEmits<{
  'update:stages': [value: FlowStage[]]
  'click-approver': [stageIndex: number, approverIndex: number]
  'add-stage': [mode: ApprovalMode]
  'add-self': [stageIndex: number, approverIndex: number]
}>()

const draggingStageIndex = ref<number | null>(null)
const draggingApprover = ref<{ stageIndex: number; approverIndex: number } | null>(null)

function updateStages(list: FlowStage[]) {
  emit('update:stages', list)
}

function ensureStages(): FlowStage[] {
  if (!props.stages) {
    updateStages([])
    return []
  }
  return props.stages
}

function addStage(mode: ApprovalMode) {
  const stages = [...ensureStages()]
  stages.push({
    id: `stage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${mode === 'serial' ? '串行' : '并行'}阶段 ${stages.length + 1}`,
    mode,
    approvers: mode === 'serial' ? [] : [],
  })
  updateStages(stages)
  emit('add-stage', mode)
}

function removeStage(index: number) {
  const stages = ensureStages().filter((_, i) => i !== index)
  updateStages(stages.map((s, i) => ({ ...s, name: renameStage(s, i) })))
}

function renameStage(stage: FlowStage, index: number): string {
  const prefix = stage.mode === 'serial' ? '串行' : '并行'
  return `${prefix}阶段 ${index + 1}`
}

function moveStage(index: number, direction: 'up' | 'down') {
  const stages = [...ensureStages()]
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= stages.length) return
  const a = stages[index]
  const b = stages[target]
  if (!a || !b) return
  stages[index] = b
  stages[target] = a
  updateStages(stages.map((s, i) => ({ ...s, name: renameStage(s, i) })))
}

function handleStageDragStart(index: number) {
  draggingStageIndex.value = index
}

function handleStageDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (draggingStageIndex.value === null || draggingStageIndex.value === index) return
  const stages = [...ensureStages()]
  const [moved] = stages.splice(draggingStageIndex.value, 1)
  if (!moved) return
  stages.splice(index, 0, moved)
  draggingStageIndex.value = index
  updateStages(stages.map((s, i) => ({ ...s, name: renameStage(s, i) })))
}

function handleStageDragEnd() {
  draggingStageIndex.value = null
}

function addApprover(stageIndex: number) {
  const stages = [...ensureStages()]
  const stage = stages[stageIndex]
  if (!stage) return
  stage.approvers.push({ id: '', name: '' })
  updateStages(stages)
}

function removeApprover(stageIndex: number, approverIndex: number) {
  const stages = [...ensureStages()]
  const stage = stages[stageIndex]
  if (!stage) return
  stage.approvers = stage.approvers.filter((_, i) => i !== approverIndex)
  if (stage.approvers.length === 0 && stage.mode === 'parallel') {
    // 并行阶段保留空位，避免误删
  }
  updateStages(stages)
}

function handleApproverDragStart(stageIndex: number, approverIndex: number) {
  draggingApprover.value = { stageIndex, approverIndex }
}

function handleApproverDragOver(e: DragEvent, stageIndex: number, approverIndex: number) {
  e.preventDefault()
  if (!draggingApprover.value) return
  if (
    draggingApprover.value.stageIndex === stageIndex &&
    draggingApprover.value.approverIndex === approverIndex
  )
    return
  const stages = [...ensureStages()]
  const fromStage = stages[draggingApprover.value.stageIndex]
  const toStage = stages[stageIndex]
  if (!fromStage || !toStage) return

  const [moved] = fromStage.approvers.splice(draggingApprover.value.approverIndex, 1)
  if (!moved) return

  if (fromStage === toStage) {
    toStage.approvers.splice(approverIndex, 0, moved)
  } else {
    toStage.approvers.splice(approverIndex, 0, moved)
    if (toStage.mode === 'serial' && toStage.approvers.length > 1) {
      // 拖到串行阶段时，只保留第一个，其余退回到原阶段
      const overflow = toStage.approvers.splice(1)
      fromStage.approvers.splice(draggingApprover.value.approverIndex, 0, ...overflow)
    }
  }
  draggingApprover.value = { stageIndex, approverIndex }
  updateStages(stages)
}

function handleApproverDragEnd() {
  draggingApprover.value = null
}

function approverInitials(approver?: ApprovalStageApprover): string {
  return (approver?.name || approver?.id || '审').slice(0, 1)
}

function stageSummary(stage: FlowStage): string {
  if (stage.mode === 'serial') return '1 人依次审批'
  return `${stage.approvers.length || 0} 人会签（全部通过才通过）`
}

function canAddSelf(stage: FlowStage): boolean {
  return !!props.currentUserId && !stage.approvers.some((a) => a.id === props.currentUserId)
}

function addSelf(stageIndex: number, approverIndex: number) {
  if (!props.currentUserId) return
  const stages = [...ensureStages()]
  const stage = stages[stageIndex]
  if (!stage) return
  const selfName = '我自己'
  const approvers = [...stage.approvers]
  approvers[approverIndex] = { id: props.currentUserId, name: selfName }
  stage.approvers = approvers
  updateStages(stages)
  emit('add-self', stageIndex, approverIndex)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-[var(--ink)]">审批流程</span>
      <span class="text-xs text-[var(--sub)]">阶段之间串行，阶段内可并行</span>
    </div>

    <!-- 阶段列表 -->
    <div class="flex flex-col gap-3">
      <template v-for="(stage, stageIndex) in stages" :key="stage.id">
        <div
          class="relative group"
          :draggable="!readonly"
          @dragstart="handleStageDragStart(stageIndex)"
          @dragover="(e) => handleStageDragOver(e, stageIndex)"
          @dragend="handleStageDragEnd"
        >
          <div
            class="rounded-xl border bg-[var(--card)] p-4 transition-all"
            :class="
              stage.mode === 'parallel' ? 'border-[var(--primary)]/40' : 'border-[var(--line)]'
            "
          >
            <!-- 阶段头部 -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="w-6 h-6 rounded-full text-xs flex items-center justify-center font-medium"
                  :class="
                    stage.mode === 'parallel'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--gray-bg)] text-[var(--ink)]'
                  "
                >
                  {{ stageIndex + 1 }}
                </span>
                <span class="text-sm font-medium text-[var(--ink)]">{{ stage.name }}</span>
                <span
                  class="px-2 py-0.5 text-xs rounded-full border"
                  :class="
                    stage.mode === 'parallel'
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-[var(--line)] text-[var(--sub)]'
                  "
                >
                  {{ stage.mode === 'parallel' ? '并行' : '串行' }}
                </span>
              </div>

              <div v-if="!readonly" class="flex items-center gap-1">
                <button
                  v-if="stageIndex > 0"
                  class="w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
                  title="上移"
                  @click.stop="moveStage(stageIndex, 'up')"
                >
                  <XqIcon name="arrow-up" size="10" />
                </button>
                <button
                  v-if="stageIndex < stages.length - 1"
                  class="w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
                  title="下移"
                  @click.stop="moveStage(stageIndex, 'down')"
                >
                  <XqIcon name="arrow-down" size="10" />
                </button>
                <button
                  class="w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                  title="删除阶段"
                  @click.stop="removeStage(stageIndex)"
                >
                  <XqIcon name="close" size="10" />
                </button>
              </div>
            </div>

            <!-- 审批人区域 -->
            <div
              class="flex flex-wrap items-center gap-3"
              :class="
                stage.mode === 'parallel'
                  ? 'p-3 rounded-xl border border-dashed border-[var(--primary)]/30 bg-[var(--primary-light)]/10'
                  : ''
              "
            >
              <template
                v-for="(approver, approverIndex) in stage.approvers"
                :key="`${stage.id}_${approverIndex}`"
              >
                <div
                  class="relative group/approver"
                  :draggable="!readonly"
                  @dragstart="handleApproverDragStart(stageIndex, approverIndex)"
                  @dragover="(e) => handleApproverDragOver(e, stageIndex, approverIndex)"
                  @dragend="handleApproverDragEnd"
                >
                  <div
                    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all min-w-[120px]"
                    :class="
                      approver.id
                        ? 'border-[var(--primary)] bg-[var(--primary-light)]/30'
                        : 'border-[var(--line)] bg-[var(--bg)] hover:border-[var(--primary)]'
                    "
                    @click="$emit('click-approver', stageIndex, approverIndex)"
                  >
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                      :class="
                        approver.id
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--gray-bg)] text-[var(--sub)]'
                      "
                    >
                      {{ approverInitials(approver) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-[var(--ink)] truncate">
                        {{ approver.name || '选择审批人' }}
                      </div>
                      <div class="text-xs text-[var(--sub)] truncate">
                        {{ stage.mode === 'parallel' ? `会签人 ${approverIndex + 1}` : '审批人' }}
                      </div>
                    </div>
                  </div>

                  <button
                    v-if="!readonly"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] hidden group-hover/approver:flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                    title="删除审批人"
                    @click.stop="removeApprover(stageIndex, approverIndex)"
                  >
                    <XqIcon name="close" size="10" />
                  </button>
                </div>
              </template>

              <!-- 添加审批人（并行阶段可用） -->
              <button
                v-if="!readonly && stage.mode === 'parallel'"
                class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                @click="addApprover(stageIndex)"
              >
                <XqIcon name="plus" size="12" />
                <span class="text-xs">添加会签人</span>
              </button>

              <!-- 空状态 -->
              <div
                v-if="!readonly && stage.mode === 'serial' && stage.approvers.length === 0"
                class="flex items-center gap-2"
              >
                <button
                  class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  @click="$emit('click-approver', stageIndex, 0)"
                >
                  <XqIcon name="plus" size="12" />
                  <span class="text-xs">选择审批人</span>
                </button>
                <button
                  v-if="canAddSelf(stage)"
                  class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
                  @click="addSelf(stageIndex, 0)"
                >
                  <XqIcon name="user" size="12" />
                  <span class="text-xs">添加自己</span>
                </button>
              </div>
            </div>

            <p class="mt-2 text-xs text-[var(--sub)]">{{ stageSummary(stage) }}</p>
          </div>
        </div>

        <!-- 阶段间箭头 -->
        <div
          v-if="stageIndex < stages.length - 1"
          class="flex justify-center text-[var(--placeholder)]"
        >
          <XqIcon name="arrow-down" size="18" />
        </div>
      </template>
    </div>

    <!-- 空状态引导 -->
    <div
      v-if="stages.length === 0 && !readonly"
      class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] text-center"
    >
      <div
        class="w-12 h-12 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[var(--placeholder)]"
      >
        <XqIcon name="git-branch" size="24" />
      </div>
      <div class="text-sm text-[var(--sub)]">还没有审批阶段，点击下方按钮开始配置</div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          @click="addStage('serial')"
        >
          <XqIcon name="plus" size="12" />
          串行阶段
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
          @click="addStage('parallel')"
        >
          <XqIcon name="plus" size="12" />
          并行阶段
        </button>
      </div>
    </div>

    <!-- 添加阶段 -->
    <div v-else-if="!readonly" class="flex flex-wrap items-center gap-2">
      <button
        class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        @click="addStage('serial')"
      >
        <XqIcon name="plus" size="12" />
        添加串行阶段
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
        @click="addStage('parallel')"
      >
        <XqIcon name="plus" size="12" />
        添加并行阶段
      </button>
    </div>

    <p class="text-xs text-[var(--sub)]">
      提示：串行阶段依次审批；并行阶段内所有人同时收到任务，全部通过才算该阶段通过。任一阶段驳回按驳回策略执行。
    </p>
  </div>
</template>
