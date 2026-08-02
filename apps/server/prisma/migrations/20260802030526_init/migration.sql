-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config_histories" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "system_config_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "payload" JSONB,
    "statusCode" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "recordType" TEXT,
    "recordId" TEXT,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "leaderId" TEXT,
    "path" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "departmentId" TEXT,
    "roleIds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "permissions" JSONB,
    "dataScope" TEXT NOT NULL DEFAULT 'SELF',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "route" TEXT,
    "category" TEXT NOT NULL DEFAULT 'BUSINESS',
    "permissions" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT,
    "receiverId" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hospitalLevel" TEXT,
    "level" TEXT NOT NULL DEFAULT 'NORMAL',
    "healthScore" INTEGER,
    "region" TEXT NOT NULL,
    "regionId" TEXT,
    "address" JSONB,
    "ownerId" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'POTENTIAL',
    "tags" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "position" TEXT,
    "departmentId" TEXT,
    "decisionRole" TEXT NOT NULL DEFAULT 'USER',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_departments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bedCount" INTEGER,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customer_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_records" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "visitTime" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "visit_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "poolType" TEXT NOT NULL DEFAULT 'PUBLIC',
    "ownerId" TEXT,
    "region" TEXT,
    "regionId" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "companyName" TEXT,
    "demand" TEXT,
    "estimatedAmount" DECIMAL(65,30),
    "intentionLevel" TEXT,
    "followCount" INTEGER NOT NULL DEFAULT 0,
    "lastFollowAt" TIMESTAMP(3),
    "convertedCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_follow_records" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "nextFollowAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lead_follow_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "amount" DECIMAL(65,30),
    "stage" TEXT NOT NULL DEFAULT 'INITIAL',
    "probability" INTEGER NOT NULL DEFAULT 0,
    "expectedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lostReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "intentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intention_stage_records" (
    "id" TEXT NOT NULL,
    "intentionId" TEXT NOT NULL,
    "fromStage" TEXT NOT NULL,
    "toStage" TEXT NOT NULL,
    "probability" INTEGER NOT NULL,
    "operatorId" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "intention_stage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brandId" TEXT,
    "unit" TEXT,
    "price" DECIMAL(65,30),
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT,
    "customerId" TEXT,
    "serialNo" TEXT,
    "installDate" TIMESTAMP(3),
    "warrantyExpire" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reagent_batches" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "reagent_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reagent_consumptions" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "customerId" TEXT,
    "quantity" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reagent_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT NOT NULL,
    "assigneeIds" TEXT[],
    "participantIds" TEXT[],
    "relatedType" TEXT,
    "relatedId" TEXT,
    "dueAt" TIMESTAMP(3),
    "remindAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MEETING',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "participantIds" TEXT[],
    "relatedType" TEXT,
    "relatedId" TEXT,
    "location" TEXT,
    "reminderMinutes" INTEGER NOT NULL DEFAULT 15,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_reminders" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "schedule_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "eventCode" TEXT NOT NULL,
    "eventType" INTEGER NOT NULL,
    "eventStatus" INTEGER NOT NULL DEFAULT 1,
    "subject" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "intentionId" TEXT,
    "intentionName" TEXT,
    "attendeeIds" TEXT[],
    "attendeeNames" TEXT,
    "remark" TEXT,
    "sourceType" INTEGER NOT NULL DEFAULT 1,
    "ownerId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "signInTime" TIMESTAMP(3),
    "signInLocation" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "completedTime" TIMESTAMP(3),
    "reminderFlag" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "formSchema" JSONB NOT NULL,
    "flowNodes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "approval_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_instances" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "currentNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "approval_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_tasks" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "action" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "approval_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_cc_records" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "approval_cc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'REPAIR',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerId" TEXT,
    "contactId" TEXT,
    "equipmentId" TEXT,
    "reporterId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "source" TEXT,
    "content" TEXT NOT NULL,
    "solution" TEXT,
    "satisfiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_histories" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT,
    "level" TEXT NOT NULL DEFAULT 'NORMAL',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "authorizedAt" TIMESTAMP(3),
    "expireAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_contracts" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "files" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dealer_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_orders" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "customerId" TEXT,
    "amount" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dealer_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_inventory" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "warningQty" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dealer_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "businessKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "currentNode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "checkItems" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_records" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "score" INTEGER,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkerId" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "compliance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_evidences" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "compliance_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_targets" (
    "id" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "objectName" TEXT,
    "period" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "targetValue" DECIMAL(65,30) NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "performance_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_actuals" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actualValue" DECIMAL(65,30) NOT NULL,
    "achievementRate" DECIMAL(65,30),
    "gap" DECIMAL(65,30),
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "performance_actuals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSONAL',
    "userId" TEXT,
    "layout" JSONB NOT NULL,
    "widgets" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "dashboard_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_configs_deletedAt_idx" ON "system_configs"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_module_key_key" ON "system_configs"("module", "key");

