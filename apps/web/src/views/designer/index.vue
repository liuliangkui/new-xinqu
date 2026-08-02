<script setup lang="ts">
/**
 * 流程设计器 — 流程定义列表
 */
import { ref, computed, onMounted } from 'vue'
import type { WorkflowDefinition, WorkflowForm, WorkflowStatus } from './types'
import {
  getWorkflowList,
  saveWorkflow,
  deleteWorkflow,
  deployWorkflow,
  startWorkflowInstance,
} from './api'
import BpmnEditor from './components/BpmnEditor.vue'

const loading = ref(false)
const workflows = ref<WorkflowDefinition[]>([])
const total = ref(0)
const keyword = ref('')
const moduleFilter = ref('')
const formVisible = ref(false)
const formData = ref<WorkflowForm>({ name: '', code: '', module: 'APPROVAL', status: 'DRAFT' })
const formLoading = ref(false)
const editorVisible = ref(false)
const editorXml = ref('')
const editorRecord = ref<WorkflowDefinition | null>(null)
const editorLoading = ref(false)
const bpmnEditorRef = ref<InstanceType<typeof BpmnEditor> | null>(null)

const moduleOptions = [
  { value: '', label: '全部模块' },
  { value: 'APPROVAL', label: '审批' },
  { value: 'CUSTOMER', label: '客户' },
  { value: 'TICKET', label: '工单' },
  { value: 'SALE', label: '销售' },
]

const statusMap: Record<WorkflowStatus, { text: string; color: string }> = {
  ACTIVE: { text: '已启用', color: 'green' },
  ARCHIVED: { text: '已归档', color: 'gray' },
  DRAFT: { text: '草稿', color: 'orange' },
}

