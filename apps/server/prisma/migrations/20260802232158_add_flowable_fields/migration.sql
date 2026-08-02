-- AlterTable
ALTER TABLE "workflow_definitions" ADD COLUMN     "bpmn_xml" TEXT,
ADD COLUMN     "flowable_definition_id" TEXT,
ADD COLUMN     "flowable_deployment_id" TEXT,
ALTER COLUMN "nodes" SET DEFAULT '[]',
ALTER COLUMN "edges" SET DEFAULT '[]',
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "workflow_instances" ADD COLUMN     "flowable_process_instance_id" TEXT;

-- CreateIndex
CREATE INDEX "workflow_definitions_flowable_definition_id_idx" ON "workflow_definitions"("flowable_definition_id");
