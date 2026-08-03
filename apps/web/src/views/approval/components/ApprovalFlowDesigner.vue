<script setup lang="ts">
/**
 * 审批流程可视化设计器（轻量图形化版）
 * 垂直时间轴风格：中心主干 + 阶段节点卡片，整体更简洁、现代。
 */
import { ref, computed } from 'vue'
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

function addStage(mode: ApprovalMode, insertAfterIndex?: number) {
  const stages = [...ensureStages()]
  const baseIndex = insertAfterIndex === undefined ? stages.length : insertAfterIndex + 1
  const newStage: FlowStage = {
    id: `stage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${mode === 'serial' ? '串行' : '并行'}阶段 ${baseIndex + 1}`,
    mode,
    approvers: [],
  }
  stages.splice(baseIndex, 0, newStage)
  updateStages(stages.map((s, i) => ({ ...s, name: renameStage(s, i) })))
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
  updateStages(stages)
}

function approverInitials(approver?: ApprovalStageApprover): string {
  return (approver?.name || approver?.id || '审').slice(0, 1)
}

function canAddSelf(stage: FlowStage): boolean {
  return !!props.currentUserId && !stage.approvers.some((a) => a.id === props.currentUserId)
}

function addSelf(stageIndex: number, approverIndex: number) {
  if (!props.currentUserId) return
  const stages = [...ensureStages()]
  const stage = stages[stageIndex]
  if (!stage) return
  const approvers = [...stage.approvers]
  approvers[approverIndex] = { id: props.currentUserId, name: '我自己' }
  stage.approvers = approvers
  updateStages(stages)
  emit('add-self', stageIndex, approverIndex)
}