const filteredWorkflows = computed(() => {
  let list = workflows.value
  if (moduleFilter.value) {
    list = list.filter((w) => w.module === moduleFilter.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(
      (w) => w.name.toLowerCase().includes(kw) || w.code.toLowerCase().includes(kw),
    )
  }
  return list
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getWorkflowList({
      module: moduleFilter.value || undefined,
      keyword: keyword.value || undefined,
    })
    workflows.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formData.value = { name: '', code: '', module: 'APPROVAL', status: 'DRAFT' }
  formVisible.value = true
}

function openEdit(item: WorkflowDefinition) {
  formData.value = {
    id: item.id,
    name: item.name,
    code: item.code,
    module: item.module,
    status: item.status,
  }
  formVisible.value = true
}

async function handleSave() {
  if (!formData.value.name || !formData.value.code) {
    alert('请填写流程名称和编码')
    return
  }
  formLoading.value = true
  try {
    await saveWorkflow(formData.value)
    formVisible.value = false
    await fetchList()
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(item: WorkflowDefinition) {
  if (!confirm(`确定删除流程「${item.name}」？`)) return
  await deleteWorkflow(item.id)
  await fetchList()
}

function openBpmnEditor(item: WorkflowDefinition) {
  editorRecord.value = item
  editorXml.value = item.bpmnXml || ''
  editorVisible.value = true
}

function handleBpmnChange(xml: string) {
  editorXml.value = xml
}

async function handleSaveBpmn() {
  if (!editorRecord.value) return
  editorLoading.value = true
  try {
    const xml = bpmnEditorRef.value ? await bpmnEditorRef.value.getXml() : editorXml.value
    await saveWorkflow({
      id: editorRecord.value.id,
      name: editorRecord.value.name,
      code: editorRecord.value.code,
      module: editorRecord.value.module,
      status: editorRecord.value.status,
      bpmnXml: xml,
    })
    editorVisible.value = false
    await fetchList()
  } finally {
    editorLoading.value = false
  }
}

async function handleDeploy(item: WorkflowDefinition) {
  if (!item.bpmnXml) {
    alert('请先编辑并保存 BPMN 流程图')
    return
  }
  if (!confirm(`确定发布流程「${item.name}」？`)) return
  try {
    await deployWorkflow(item.id)
    await fetchList()
    alert('发布成功')
  } catch (e) {
    alert(e instanceof Error ? e.message : '发布失败')
  }
}

async function handleStartInstance(item: WorkflowDefinition) {
  if (!confirm(`确定启动流程「${item.name}」的一个实例？`)) return
  try {
    await startWorkflowInstance(item.id, { businessKey: `demo-${Date.now()}` })
    alert('实例启动成功')
  } catch (e) {
    alert(e instanceof Error ? e.message : '启动失败')
  }
}

function toggleStatus(item: WorkflowDefinition) {
  const next = item.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
  saveWorkflow({
    id: item.id,
    name: item.name,
    code: item.code,
    module: item.module,
    status: next,
  }).then(() => fetchList())
}

onMounted(fetchList)
</script>

<template>
  <XqPageLayout title="designer" :show-stats="false" :show-filter="false" padding="16px">
    <template #title>
      <span class="section-title">流程设计器</span>
    </template>

    <template #actions>
      <XqButton type="primary" @click="openCreate">
        <span class="flex items-center gap-1">
          <XqIcon name="plus" size="14" />
          <span>新建流程</span>
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
            @change="fetchList"
          >
            <option v-for="opt in moduleOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索流程名称或编码"
            class="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)] placeholder:text-[var(--sub)] focus:outline-none focus:border-[var(--primary)]"
            @input="fetchList"
          />
        </div>

        <div v-if="loading" class="py-12 text-center text-[var(--sub)]">加载中...</div>

        <div v-else-if="filteredWorkflows.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-[var(--sub)] border-b border-[var(--line)]">
                <th class="text-left py-2 px-3">流程名称</th>
                <th class="text-left py-2 px-3">编码</th>
                <th class="text-left py-2 px-3">模块</th>
                <th class="text-left py-2 px-3">版本</th>
                <th class="text-left py-2 px-3">状态</th>
                <th class="text-left py-2 px-3">节点数</th>
                <th class="text-left py-2 px-3">更新时间</th>
                <th class="text-right py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredWorkflows"
                :key="item.id"
                class="border-b border-[var(--line)] hover:bg-[var(--bg)]"
              >
                <td class="py-3 px-3 text-[var(--ink)] font-medium">{{ item.name }}</td>
                <td class="py-3 px-3 text-[var(--ink)] font-mono">{{ item.code }}</td>
                <td class="py-3 px-3 text-[var(--ink)]">{{ item.module }}</td>
                <td class="py-3 px-3 text-[var(--ink)]">v{{ item.version }}</td>
                <td class="py-3 px-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': item.status === 'ACTIVE',
                      'bg-orange-100 text-orange-700': item.status === 'DRAFT',
                      'bg-gray-100 text-gray-700': item.status === 'ARCHIVED',
                    }"
                  >
                    {{ statusMap[item.status]?.text || item.status }}
                  </span>
                </td>
                <td class="py-3 px-3 text-[var(--ink)]">{{ item.nodes.length }}</td>
                <td class="py-3 px-3 text-[var(--sub)]">{{ item.updatedAt }}</td>
                <td class="py-3 px-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="text-sm text-[var(--primary)] hover:underline"
                      @click="openEdit(item)"
                    >
                      编辑
                    </button>
                    <button
                      class="text-sm text-[var(--primary)] hover:underline"
                      @click="openBpmnEditor(item)"
                    >
                      BPMN
                    </button>
                    <button
                      class="text-sm text-[var(--sub)] hover:underline"
                      @click="toggleStatus(item)"
                    >
                      {{ item.status === 'ACTIVE' ? '归档' : '启用' }}
                    </button>
                    <button
                      class="text-sm text-[var(--warning)] hover:underline"
                      @click="handleDeploy(item)"
                    >
                      发布
                    </button>
                    <button
                      v-if="item.flowableDefinitionId"
                      class="text-sm text-[var(--success)] hover:underline"
                      @click="handleStartInstance(item)"
                    >
                      启动
                    </button>
                    <button
                      class="text-sm text-[var(--danger)] hover:underline"
                      @click="handleDelete(item)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <XqEmptyState v-else type="empty" title="暂无流程" description="点击右上角新建流程定义" />
      </div>
    </template>
  </XqPageLayout>

  <!-- 编辑/新增弹窗 -->
  <XqModal
    v-model:visible="formVisible"
    :title="formData.id ? '编辑流程' : '新建流程'"
    width="480px"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >流程名称 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.name"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]"
          >流程编码 <span class="text-[var(--danger)]">*</span></label
        >
        <input
          v-model="formData.code"
          type="text"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">所属模块</label>
        <select
          v-model="formData.module"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        >
          <option value="APPROVAL">审批</option>
          <option value="CUSTOMER">客户</option>
          <option value="TICKET">工单</option>
          <option value="SALE">销售</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-[var(--ink)]">状态</label>
        <select
          v-model="formData.status"
          class="w-full px-3 py-2 mt-1 rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm text-[var(--ink)]"
        >
          <option value="DRAFT">草稿</option>
          <option value="ACTIVE">已启用</option>
          <option value="ARCHIVED">已归档</option>
        </select>
      </div>
    </div>
    <template #footer>
      <XqButton @click="formVisible = false">取消</XqButton>
      <XqButton type="primary" :loading="formLoading" @click="handleSave">保存</XqButton>
    </template>
  </XqModal>

  <!-- BPMN 编辑器弹窗 -->
  <XqModal
    v-model:visible="editorVisible"
    :title="editorRecord ? `编辑流程图 - ${editorRecord.name}` : '编辑流程图'"
    width="960px"
  >
    <div class="h-[500px]">
      <BpmnEditor ref="bpmnEditorRef" :xml="editorXml" @change="handleBpmnChange" />
    </div>
    <template #footer>
      <XqButton @click="editorVisible = false">取消</XqButton>
      <XqButton type="primary" :loading="editorLoading" @click="handleSaveBpmn">
        保存 BPMN
      </XqButton>
    </template>
  </XqModal>
</template>
