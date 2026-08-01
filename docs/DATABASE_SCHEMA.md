# XQCOP 数据库模型说明

本文档对应 `apps/server/prisma/schema.prisma`，按业务模块划分，说明每张表的用途和核心字段。

## 设计约定

- 所有业务表均包含 `createdAt`、`updatedAt`、`deletedAt`。
- `deletedAt` 不为空表示已软删；查询默认过滤软删数据，可通过 `withDeleted: true` 查询全部。
- 主键统一使用 `String` + `cuid()`。
- 金额字段使用 `Decimal`。
- 状态、类型等枚举暂用 `String` + 注释说明，后续可升级为 Prisma enum。
- JSON 字段用于灵活配置（权限、表单、流程节点、布局等）。

---

## 1. 系统层

| 模型                  | 说明                                                       |
| --------------------- | ---------------------------------------------------------- |
| `SystemConfig`        | 系统配置项，支持 STRING / NUMBER / BOOLEAN / JSON          |
| `SystemConfigHistory` | 配置变更历史                                               |
| `AuditLog`            | 审计日志，由审计日志拦截器写入                             |
| `FileAttachment`      | 通用附件表，按 module + recordType + recordId 关联业务对象 |

---

## 2. 组织架构

| 模型          | 说明                                                                  |
| ------------- | --------------------------------------------------------------------- |
| `Department`  | 部门树，支持 parentId + path                                          |
| `Region`      | 区域树，用于数据权限范围 REGION                                       |
| `User`        | 用户，roleIds 为角色 ID 数组                                          |
| `Role`        | 角色，permissions 为 `[{ resource, action }]`，dataScope 控制数据范围 |
| `UserSetting` | 用户个性化设置（主题、语言、布局等）                                  |

---

## 3. 应用中心

| 模型           | 说明                                 |
| -------------- | ------------------------------------ |
| `App`          | 应用定义，用于动态菜单和应用中心     |
| `UserFavorite` | 用户收藏（应用、客户、线索、报表等） |

---

## 4. 消息通知

| 模型                  | 说明             |
| --------------------- | ---------------- |
| `Message`             | 站内消息 / 通知  |
| `NotificationSetting` | 用户通知渠道开关 |

---

## 5. 客户 360°

| 模型                 | 说明         |
| -------------------- | ------------ |
| `Customer`           | 客户主数据   |
| `Contact`            | 联系人       |
| `CustomerDepartment` | 客户内部科室 |
| `VisitRecord`        | 拜访记录     |

---

## 6. 线索管理

| 模型               | 说明                               |
| ------------------ | ---------------------------------- |
| `Lead`             | 线索，poolType 区分 我的/公海/团队 |
| `LeadFollowRecord` | 跟进记录                           |

---

## 7. 意向管理

| 模型                   | 说明                              |
| ---------------------- | --------------------------------- |
| `Intention`            | 商机/意向，含阶段、概率、预计金额 |
| `IntentionStageRecord` | 阶段变更历史                      |

---

## 8. 产品 / 品牌 / 设备 / 试剂

| 模型                 | 说明                                   |
| -------------------- | -------------------------------------- |
| `Brand`              | 品牌库                                 |
| `Product`            | 产品，category 区分设备/试剂/服务/套餐 |
| `Equipment`          | 已安装设备资产                         |
| `ReagentBatch`       | 试剂批次库存                           |
| `ReagentConsumption` | 试剂消耗记录                           |

---

## 9. 任务管理

| 模型          | 说明                                             |
| ------------- | ------------------------------------------------ |
| `Task`        | 任务，支持 owner、assignee、参与者、关联业务对象 |
| `TaskComment` | 任务评论                                         |

---

## 10. 日历 / 日程

| 模型               | 说明                         |
| ------------------ | ---------------------------- |
| `Schedule`         | 日程，支持全天、关联业务对象 |
| `ScheduleReminder` | 日程提醒记录                 |

---

## 11. 审批中心

| 模型               | 说明                               |
| ------------------ | ---------------------------------- |
| `ApprovalTemplate` | 审批模板，含表单 schema 和流程节点 |
| `ApprovalInstance` | 审批实例                           |
| `ApprovalTask`     | 审批任务（待办/已办）              |
| `ApprovalCcRecord` | 抄送记录                           |

---

## 12. 售后工单

| 模型            | 说明                       |
| --------------- | -------------------------- |
| `Ticket`        | 工单，关联客户/联系人/设备 |
| `TicketComment` | 工单回复/备注              |
| `TicketHistory` | 工单字段变更历史           |

---

## 13. 经销商协同

| 模型              | 说明       |
| ----------------- | ---------- |
| `Dealer`          | 经销商     |
| `DealerContract`  | 经销合同   |
| `DealerOrder`     | 经销商订单 |
| `DealerInventory` | 经销商库存 |

---

## 14. 流程设计器

| 模型                 | 说明                  |
| -------------------- | --------------------- |
| `WorkflowDefinition` | 流程定义（BPMN-lite） |
| `WorkflowInstance`   | 流程实例              |

---

## 15. 合规风控

| 模型                 | 说明         |
| -------------------- | ------------ |
| `ComplianceRule`     | 合规规则     |
| `ComplianceRecord`   | 合规检查记录 |
| `ComplianceEvidence` | 合规证据附件 |

---

## 16. 目标绩效

| 模型                | 说明                                             |
| ------------------- | ------------------------------------------------ |
| `PerformanceTarget` | 绩效目标，维度：USER/DEPT/REGION/PRODUCT/CHANNEL |
| `PerformanceActual` | 实际达成                                         |

---

## 17. 经营驾驶舱

| 模型              | 说明                 |
| ----------------- | -------------------- |
| `DashboardConfig` | 驾驶舱布局与组件配置 |

---

## 常用命令

```bash
# 生成 Prisma Client
npm run db:generate

# 创建并执行迁移（需要 PostgreSQL 已启动）
npm run db:migrate

# 初始化基础数据
npm run db:seed

# 打开 Prisma Studio
npm run db:studio
```

## 下一步

1. 运行 `npm run db:migrate` 生成初始迁移文件。
2. 运行 `npm run db:seed` 写入角色、部门、区域、应用、管理员账号。
3. 按模块开发时，优先实现该模块的 Service + Controller + DTO。
