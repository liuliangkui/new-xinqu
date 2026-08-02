<script setup lang="ts">
/**
 * BPMN 流程图编辑器（基于 bpmn-js）
 *
 * 保存时自动注入 Camunda 7 必需属性（historyTimeToLive、可执行标记、camunda 命名空间），
 * 保证后端部署到 Camunda 引擎时不会因为缺省属性而解析失败。
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import BpmnJS from 'bpmn-js/lib/Modeler'

interface Props {
  xml?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  xml: '',
  readonly: false,
})

const emit = defineEmits<{
  (e: 'change', xml: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let bpmnModeler: BpmnJS | null = null
const initialized = ref(false)

const CAMUNDA_NS = 'xmlns:camunda="http://camunda.org/schema/1.0/bpmn"'
const HISTORY_TTL = 'camunda:historyTimeToLive="P180D"'

function ensureCamundaAttributes(xml: string): string {
  if (!xml) return xml

  // 确保 camunda 命名空间存在
  if (!xml.includes(CAMUNDA_NS)) {
    xml = xml.replace(/<bpmn:definitions\s/i, `<bpmn:definitions ${CAMUNDA_NS} `)
  }

  // 为每个 bpmn:process 补充 historyTimeToLive（Camunda 7.20+ 部署必填）
  xml = xml.replace(/<bpmn:process\s+([^>]*?)\s*>/gi, (match, attrs) => {
    if (attrs.includes('camunda:historyTimeToLive')) return match
    return `<bpmn:process ${attrs} ${HISTORY_TTL}>`
  })

  // 没有 isExecutable 时默认标记为可执行
  xml = xml.replace(/<bpmn:process\s+([^>]*?)\s*>/gi, (match, attrs) => {
    if (attrs.includes('isExecutable')) return match
    return `<bpmn:process ${attrs} isExecutable="true">`
  })

  return xml
}

async function safeXml(): Promise<string> {
  if (!bpmnModeler) return ''
  const result = await bpmnModeler.saveXML({ format: true })
  return ensureCamundaAttributes(result.xml ?? '')
}

async function initModeler() {
  if (!containerRef.value || bpmnModeler) return

  bpmnModeler = new BpmnJS({
    container: containerRef.value,
    keyboard: { bindTo: document },
    additionalModules: props.readonly ? [{ palette: ['value', null] }] : [],
  })

  await loadXml(props.xml)
  initialized.value = true

  bpmnModeler.on('commandStack.changed', async () => {
    try {
      const xml = await safeXml()
      if (xml) {
        emit('change', xml)
      }
    } catch {
      // ignore save errors during editing
    }
  })
}

async function loadXml(xml?: string) {
  if (!bpmnModeler) return
  try {
    if (xml) {
      await bpmnModeler.importXML(xml)
    } else {
      await bpmnModeler.createDiagram()
    }
  } catch (err) {
    console.error('BPMN import error', err)
  }
}

async function getXml(): Promise<string> {
  return safeXml()
}

defineExpose({ getXml })

onMounted(() => {
  void initModeler()
})

onUnmounted(() => {
  if (bpmnModeler) {
    bpmnModeler.destroy()
    bpmnModeler = null
  }
})

watch(
  () => props.xml,
  (newXml) => {
    if (initialized.value && newXml !== undefined) {
      void loadXml(newXml)
    }
  },
)
</script>

<template>
  <div
    ref="containerRef"
    class="bpmn-editor w-full h-full border border-[var(--line)] rounded-lg bg-white"
  />
</template>

<style scoped>
.bpmn-editor :deep(.djs-palette) {
  left: 20px;
  top: 20px;
}
</style>
