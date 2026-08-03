/**
 * 审批工作流 BPMN 生成器
 *
 * 根据审批人、串并行模式、驳回策略生成可直接部署到 Camunda 7 的 BPMN 2.0 XML。
 * 支持：
 * - 串行审批：依次审批，可驳回至结束、上一节点、指定节点
 * - 并行审批：多节点同时审批，任意节点驳回即结束
 */

export type ApprovalFlowMode = 'serial' | 'parallel'
export type ApprovalRejectAction = 'end' | 'prev' | 'node'

export interface GenerateApprovalBpmnOptions {
  /** 流程 key，建议唯一，例如 approval-dynamic-${instanceId} */
  processKey: string
  /** 流程显示名称 */
  name: string
  /** 审批人 ID 列表（顺序即为串行顺序） */
  approvers: string[]
  /** 串行 / 并行 */
  mode: ApprovalFlowMode
  /** 驳回后策略：end 结束 / prev 回到上一节点 / node 回到指定节点 */
  rejectAction?: ApprovalRejectAction
  /** rejectAction = node 时，回到的节点下标（从 0 开始） */
  rejectTargetIndex?: number
}

interface BpmnNode {
  id: string
  name: string
  xml: string
}

export function generateApprovalBpmn(options: GenerateApprovalBpmnOptions): string {
  const { processKey, name, approvers, mode, rejectAction = 'end', rejectTargetIndex } = options
  if (!approvers.length) throw new Error('审批人列表不能为空')

  const nodes: BpmnNode[] = []
  const flows: string[] = []

  nodes.push({
    id: 'start',
    name: '开始',
    xml: `<startEvent id="start" name="开始" />`,
  })

  nodes.push({
    id: 'end_approved',
    name: '已通过',
    xml: `<endEvent id="end_approved" name="已通过" />`,
  })

  nodes.push({
    id: 'end_rejected',
    name: '已驳回',
    xml: `<endEvent id="end_rejected" name="已驳回" />`,
  })

  if (mode === 'serial') {
    // 审批节点 + 网关
    approvers.forEach((approver, index) => {
      nodes.push({
        id: `task_${index}`,
        name: `审批节点 ${index + 1}`,
        xml: `<userTask id="task_${index}" name="审批节点 ${index + 1}" camunda:assignee="${escapeXml(approver)}">
  <documentation>审批人：${escapeXml(approver)}</documentation>
</userTask>`,
      })

      nodes.push({
        id: `gateway_${index}`,
        name: `决策 ${index + 1}`,
        xml: `<exclusiveGateway id="gateway_${index}" name="决策 ${index + 1}" default="flow_gateway_${index}_approved" />`,
      })
    })

    // start -> task_0
    flows.push(`<sequenceFlow id="flow_start_task_0" sourceRef="start" targetRef="task_0" />`)

    approvers.forEach((_, index) => {
      // task -> gateway
      flows.push(
        `<sequenceFlow id="flow_task_${index}_gateway_${index}" sourceRef="task_${index}" targetRef="gateway_${index}" />`,
      )

      // 同意分支：默认到下一节点 / 结束
      const isLast = index === approvers.length - 1
      const approvedTarget = isLast ? 'end_approved' : `task_${index + 1}`
      flows.push(
        `<sequenceFlow id="flow_gateway_${index}_approved" sourceRef="gateway_${index}" targetRef="${approvedTarget}" name="同意" />
      `,
      )

      // 驳回分支：按策略路由
      const rejectTarget = resolveSerialRejectTarget(index, rejectAction, rejectTargetIndex, approvers.length)
      flows.push(
        `<sequenceFlow id="flow_gateway_${index}_rejected" sourceRef="gateway_${index}" targetRef="${rejectTarget}" name="驳回">
  <conditionExpression xsi:type="tFormalExpression">\${approved_${index} == false}</conditionExpression>
</sequenceFlow>`,
      )
    })
  } else {
    // 并行模式
    nodes.push({
      id: 'fork',
      name: '并行分发',
      xml: `<parallelGateway id="fork" name="并行分发" />`,
    })
    nodes.push({
      id: 'join',
      name: '并行汇聚',
      xml: `<parallelGateway id="join" name="并行汇聚" />`,
    })

    flows.push(`<sequenceFlow id="flow_start_fork" sourceRef="start" targetRef="fork" />`)

    approvers.forEach((approver, index) => {
      nodes.push({
        id: `task_${index}`,
        name: `审批节点 ${index + 1}`,
        xml: `<userTask id="task_${index}" name="审批节点 ${index + 1}" camunda:assignee="${escapeXml(approver)}">
  <documentation>审批人：${escapeXml(approver)}</documentation>
</userTask>`,
      })
      nodes.push({
        id: `gateway_${index}`,
        name: `决策 ${index + 1}`,
        xml: `<exclusiveGateway id="gateway_${index}" name="决策 ${index + 1}" default="flow_gateway_${index}_join" />`,
      })

      flows.push(`<sequenceFlow id="flow_fork_task_${index}" sourceRef="fork" targetRef="task_${index}" />`)
      flows.push(
        `<sequenceFlow id="flow_task_${index}_gateway_${index}" sourceRef="task_${index}" targetRef="gateway_${index}" />`,
      )
      // 同意 -> join
      flows.push(
        `<sequenceFlow id="flow_gateway_${index}_join" sourceRef="gateway_${index}" targetRef="join" name="同意" />`,
      )
      // 驳回 -> 直接结束
      flows.push(
        `<sequenceFlow id="flow_gateway_${index}_rejected" sourceRef="gateway_${index}" targetRef="end_rejected" name="驳回">
  <conditionExpression xsi:type="tFormalExpression">\${approved_${index} == false}</conditionExpression>
</sequenceFlow>`,
      )
    })

    flows.push(`<sequenceFlow id="flow_join_end" sourceRef="join" targetRef="end_approved" />`)
  }

  const processBody = nodes.map((n) => `  ${n.xml}`).join('\n') + '\n' + flows.map((f) => `  ${f}`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
             id="Definitions_${processKey}"
             targetNamespace="http://bpmn.io/schema/bpmn"
             exporter="XQCOP Approval Workflow Generator"
             exporterVersion="1.0">
  <process id="${processKey}" name="${escapeXml(name)}" isExecutable="true" camunda:historyTimeToLive="180">
${processBody}
  </process>
</definitions>`
}

function resolveSerialRejectTarget(
  currentIndex: number,
  rejectAction: ApprovalRejectAction,
  rejectTargetIndex: number | undefined,
  total: number,
): string {
  if (rejectAction === 'prev') {
    return currentIndex > 0 ? `task_${currentIndex - 1}` : 'end_rejected'
  }

  if (rejectAction === 'node' && rejectTargetIndex !== undefined) {
    const target = Math.max(0, Math.min(total - 1, rejectTargetIndex))
    if (target === currentIndex) return 'end_rejected'
    return `task_${target}`
  }

  return 'end_rejected'
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
