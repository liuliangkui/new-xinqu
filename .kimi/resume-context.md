# 鑫渠 CRM（XQCOP）开发上下文快照

> 本文件用于换电脑或新会话时快速恢复开发上下文。每次关键变更后应更新。

---

## 项目基线

| 项          | 值                                                                              |
| ----------- | ------------------------------------------------------------------------------- |
| 项目名称    | 鑫渠 CRM / XQCOP                                                                |
| 本地路径    | `/Users/mac/qucheng`                                                            |
| GitHub 仓库 | `https://github.com/liuliangkui/new-xinqu.git`                                  |
| 分支        | `main`                                                                          |
| 最新提交    | `1d8dadc fix(approval): 修复驳回阶段选择按钮的模板表达式语法错误`               |
| 技术栈      | Vue 3 + Vite + TypeScript（前端），NestJS + Prisma + PostgreSQL + Redis（后端） |
| 工作流引擎  | Camunda 7（通过 FlowableService 适配）                                          |

---

## 当前活跃工作

- **主题**：审批中心驳回功能完善，支持驳回到指定阶段并指定具体处理人。
- **状态**：已完成后端 DTO/Service/BPMN 动态指派 + 前端弹窗人员选择 + 修复模板语法错误，已提交推送。
- **待办**：无明确阻塞；等待用户下一步指令（继续完善审批中心、切换其他模块、复用性改造等）。

---

## 最近的变更（按时间倒序）

1. `1d8dadc` — 修复驳回阶段选择按钮的模板表达式语法错误
2. `75942e9` — 驳回支持指定具体处理人
3. `d38de3e` — 本地审批模式支持驳回到指定节点
4. 更早：审批中心重构为邮件式发起、图形化流程设计器、本地/Camunda 双模式等。

---

## 开发服务状态（本机运行时）

| 服务         | 命令                   | 默认地址                    | 备注                          |
| ------------ | ---------------------- | --------------------------- | ----------------------------- |
| 后端开发服务 | `npm run dev:server`   | `http://localhost:3001/api` | 端口因 3000 占用已调整为 3001 |
| 前端开发服务 | `npm run dev:web`      | `http://localhost:5173`     | Vite 代理 `/api/v1` 到 3001   |
| 数据库       | `docker compose up -d` | `localhost:5432`            | PostgreSQL 16                 |
| 缓存         | `docker compose up -d` | `localhost:6379`            | Redis 7                       |

> 换电脑后背景任务不会保留，需重新执行启动命令。

---

## 关键文档索引

| 文档                                   | 用途                             |
| -------------------------------------- | -------------------------------- |
| `docs/XQCOP-技术架构方案.md`           | 总体技术选型、分层架构、部署架构 |
| `docs/XQCOP-领域建模方案.md`           | 业务领域模型                     |
| `docs/XQCOP-后端复用性提升开发计划.md` | 复用性改造计划                   |
| `docs/鑫渠设计与开发规范.md`           | 前端设计规范、双中台分层         |
| `docs/审批中心功能与交互说明.md`       | 审批中心业务设计                 |
| `AGENTS.md`                            | AI Agent 协作入口规范            |

---

## 常用命令

```bash
# 安装依赖
npm install

# 启动基础设施
docker compose up -d

# 数据库
cp .env.example .env      # 如 .env 不存在
npm run db:generate
npm run db:migrate
npm run db:seed

# 启动开发服务（两个独立终端/后台任务）
npm run dev:server
npm run dev:web

# 验证
npm run lint:server && npm run build:server
npm run lint:web && npm run type-check -w apps/web
```

---

## 默认登录账号

| 账号          | 密码       | 角色       |
| ------------- | ---------- | ---------- |
| `admin`       | `admin123` | 系统管理员 |
| `13800000001` | `123456`   | 销售代表   |
| `13900000002` | `123456`   | 区域经理   |
| `13700000003` | `123456`   | 只读用户   |

---

_最后更新：2026-08-03_