const hasStages = computed(() => ensureStages().length > 0)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-[var(--ink)]">审批流程</span>
      <span class="text-xs text-[var(--sub)]">阶段之间串行，阶段内可并行会签</span>
    </div>

    <!-- 空状态 -->
    <div
      v-if="!hasStages && !readonly"
      class="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] text-center"
    >
      <div
        class="w-14 h-14 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[var(--placeholder)]"
      >
        <XqIcon name="git-branch" size="28" />
      </div>
      <div class="text-sm text-[var(--sub)]">还没有审批阶段，点击下方按钮开始配置</div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          @click="addStage('serial')"
        >
          <XqIcon name="plus" size="12" />
          串行阶段
        </button>
        <button
          class="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
          @click="addStage('parallel')"
        >
          <XqIcon name="plus" size="12" />
          并行阶段
        </button>
      </div>
    </div>

    <!-- 流程图 -->
    <div v-else class="relative flex flex-col items-center py-4">
      <!-- 中心主干（虚线） -->
      <div
        class="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-[var(--line)] -translate-x-1/2"
      />

      <!-- 开始节点 -->
      <div class="relative z-10 flex flex-col items-center mb-1">
        <div
          class="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center text-[10px] font-medium shadow-sm"
        >
          开始
        </div>
      </div>

      <!-- 阶段列表 -->
      <template v-for="(stage, stageIndex) in stages" :key="stage.id">
        <div class="w-px h-6 border-l border-dashed border-[var(--line)]" />

        <div
          class="relative z-10 w-full max-w-[520px] group"
          :draggable="!readonly"
          @dragstart="handleStageDragStart(stageIndex)"
          @dragover="(e) => handleStageDragOver(e, stageIndex)"
          @dragend="handleStageDragEnd"
        >
          <!-- 阶段序号圆点 -->
          <div
            class="absolute left-1/2 -top-3 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border shadow-sm"
            :class="
              stage.mode === 'parallel'
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--card)] text-[var(--ink)] border-[var(--line)]'
            "
          >
            {{ stageIndex + 1 }}
          </div>

          <!-- 阶段卡片 -->
          <div
            class="mt-2 rounded-2xl border bg-[var(--card)] p-4 shadow-sm transition-all"
            :class="
              stage.mode === 'parallel'
                ? 'border-dashed border-[var(--primary)]/40 bg-[var(--primary-light)]/10'
                : 'border-dashed border-[var(--line)]'
            "
          >
            <!-- 头部 -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-[var(--ink)]">{{ stage.name }}</span>
                <span
                  class="px-2 py-0.5 text-[10px] rounded-full"
                  :class="
                    stage.mode === 'parallel'
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'bg-[var(--gray-bg)] text-[var(--sub)]'
                  "
                >
                  {{ stage.mode === 'parallel' ? '并行会签' : '串行' }}
                </span>
              </div>
              <div
                v-if="!readonly"
                class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  v-if="stageIndex > 0"
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)] hover:bg-[var(--gray-bg)]"
                  title="上移"
                  @click.stop="moveStage(stageIndex, 'up')"
                >
                  <XqIcon name="arrow-up" size="10" />
                </button>
                <button
                  v-if="stageIndex < stages.length - 1"
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)] hover:bg-[var(--gray-bg)]"
                  title="下移"
                  @click.stop="moveStage(stageIndex, 'down')"
                >
                  <XqIcon name="arrow-down" size="10" />
                </button>
                <button
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)] hover:bg-[var(--gray-bg)]"
                  title="删除阶段"
                  @click.stop="removeStage(stageIndex)"
                >
                  <XqIcon name="close" size="10" />
                </button>
              </div>
            </div>

            <!-- 串行：单个审批人 -->
            <div v-if="stage.mode === 'serial'" class="flex items-center gap-3">
              <template v-if="stage.approvers[0]?.id">
                <div
                  class="relative group/approver flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] cursor-pointer hover:border-[var(--primary)] transition-colors"
                  @click="$emit('click-approver', stageIndex, 0)"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center text-sm font-medium shadow-sm"
                  >
                    {{ approverInitials(stage.approvers[0]) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-[var(--ink)]">
                      {{ stage.approvers[0].name }}
                    </div>
                    <div class="text-xs text-[var(--sub)]">审批人</div>
                  </div>
                  <button
                    v-if="!readonly"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] hidden group-hover/approver:flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                    @click.stop="removeApprover(stageIndex, 0)"
                  >
                    <XqIcon name="close" size="10" />
                  </button>
                </div>
              </template>
              <template v-else>
                <button
                  v-if="!readonly"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  @click="$emit('click-approver', stageIndex, 0)"
                >
                  <XqIcon name="plus" size="14" />
                  <span class="text-sm">选择审批人</span>
                </button>
                <button
                  v-if="!readonly && canAddSelf(stage)"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
                  @click="addSelf(stageIndex, 0)"
                >
                  <XqIcon name="user" size="14" />
                  <span class="text-sm">添加自己</span>
                </button>
              </template>
            </div>

            <!-- 并行：会签人组 -->
            <div v-else class="flex flex-col gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <template
                  v-for="(approver, approverIndex) in stage.approvers"
                  :key="`${stage.id}_${approverIndex}`"
                >
                  <div
                    class="relative group/approver flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all"
                    :class="
                      approver.id
                        ? 'bg-[var(--card)] border-[var(--primary)]/40 hover:shadow-sm'
                        : 'bg-[var(--card)] border-dashed border-[var(--line)] hover:border-[var(--primary)]'
                    "
                    @click="$emit('click-approver', stageIndex, approverIndex)"
                  >
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                      :class="
                        approver.id
                          ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white'
                          : 'bg-[var(--gray-bg)] text-[var(--sub)]'
                      "
                    >
                      {{ approverInitials(approver) }}
                    </div>
                    <div class="flex flex-col min-w-[60px]">
                      <span class="text-sm font-medium text-[var(--ink)] truncate">
                        {{ approver.name || '选择' }}
                      </span>
                      <span class="text-[10px] text-[var(--sub)]">
                        会签人 {{ approverIndex + 1 }}
                      </span>
                    </div>
                    <button
                      v-if="!readonly"
                      class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] hidden group-hover/approver:flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                      @click.stop="removeApprover(stageIndex, approverIndex)"
                    >
                      <XqIcon name="close" size="10" />
                    </button>
                  </div>
                </template>

                <button
                  v-if="!readonly"
                  class="flex items-center gap-1 px-3 py-2 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  @click="addApprover(stageIndex)"
                >
                  <XqIcon name="plus" size="12" />
                  <span class="text-xs">添加会签人</span>
                </button>
              </div>

              <div class="flex items-center gap-1.5 text-[10px] text-[var(--primary)]">
                <XqIcon name="check" size="10" />
                <span>全部通过后才进入下一阶段</span>
              </div>
            </div>
          </div>

          <!-- 阶段间添加按钮 -->
          <div
            v-if="!readonly"
            class="absolute left-1/2 -bottom-2 -translate-x-1/2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              class="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-sm hover:bg-[var(--primary-dark)]"
              title="后接串行阶段"
              @click.stop="addStage('serial', stageIndex)"
            >
              <XqIcon name="plus" size="12" />
            </button>
          </div>
        </div>
      </template>

      <!-- 结束节点 -->
      <template v-if="hasStages">
        <div class="w-px h-6 border-l border-dashed border-[var(--line)]" />
        <div class="relative z-10 flex flex-col items-center">
          <div
            class="w-8 h-8 rounded-full border-2 border-[var(--success)] text-[var(--success)] flex items-center justify-center text-[10px] font-medium bg-[var(--card)]"
          >
            结束
          </div>
        </div>
      </template>

      <!-- 底部添加阶段 -->
      <div v-if="!readonly && hasStages" class="flex items-center justify-center gap-2 mt-5">
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          @click="addStage('serial')"
        >
          <XqIcon name="plus" size="12" />
          串行阶段
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-full border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
          @click="addStage('parallel')"
        >
          <XqIcon name="plus" size="12" />
          并行阶段
        </button>
      </div>
    </div>

    <p class="text-xs text-[var(--sub)]">
      提示：串行阶段依次审批；并行阶段内所有人同时收到任务，全部通过才算该阶段通过。任一阶段驳回按驳回策略执行。
    </p>
  </div>
</template>
