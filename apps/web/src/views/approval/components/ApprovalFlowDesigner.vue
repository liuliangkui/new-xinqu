<script setup lang="ts">
/**
 * 审批流程可视化设计器（水平箭头流程图版）
 * 串行阶段横向串联，并行阶段纵向分叉后汇聚，用箭头明确表达流向。
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

    <!-- 水平流程图 -->
    <div v-else class="relative w-full overflow-x-auto pb-4 pt-2">
      <div class="flex items-center min-w-max px-2">
        <!-- 开始节点 -->
        <div class="flex flex-col items-center gap-1 flex-shrink-0">
          <div
            class="w-9 h-9 rounded-full bg-[var(--success)] text-white flex items-center justify-center text-[10px] font-medium shadow-sm"
          >
            开始
          </div>
        </div>

        <!-- 流程项 -->
        <template v-for="(stage, stageIndex) in stages" :key="stage.id">
          <!-- 箭头连接 -->
          <div class="flex items-center px-2 flex-shrink-0">
            <div class="w-8 h-px bg-[var(--line)] relative">
              <div
                class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-[var(--line)]"
              />
            </div>
          </div>

          <!-- 阶段节点 -->
          <div
            class="flex-shrink-0 group"
            :draggable="!readonly"
            @dragstart="handleStageDragStart(stageIndex)"
            @dragover="(e) => handleStageDragOver(e, stageIndex)"
            @dragend="handleStageDragEnd"
          >
            <!-- 串行阶段 -->
            <div
              v-if="stage.mode === 'serial'"
              class="relative rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card)] p-3 shadow-sm hover:shadow-md transition-all w-[160px]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-[var(--sub)]">{{ stage.name }}</span>
                <span class="px-1.5 py-0.5 text-[9px] rounded bg-[var(--gray-bg)] text-[var(--sub)]"
                  >串行</span
                >
              </div>

              <template v-if="stage.approvers[0]?.id">
                <div
                  class="relative group/approver flex items-center gap-2 p-2 rounded-xl bg-[var(--bg)] cursor-pointer hover:ring-1 hover:ring-[var(--primary)] transition-all"
                  @click="$emit('click-approver', stageIndex, 0)"
                >
                  <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center text-xs font-medium"
                  >
                    {{ approverInitials(stage.approvers[0]) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-[var(--ink)] truncate">
                      {{ stage.approvers[0].name }}
                    </div>
                    <div class="text-[10px] text-[var(--sub)]">审批人</div>
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
                <div v-if="!readonly" class="flex flex-col gap-2">
                  <button
                    class="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                    @click="$emit('click-approver', stageIndex, 0)"
                  >
                    <XqIcon name="plus" size="12" />
                    <span class="text-xs">选择审批人</span>
                  </button>
                  <button
                    v-if="canAddSelf(stage)"
                    class="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-colors"
                    @click="addSelf(stageIndex, 0)"
                  >
                    <XqIcon name="user" size="12" />
                    <span class="text-xs">添加自己</span>
                  </button>
                </div>
              </template>

              <!-- 操作按钮 -->
              <div
                v-if="!readonly"
                class="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-0.5"
              >
                <button
                  v-if="stageIndex > 0"
                  class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
                  title="前移"
                  @click.stop="moveStage(stageIndex, 'up')"
                >
                  <XqIcon name="arrow-left" size="10" />
                </button>
                <button
                  v-if="stageIndex < stages.length - 1"
                  class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--primary)]"
                  title="后移"
                  @click.stop="moveStage(stageIndex, 'down')"
                >
                  <XqIcon name="arrow-right" size="10" />
                </button>
                <button
                  class="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                  title="删除"
                  @click.stop="removeStage(stageIndex)"
                >
                  <XqIcon name="close" size="10" />
                </button>
              </div>
            </div>

            <!-- 并行阶段 -->
            <div
              v-else
              class="relative rounded-2xl border border-dashed border-[var(--primary)]/40 bg-[var(--primary-light)]/10 p-3 w-[180px]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-[var(--ink)] font-medium">{{ stage.name }}</span>
                <span
                  class="px-1.5 py-0.5 text-[9px] rounded bg-[var(--primary)]/10 text-[var(--primary)]"
                  >并行</span
                >
              </div>

              <!-- 并行分支 -->
              <div class="relative flex items-stretch">
                <!-- fork 竖线 -->
                <div class="relative w-4 flex-shrink-0">
                  <div
                    class="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--primary)]/40 -translate-x-1/2"
                  />
                  <div
                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border border-[var(--primary)]/40 bg-[var(--card)]"
                  />
                </div>

                <!-- 会签人列表 -->
                <div class="flex-1 flex flex-col gap-2 py-1">
                  <template
                    v-for="(approver, approverIndex) in stage.approvers"
                    :key="`${stage.id}_${approverIndex}`"
                  >
                    <div
                      class="relative group/approver flex items-center gap-2 p-2 rounded-xl bg-[var(--card)] border border-dashed border-[var(--line)] cursor-pointer hover:border-[var(--primary)] transition-all"
                      @click="$emit('click-approver', stageIndex, approverIndex)"
                    >
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium"
                        :class="
                          approver.id
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white'
                            : 'bg-[var(--gray-bg)] text-[var(--sub)]'
                        "
                      >
                        {{ approverInitials(approver) }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-xs font-medium text-[var(--ink)] truncate">
                          {{ approver.name || '选择' }}
                        </div>
                        <div class="text-[9px] text-[var(--sub)]">会签 {{ approverIndex + 1 }}</div>
                      </div>
                      <button
                        v-if="!readonly"
                        class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--card)] border border-[var(--line)] hidden group-hover/approver:flex items-center justify-center text-[var(--sub)] hover:text-[var(--danger)]"
                        @click.stop="removeApprover(stageIndex, approverIndex)"
                      >
                        <XqIcon name="close" size="8" />
                      </button>
                    </div>
                  </template>

                  <button
                    v-if="!readonly"
                    class="flex items-center justify-center gap-1 p-2 rounded-xl border border-dashed border-[var(--line)] text-[var(--sub)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                    @click="addApprover(stageIndex)"
                  >
                    <XqIcon name="plus" size="10" />
                    <span class="text-[10px]">添加会签人</span>
                  </button>
                </div>

                <!-- join 竖线 -->
                <div class="relative w-4 flex-shrink-0">
                  <div
                    class="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--primary)]/40 -translate-x-1/2"
                  />
                  <div
                    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border border-[var(--primary)]/40 bg-[var(--card)]"
                  />
                </div>
              </div>

              <div class="mt-2 text-[9px] text-[var(--primary)] text-center">全部通过后才汇聚</div>
            </div>

            <!-- 阶段间添加按钮 -->
            <div
              v-if="!readonly"
              class="absolute left-1/2 -bottom-3 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                class="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-sm hover:bg-[var(--primary-dark)]"
                title="后接串行阶段"
                @click.stop="addStage('serial', stageIndex)"
              >
                <XqIcon name="plus" size="10" />
              </button>
            </div>
          </div>
        </template>

        <!-- 连接到结束 -->
        <div v-if="hasStages" class="flex items-center px-2 flex-shrink-0">
          <div class="w-8 h-px bg-[var(--line)] relative">
            <div
              class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-[var(--line)]"
            />
          </div>
        </div>

        <!-- 结束节点 -->
        <div v-if="hasStages" class="flex flex-col items-center gap-1 flex-shrink-0">
          <div
            class="w-9 h-9 rounded-full border-2 border-[var(--success)] text-[var(--success)] flex items-center justify-center text-[10px] font-medium bg-[var(--card)]"
          >
            结束
          </div>
        </div>
      </div>
    </div>

    <!-- 底部添加阶段 -->
    <div v-if="!readonly && hasStages" class="flex items-center justify-center gap-2">
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

    <p class="text-xs text-[var(--sub)]">
      提示：串行阶段依次审批；并行阶段内所有人同时收到任务，全部通过才算该阶段通过。任一阶段驳回按驳回策略执行。
    </p>
  </div>
</template>
