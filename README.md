# XQCOP 鑫渠业务协同运营平台

面向医疗行业渠道与销售团队的业务协同运营平台（CRM + 运营中台）。

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite + Tailwind CSS + Ant Design Vue + Pinia
- **后端**：NestJS + TypeScript + Prisma + PostgreSQL + Redis
- **文档**：Markdown + Swagger/OpenAPI
- **部署**：Docker + Docker Compose

## 目录结构

```text
.
├── apps/
│   ├── web/              # 前端 Vue 项目
│   └── server/           # 后端 NestJS 项目
├── docs/                 # 设计文档、规范、方案
├── prototype/            # 高保真原型与 HTML 白皮书
├── scripts/              # 辅助脚本与 Git Hooks
├── docker-compose.yml    # 开发环境编排
├── .env.example          # 环境变量模板
└── README.md             # 本文件
```

## 快速开始

### 前置要求

- Node.js >= 22.0.0
- npm >= 10
- Docker Desktop（用于 PostgreSQL + Redis）

### 1. 安装依赖

```bash
cd /Users/mac/qucheng
npm install --legacy-peer-deps
```

### 2. 启动数据库

```bash
docker-compose up -d postgres redis
```

### 3. 初始化数据库

```bash
npm run db:migrate
npm run db:seed
```

### 4. 启动开发服务

```bash
# 终端 1：后端
npm run dev:server

# 终端 2：前端
npm run dev:web
```

访问：

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3000/api`
- Swagger 文档：`http://localhost:3000/api/docs`

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev:web` | 启动前端开发服务器 |
| `npm run dev:server` | 启动后端开发服务器（热重载） |
| `npm run build:web` | 构建前端生产包 |
| `npm run build:server` | 构建后端生产包 |
| `npm run lint:web` | 前端代码检查 |
| `npm run lint:server` | 后端代码检查 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:seed` | 执行数据种子 |
| `npm run api:types` | 根据 Swagger 生成前端 API 类型 |

## 默认账号

迁移并执行 seed 后，可使用以下账号登录：

- 用户名：`admin`
- 密码：`admin123`

## 开发规范

详见 `docs/XQCOP-API接口规范.md`、`docs/鑫渠设计与开发规范.md` 和 `CONTRIBUTING.md`。

## 相关文档索引

- `docs/XQCOP-技术架构方案.md` — 整体技术选型与架构
- `docs/XQCOP-领域建模方案.md` — 领域模型设计
- `docs/XQCOP-API接口规范.md` — 前后端接口约定
- `prototype/鑫渠高保真原型.html` — 高保真交互原型
