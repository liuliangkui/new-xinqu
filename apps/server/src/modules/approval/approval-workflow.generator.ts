/**
 * 审批工作流 BPMN 生成器（阶段流）
 *
 * 根据审批阶段生成可直接部署到 Camunda 7 / Flowable 的 BPMN 2.0 XML。
 * 支持混合串并行：阶段之间串行，每个阶段内部可串行（1 人）或并行（多人会签）。
 */

export type ApprovalFlowMode = 'serial' | 'parallel'
export type ApprovalRejectAction = 'end' | 'prev' | 'node'

export interface ApprovalStageApprover {
  id: string
  name?: string
  avatar?: string
}

export interface ApprovalFlowStage {
  id: string
  name?: string
  mode: ApprovalFlowMode
  approvers: ApprovalStageApprover[]
}

export interface GenerateApprovalBpmnOptions {
  /** 流程 key，建议唯一，例如 approval-dynamic-${instanceId} */
  processKey: string
  /** 流程显示名称 */
  name: string
  /** 审批阶段列表（阶段之间串行） */
  stages: ApprovalFlowStage[]
  /** 驳回后策略：end 结束 / prev 回到上一阶段 / node 回到指定阶段 */
  rejectAction?: ApprovalRejectAction
  /** rejectAction = node 时，回到的阶段下标（从 0 开始） */
  rejectTargetIndex?: number
}

interface BpmnNode {
  id: string
  name: string
  xml: string
}