-- CreateIndex
CREATE INDEX "system_config_histories_deletedAt_idx" ON "system_config_histories"("deletedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "file_attachments_module_recordType_recordId_idx" ON "file_attachments"("module", "recordType", "recordId");

-- CreateIndex
CREATE INDEX "file_attachments_deletedAt_idx" ON "file_attachments"("deletedAt");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE INDEX "departments_deletedAt_idx" ON "departments"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_parentId_idx" ON "regions"("parentId");

-- CreateIndex
CREATE INDEX "regions_deletedAt_idx" ON "regions"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_deletedAt_idx" ON "roles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "user_settings_userId_idx" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "apps_code_key" ON "apps"("code");

-- CreateIndex
CREATE INDEX "apps_category_idx" ON "apps"("category");

-- CreateIndex
CREATE INDEX "apps_deletedAt_idx" ON "apps"("deletedAt");

-- CreateIndex
CREATE INDEX "user_favorites_userId_idx" ON "user_favorites"("userId");

-- CreateIndex
CREATE INDEX "user_favorites_deletedAt_idx" ON "user_favorites"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_userId_targetType_targetId_key" ON "user_favorites"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "messages_receiverId_status_idx" ON "messages"("receiverId", "status");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE INDEX "messages_deletedAt_idx" ON "messages"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_userId_channel_key" ON "notification_settings"("userId", "channel");

-- CreateIndex
CREATE INDEX "customers_ownerId_idx" ON "customers"("ownerId");

-- CreateIndex
CREATE INDEX "customers_regionId_idx" ON "customers"("regionId");

-- CreateIndex
CREATE INDEX "customers_region_idx" ON "customers"("region");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_type_idx" ON "customers"("type");

-- CreateIndex
CREATE INDEX "customers_level_idx" ON "customers"("level");

-- CreateIndex
CREATE INDEX "customers_deletedAt_idx" ON "customers"("deletedAt");

-- CreateIndex
CREATE INDEX "contacts_customerId_idx" ON "contacts"("customerId");

-- CreateIndex
CREATE INDEX "contacts_deletedAt_idx" ON "contacts"("deletedAt");

-- CreateIndex
CREATE INDEX "customer_departments_customerId_idx" ON "customer_departments"("customerId");

-- CreateIndex
CREATE INDEX "customer_departments_deletedAt_idx" ON "customer_departments"("deletedAt");

-- CreateIndex
CREATE INDEX "visit_records_customerId_idx" ON "visit_records"("customerId");

-- CreateIndex
CREATE INDEX "visit_records_visitTime_idx" ON "visit_records"("visitTime");

-- CreateIndex
CREATE INDEX "visit_records_deletedAt_idx" ON "visit_records"("deletedAt");

-- CreateIndex
CREATE INDEX "leads_ownerId_idx" ON "leads"("ownerId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_poolType_idx" ON "leads"("poolType");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_regionId_idx" ON "leads"("regionId");

-- CreateIndex
CREATE INDEX "leads_deletedAt_idx" ON "leads"("deletedAt");

-- CreateIndex
CREATE INDEX "lead_follow_records_leadId_idx" ON "lead_follow_records"("leadId");

-- CreateIndex
CREATE INDEX "lead_follow_records_deletedAt_idx" ON "lead_follow_records"("deletedAt");

-- CreateIndex
CREATE INDEX "intentions_customerId_idx" ON "intentions"("customerId");

-- CreateIndex
CREATE INDEX "intentions_ownerId_idx" ON "intentions"("ownerId");

-- CreateIndex
CREATE INDEX "intentions_status_idx" ON "intentions"("status");

-- CreateIndex
CREATE INDEX "intentions_productId_idx" ON "intentions"("productId");

-- CreateIndex
CREATE INDEX "intentions_deletedAt_idx" ON "intentions"("deletedAt");

-- CreateIndex
CREATE INDEX "intention_stage_records_intentionId_idx" ON "intention_stage_records"("intentionId");

-- CreateIndex
CREATE INDEX "intention_stage_records_deletedAt_idx" ON "intention_stage_records"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "brands_code_key" ON "brands"("code");

-- CreateIndex
CREATE INDEX "brands_deletedAt_idx" ON "brands"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_customerId_idx" ON "equipment"("customerId");

-- CreateIndex
CREATE INDEX "equipment_productId_idx" ON "equipment"("productId");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_deletedAt_idx" ON "equipment"("deletedAt");

-- CreateIndex
CREATE INDEX "reagent_batches_productId_idx" ON "reagent_batches"("productId");

-- CreateIndex
CREATE INDEX "reagent_batches_status_idx" ON "reagent_batches"("status");

-- CreateIndex
CREATE INDEX "reagent_batches_deletedAt_idx" ON "reagent_batches"("deletedAt");

-- CreateIndex
CREATE INDEX "reagent_consumptions_batchId_idx" ON "reagent_consumptions"("batchId");

-- CreateIndex
CREATE INDEX "reagent_consumptions_equipmentId_idx" ON "reagent_consumptions"("equipmentId");

-- CreateIndex
CREATE INDEX "reagent_consumptions_customerId_idx" ON "reagent_consumptions"("customerId");

-- CreateIndex
CREATE INDEX "tasks_ownerId_idx" ON "tasks"("ownerId");

-- CreateIndex
CREATE INDEX "tasks_assigneeIds_idx" ON "tasks"("assigneeIds");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_relatedType_relatedId_idx" ON "tasks"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "tasks_deletedAt_idx" ON "tasks"("deletedAt");

-- CreateIndex
CREATE INDEX "task_comments_taskId_idx" ON "task_comments"("taskId");

-- CreateIndex
CREATE INDEX "task_comments_deletedAt_idx" ON "task_comments"("deletedAt");

-- CreateIndex
CREATE INDEX "schedules_ownerId_idx" ON "schedules"("ownerId");

-- CreateIndex
CREATE INDEX "schedules_startTime_idx" ON "schedules"("startTime");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "schedules"("status");

-- CreateIndex
CREATE INDEX "schedules_deletedAt_idx" ON "schedules"("deletedAt");

-- CreateIndex
CREATE INDEX "schedule_reminders_scheduleId_idx" ON "schedule_reminders"("scheduleId");

-- CreateIndex
CREATE INDEX "schedule_reminders_status_idx" ON "schedule_reminders"("status");

-- CreateIndex
CREATE INDEX "schedule_reminders_deletedAt_idx" ON "schedule_reminders"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_eventCode_key" ON "calendar_events"("eventCode");

-- CreateIndex
CREATE INDEX "calendar_events_ownerId_idx" ON "calendar_events"("ownerId");

-- CreateIndex
CREATE INDEX "calendar_events_startTime_idx" ON "calendar_events"("startTime");

-- CreateIndex
CREATE INDEX "calendar_events_eventStatus_idx" ON "calendar_events"("eventStatus");

-- CreateIndex
CREATE INDEX "calendar_events_deletedAt_idx" ON "calendar_events"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "approval_templates_code_key" ON "approval_templates"("code");

-- CreateIndex
CREATE INDEX "approval_templates_module_idx" ON "approval_templates"("module");

-- CreateIndex
CREATE INDEX "approval_templates_status_idx" ON "approval_templates"("status");

-- CreateIndex
CREATE INDEX "approval_templates_deletedAt_idx" ON "approval_templates"("deletedAt");

-- CreateIndex
CREATE INDEX "approval_instances_applicantId_idx" ON "approval_instances"("applicantId");

-- CreateIndex
CREATE INDEX "approval_instances_status_idx" ON "approval_instances"("status");

-- CreateIndex
CREATE INDEX "approval_instances_templateId_idx" ON "approval_instances"("templateId");

-- CreateIndex
CREATE INDEX "approval_instances_deletedAt_idx" ON "approval_instances"("deletedAt");

-- CreateIndex
CREATE INDEX "approval_tasks_instanceId_idx" ON "approval_tasks"("instanceId");

-- CreateIndex
CREATE INDEX "approval_tasks_assigneeId_idx" ON "approval_tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "approval_tasks_action_idx" ON "approval_tasks"("action");

-- CreateIndex
CREATE INDEX "approval_tasks_deletedAt_idx" ON "approval_tasks"("deletedAt");

-- CreateIndex
CREATE INDEX "approval_cc_records_instanceId_idx" ON "approval_cc_records"("instanceId");

-- CreateIndex
CREATE INDEX "approval_cc_records_userId_idx" ON "approval_cc_records"("userId");

-- CreateIndex
CREATE INDEX "approval_cc_records_deletedAt_idx" ON "approval_cc_records"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");

-- CreateIndex
CREATE INDEX "tickets_customerId_idx" ON "tickets"("customerId");

-- CreateIndex
CREATE INDEX "tickets_assigneeId_idx" ON "tickets"("assigneeId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "tickets_deletedAt_idx" ON "tickets"("deletedAt");

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_idx" ON "ticket_comments"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_comments_deletedAt_idx" ON "ticket_comments"("deletedAt");

-- CreateIndex
CREATE INDEX "ticket_histories_ticketId_idx" ON "ticket_histories"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_code_key" ON "dealers"("code");

-- CreateIndex
CREATE INDEX "dealers_regionId_idx" ON "dealers"("regionId");

-- CreateIndex
CREATE INDEX "dealers_status_idx" ON "dealers"("status");

-- CreateIndex
CREATE INDEX "dealers_level_idx" ON "dealers"("level");

-- CreateIndex
CREATE INDEX "dealers_deletedAt_idx" ON "dealers"("deletedAt");

-- CreateIndex
CREATE INDEX "dealer_contracts_dealerId_idx" ON "dealer_contracts"("dealerId");

-- CreateIndex
CREATE INDEX "dealer_contracts_status_idx" ON "dealer_contracts"("status");

-- CreateIndex
CREATE INDEX "dealer_contracts_deletedAt_idx" ON "dealer_contracts"("deletedAt");

-- CreateIndex
CREATE INDEX "dealer_orders_dealerId_idx" ON "dealer_orders"("dealerId");

-- CreateIndex
CREATE INDEX "dealer_orders_status_idx" ON "dealer_orders"("status");

-- CreateIndex
CREATE INDEX "dealer_orders_deletedAt_idx" ON "dealer_orders"("deletedAt");

-- CreateIndex
CREATE INDEX "dealer_inventory_dealerId_idx" ON "dealer_inventory"("dealerId");

-- CreateIndex
CREATE INDEX "dealer_inventory_deletedAt_idx" ON "dealer_inventory"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_inventory_dealerId_productId_key" ON "dealer_inventory"("dealerId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_definitions_code_key" ON "workflow_definitions"("code");

-- CreateIndex
CREATE INDEX "workflow_definitions_module_idx" ON "workflow_definitions"("module");

-- CreateIndex
CREATE INDEX "workflow_definitions_status_idx" ON "workflow_definitions"("status");

-- CreateIndex
CREATE INDEX "workflow_definitions_deletedAt_idx" ON "workflow_definitions"("deletedAt");

-- CreateIndex
CREATE INDEX "workflow_instances_definitionId_idx" ON "workflow_instances"("definitionId");

-- CreateIndex
CREATE INDEX "workflow_instances_businessType_businessKey_idx" ON "workflow_instances"("businessType", "businessKey");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_instances_deletedAt_idx" ON "workflow_instances"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_rules_code_key" ON "compliance_rules"("code");

-- CreateIndex
CREATE INDEX "compliance_rules_module_idx" ON "compliance_rules"("module");

-- CreateIndex
CREATE INDEX "compliance_rules_status_idx" ON "compliance_rules"("status");

-- CreateIndex
CREATE INDEX "compliance_rules_deletedAt_idx" ON "compliance_rules"("deletedAt");

-- CreateIndex
CREATE INDEX "compliance_records_ruleId_idx" ON "compliance_records"("ruleId");

-- CreateIndex
CREATE INDEX "compliance_records_recordType_recordId_idx" ON "compliance_records"("recordType", "recordId");

-- CreateIndex
CREATE INDEX "compliance_records_result_idx" ON "compliance_records"("result");

-- CreateIndex
CREATE INDEX "compliance_records_deletedAt_idx" ON "compliance_records"("deletedAt");

-- CreateIndex
CREATE INDEX "compliance_evidences_recordId_idx" ON "compliance_evidences"("recordId");

-- CreateIndex
CREATE INDEX "compliance_evidences_deletedAt_idx" ON "compliance_evidences"("deletedAt");

-- CreateIndex
CREATE INDEX "performance_targets_dimension_objectId_idx" ON "performance_targets"("dimension", "objectId");

-- CreateIndex
CREATE INDEX "performance_targets_period_idx" ON "performance_targets"("period");

-- CreateIndex
CREATE INDEX "performance_targets_indicator_idx" ON "performance_targets"("indicator");

-- CreateIndex
CREATE INDEX "performance_targets_deletedAt_idx" ON "performance_targets"("deletedAt");

-- CreateIndex
CREATE INDEX "performance_actuals_targetId_idx" ON "performance_actuals"("targetId");

-- CreateIndex
CREATE INDEX "performance_actuals_reportedAt_idx" ON "performance_actuals"("reportedAt");

-- CreateIndex
CREATE INDEX "performance_actuals_deletedAt_idx" ON "performance_actuals"("deletedAt");

-- CreateIndex
CREATE INDEX "dashboard_configs_userId_idx" ON "dashboard_configs"("userId");

-- CreateIndex
CREATE INDEX "dashboard_configs_type_idx" ON "dashboard_configs"("type");

-- CreateIndex
CREATE INDEX "dashboard_configs_deletedAt_idx" ON "dashboard_configs"("deletedAt");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_departments" ADD CONSTRAINT "customer_departments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_records" ADD CONSTRAINT "visit_records_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedCustomerId_fkey" FOREIGN KEY ("convertedCustomerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_follow_records" ADD CONSTRAINT "lead_follow_records_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentions" ADD CONSTRAINT "intentions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intention_stage_records" ADD CONSTRAINT "intention_stage_records_intentionId_fkey" FOREIGN KEY ("intentionId") REFERENCES "intentions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reagent_batches" ADD CONSTRAINT "reagent_batches_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_reminders" ADD CONSTRAINT "schedule_reminders_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_instances" ADD CONSTRAINT "approval_instances_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "approval_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_tasks" ADD CONSTRAINT "approval_tasks_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "approval_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_cc_records" ADD CONSTRAINT "approval_cc_records_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "approval_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_histories" ADD CONSTRAINT "ticket_histories_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_contracts" ADD CONSTRAINT "dealer_contracts_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_orders" ADD CONSTRAINT "dealer_orders_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_inventory" ADD CONSTRAINT "dealer_inventory_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "compliance_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_evidences" ADD CONSTRAINT "compliance_evidences_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "compliance_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_actuals" ADD CONSTRAINT "performance_actuals_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "performance_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
