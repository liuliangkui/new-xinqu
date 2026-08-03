-- AlterTable
ALTER TABLE "approval_instances" ADD COLUMN     "workflow_instance_id" TEXT;

-- AlterTable
ALTER TABLE "approval_templates" ADD COLUMN     "workflow_definition_id" TEXT;

-- CreateIndex
CREATE INDEX "approval_instances_workflow_instance_id_idx" ON "approval_instances"("workflow_instance_id");

-- CreateIndex
CREATE INDEX "approval_templates_workflow_definition_id_idx" ON "approval_templates"("workflow_definition_id");

-- AddForeignKey
ALTER TABLE "approval_templates" ADD CONSTRAINT "approval_templates_workflow_definition_id_fkey" FOREIGN KEY ("workflow_definition_id") REFERENCES "workflow_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 默认审批工作流定义与模板
WITH def AS (
  INSERT INTO "workflow_definitions" ("id", "name", "code", "module", "version", "status", "bpmn_xml", "nodes", "edges", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid(),
    '通用审批流程',
    'approval-generic',
    'APPROVAL',
    1,
    'ACTIVE',
    $BPMN$<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Definitions_Approval" targetNamespace="http://bpmn.io/schema/bpmn" exporter="XQCOP">
  <bpmn:process id="approval_generic" name="通用审批流程" isExecutable="true" camunda:historyTimeToLive="P180D">
    <bpmn:startEvent id="StartEvent_1" />
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_Approval" />
    <bpmn:userTask id="Task_Approval" name="审批" camunda:assignee="${approver}" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Approval" targetRef="EndEvent_1" />
    <bpmn:endEvent id="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="approval_generic">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" x="152" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_Approval" bpmnElement="Task_Approval">
        <dc:Bounds xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" x="240" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <dc:Bounds xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" x="392" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>$BPMN$,
    '[]'::jsonb,
    '[]'::jsonb,
    NOW(),
    NOW()
  )
  RETURNING "id"
)
INSERT INTO "approval_templates" ("id", "name", "code", "module", "formSchema", "flowNodes", "workflow_definition_id", "status", "createdAt", "updatedAt")
SELECT gen_random_uuid(), '请假审批', 'leave', 'leave', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def
UNION ALL
SELECT gen_random_uuid(), '报销审批', 'expense', 'expense', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def
UNION ALL
SELECT gen_random_uuid(), '合同审批', 'contract', 'contract', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def
UNION ALL
SELECT gen_random_uuid(), '折扣审批', 'discount', 'discount', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def
UNION ALL
SELECT gen_random_uuid(), '采购审批', 'purchase', 'purchase', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def
UNION ALL
SELECT gen_random_uuid(), '其他审批', 'other', 'other', '{}'::jsonb, '[]'::jsonb, def.id, 'ACTIVE', NOW(), NOW() FROM def;