export function generateApprovalBpmn(options: GenerateApprovalBpmnOptions): string {
  const { processKey, name, stages } = options
  if (!stages.length) throw new Error('审批阶段列表不能为空')
  const validStages = stages.filter((s) => s.approvers.filter((a) => a.id).length > 0)
  if (!validStages.length) throw new Error('审批阶段列表不能为空')

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

  validStages.forEach((stage, stageIndex) => {
    const isParallel = stage.mode === 'parallel'
    const approvers = stage.approvers.filter((a) => a.id)

    if (isParallel) {
      // 并行阶段：fork -> 多个 userTask（各带决策网关） -> join
      const forkId = `fork_s${stageIndex}`
      const joinId = `join_s${stageIndex}`
      nodes.push({
        id: forkId,
        name: `${stage.name || `阶段 ${stageIndex + 1}`} 分发`,
        xml: `<parallelGateway id="${forkId}" name="${escapeXml(stage.name || `阶段 ${stageIndex + 1}`)} 分发" />`,
      })
      nodes.push({
        id: joinId,
        name: `${stage.name || `阶段 ${stageIndex + 1}`} 汇聚`,
        xml: `<parallelGateway id="${joinId}" name="${escapeXml(stage.name || `阶段 ${stageIndex + 1}`)} 汇聚" />`,
      })

      approvers.forEach((approver, approverIndex) => {
        const taskId = `task_s${stageIndex}_a${approverIndex}`
        const gatewayId = `gateway_s${stageIndex}_a${approverIndex}`
        nodes.push({
          id: taskId,
          name: `${stage.name || `阶段 ${stageIndex + 1}`} - ${approverIndex + 1}`,
          xml: `<userTask id="${taskId}" name="${escapeXml(stage.name || `阶段 ${stageIndex + 1}`)} - ${approverIndex + 1}" camunda:assignee="\${assignee_${taskId}}">
  <documentation>审批人：${escapeXml(approver.name || approver.id)}</documentation>
</userTask>`,
        })
        nodes.push({
          id: gatewayId,
          name: `决策 ${stageIndex + 1}-${approverIndex + 1}`,
          xml: `<exclusiveGateway id="${gatewayId}" name="决策 ${stageIndex + 1}-${approverIndex + 1}" default="flow_${gatewayId}_join" />`,
        })

        flows.push(`<sequenceFlow id="flow_${forkId}_${taskId}" sourceRef="${forkId}" targetRef="${taskId}" />`)
        flows.push(`<sequenceFlow id="flow_${taskId}_${gatewayId}" sourceRef="${taskId}" targetRef="${gatewayId}" />`)
        flows.push(
          `<sequenceFlow id="flow_${gatewayId}_join" sourceRef="${gatewayId}" targetRef="${joinId}" name="同意" />`,
        )
        // 并行阶段中任意审批人驳回即结束流程
        flows.push(
          `<sequenceFlow id="flow_${gatewayId}_rejected" sourceRef="${gatewayId}" targetRef="end_rejected" name="驳回">
  <conditionExpression xsi:type="tFormalExpression">\${approved_${taskId} == false}</conditionExpression>
</sequenceFlow>`,
        )
      })
    } else {
      // 串行阶段：userTask + 决策网关
      const approver = approvers[0]
      const taskId = `task_s${stageIndex}`
      const gatewayId = `gateway_s${stageIndex}`
      nodes.push({
        id: taskId,
        name: stage.name || `阶段 ${stageIndex + 1}`,
        xml: `<userTask id="${taskId}" name="${escapeXml(stage.name || `阶段 ${stageIndex + 1}`)}" camunda:assignee="\${assignee_${taskId}}">
  <documentation>审批人：${escapeXml(approver.name || approver.id)}</documentation>
</userTask>`,
      })
      nodes.push({
        id: gatewayId,
        name: `决策 ${stageIndex + 1}`,
        xml: `<exclusiveGateway id="${gatewayId}" name="决策 ${stageIndex + 1}" default="flow_${gatewayId}_approved" />`,
      })

      flows.push(`<sequenceFlow id="flow_${taskId}_${gatewayId}" sourceRef="${taskId}" targetRef="${gatewayId}" />`)
    }
  })

  // 阶段间连接：start -> stage0 -> stage1 -> ... -> end_approved
  validStages.forEach((stage, stageIndex) => {
    const isParallel = stage.mode === 'parallel'
    const currentEntryId = resolveStageEntryId(stage, stageIndex)
    const isLast = stageIndex === validStages.length - 1

    // 第一个阶段：start -> entry
    if (stageIndex === 0) {
      flows.push(`<sequenceFlow id="flow_start_${currentEntryId}" sourceRef="start" targetRef="${currentEntryId}" />`)
    }

    // 阶段出口
    if (isParallel) {
      // 并行阶段：join -> 下一阶段 / 结束
      const joinId = `join_s${stageIndex}`
      const nextTarget = isLast ? 'end_approved' : resolveStageEntryId(validStages[stageIndex + 1], stageIndex + 1)
      flows.push(
        `<sequenceFlow id="flow_${joinId}_${isLast ? 'end' : nextTarget.replace(/\./g, '_')}" sourceRef="${joinId}" targetRef="${nextTarget}" name="完成" />`,
      )
    } else {
      // 串行阶段：网关同意分支 -> 下一阶段 / 结束（默认分支）
      const gatewayId = `gateway_s${stageIndex}`
      const nextTarget = isLast ? 'end_approved' : resolveStageEntryId(validStages[stageIndex + 1], stageIndex + 1)
      flows.push(
        `<sequenceFlow id="flow_${gatewayId}_approved" sourceRef="${gatewayId}" targetRef="${nextTarget}" name="同意" />`,
      )

      // 驳回分支
      for (let targetStageIndex = 0; targetStageIndex < validStages.length; targetStageIndex++) {
        const targetEntryId = resolveStageEntryId(validStages[targetStageIndex], targetStageIndex)
        flows.push(
          `<sequenceFlow id="flow_${gatewayId}_rejected_s${targetStageIndex}" sourceRef="${gatewayId}" targetRef="${targetEntryId}" name="驳回到阶段 ${targetStageIndex + 1}">
  <conditionExpression xsi:type="tFormalExpression">\${approved_${resolveSerialTaskId(stageIndex)} == false &amp;&amp; rejectTargetStageIndex == ${targetStageIndex}}</conditionExpression>
</sequenceFlow>`,
        )
      }
      // 默认驳回结束（兜底，当未指定 rejectTargetStageIndex 时）
      flows.push(
        `<sequenceFlow id="flow_${gatewayId}_rejected_end" sourceRef="${gatewayId}" targetRef="end_rejected" name="驳回结束" />`,
      )
    }
  })

  const processBody = nodes.map((n) => `  ${n.xml}`).join('\n') + '\n' + flows.map((f) => `  ${f}`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
             id="Definitions_${processKey}"
             targetNamespace="http://bpmn.io/schema/bpmn"
             exporter="XQCOP Approval Workflow Generator"
             exporterVersion="2.0">
  <process id="${processKey}" name="${escapeXml(name)}" isExecutable="true" camunda:historyTimeToLive="180">
${processBody}
  </process>
</definitions>`
}

function resolveStageEntryId(stage: ApprovalFlowStage, stageIndex: number): string {
  return stage.mode === 'parallel' ? `fork_s${stageIndex}` : `task_s${stageIndex}`
}

function resolveSerialTaskId(stageIndex: number): string {
  return `task_s${stageIndex}`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
