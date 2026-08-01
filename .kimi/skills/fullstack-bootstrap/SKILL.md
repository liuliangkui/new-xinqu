# fullstack-bootstrap

## 描述

从 0 开始搭建一个基于 **NestJS + Vue 3 + Prisma + Redis** 的 monorepo 项目，并一次性补齐工程化基础设施、RBAC、Mock、API 类型生成、CI/CD、Docker 部署等初始化工作。

适用场景：

- 全新项目，需要把技术栈和工程规范一次性搭好。
- 已有原型/脚手架，需要升级到可协作、可部署、可审计的工程化项目。

## 用法

```text
/fullstack-bootstrap [项目根目录]
```

- 如果路径不存在，先创建目录。
- 如果提供了路径，进入该目录执行。
- 如果没有提供路径，使用当前工作目录。
- 参数通过 `$1` / `$ARGUMENTS` 传入。

## 执行原则

- 每一步都要验证：`build`、`lint`、`test`、`generate` 至少跑一个相关命令。
- 每完成一个阶段就 `git add` + `git commit` + `git push`。
- 不改动业务逻辑，只补基础设施。
- 遇到阻塞先停下来报告，不强行跳过。
- 优先使用项目已存在的文件；不存在时才创建模板。

## 技术栈与版本要求

- Node.js >= 22
- npm >= 10（使用 workspaces）
- NestJS 11
- Vue 3.5 + Vue Router 4 + Pinia 4
- Prisma 6 + PostgreSQL 16
- Redis 7
- TypeScript 5

## 执行清单

### Phase 0：从 0 创建项目骨架（如果已存在则跳过）

#### 0.1 创建目录并初始化 Git

```bash
mkdir -p $PROJECT_ROOT/apps $PROJECT_ROOT/.github/workflows
 cd $PROJECT_ROOT
git init
```

创建 `.gitignore`：

```gitignore
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/
*.tsbuildinfo

# 环境变量（生产/本地敏感配置）
.env
.env.local
.env.*.local

# 日志
logs/
*.log
npm-debug.log*

# 编辑器
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# 测试与覆盖率
coverage/
playwright-report/
test-results/

# 上传文件
uploads/
```

#### 0.2 创建根 package.json

```json
{
  "name": "xqcop",
  "version": "0.0.1",
  "private": true,
  "description": "",
  "type": "module",
  "workspaces": ["apps/*"],
  "scripts": {
    "dev:web": "npm run dev -w apps/web",
    "dev:server": "npm run start:dev -w apps/server",
    "build:web": "npm run build -w apps/web",
    "build:server": "npm run build -w apps/server",
    "lint:web": "npm run lint -w apps/web",
    "lint:server": "npm run lint -w apps/server",
    "db:migrate": "npm run db:migrate -w apps/server",
    "db:generate": "npm run db:generate -w apps/server",
    "db:seed": "npm run db:seed -w apps/server",
    "api:types": "npm run openapi:generate -w apps/server && npm run api:types -w apps/web",
    "test:server": "npm test -w apps/server",
    "test:web": "npm run test:unit -w apps/web",
    "test:e2e": "playwright test --config e2e/playwright.config.ts",
    "prepare": "husky"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

#### 0.3 初始化后端 NestJS

方式 A（推荐）：使用 Nest CLI

```bash
cd apps
nest new server --strict --package-manager npm
```

方式 B（手动）：创建 `apps/server/package.json` 并安装核心依赖

```bash
cd apps/server
npm init -y
npm install @nestjs/common @nestjs/core @nestjs/config @nestjs/platform-express @nestjs/swagger @nestjs/jwt @nestjs/passport @nestjs/throttler @nestjs/schedule @nestjs/event-emitter @prisma/client bcrypt class-transformer class-validator dayjs helmet ioredis nest-winston passport passport-jwt reflect-metadata rxjs winston
npm install -D @nestjs/cli @nestjs/schematics @nestjs/testing @types/bcrypt @types/express @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier globals jest prettier prisma source-map-support supertest ts-jest ts-loader ts-node tsconfig-paths typescript typescript-eslint
```

后端必须包含：

- `src/main.ts`
- `src/app.module.ts`
- `src/app.controller.ts`
- `tsconfig.json`（含 `@/* -> src/*` paths）
- `package.json` scripts：`build`、`start:dev`、`lint`、`test`、`db:*`

#### 0.4 初始化前端 Vue

方式 A（推荐）：

```bash
cd apps
npm create vue@latest web
```

选择：TypeScript、Vue Router、Pinia、Vitest、ESLint + Prettier。

方式 B（手动）：创建 `apps/web/package.json` 并安装

```bash
cd apps/web
npm init -y
npm install vue vue-router pinia axios dayjs ant-design-vue @ant-design/icons-vue
npm install -D vite @vitejs/plugin-vue @vitejs/plugin-vue-jsx @vue/tsconfig typescript eslint prettier vitest @vue/test-utils jsdom @types/node
```

前端必须包含：

- `index.html`
- `vite.config.ts`
- `src/main.ts`
- `src/router/index.ts`
- `src/App.vue`
- `src/stores/`（Pinia）
- `package.json` scripts：`dev`、`build`、`preview`、`test:unit`、`lint`

#### 0.5 安装根依赖并初始化 Prisma

```bash
cd $PROJECT_ROOT
npm install
npx prisma init --schema apps/server/prisma/schema.prisma
```

创建最小 schema：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

#### 0.6 创建最小运行验证

- 后端 `npm run build:server` 通过。
- 前端 `npm run build:web` 通过。
- 第一次 commit："chore: init monorepo skeleton"。

---

### Phase 1：提交规范与代码格式化

- 安装 `husky`、`lint-staged`、`commitlint`。
- 配置 `.husky/pre-commit` 和 `.husky/commit-msg`。
- 创建 `commitlint.config.cjs`。
- 根目录 `.prettierrc` 统一前后端风格。
- `.prettierignore` 排除 `dist`、`node_modules`、lock 文件。
- 如果前端历史 lint 债务多，lint-staged 里前端先只跑 prettier，避免阻塞提交。

---

### Phase 2：后端安全加固

- `helmet` 安全头。
- `@nestjs/throttler` 接口限流，区分 default/auth 两个规则。
- 登录失败锁定（5 次/15 分钟）。
- CORS 配置从环境变量读取。
- JWT 从环境变量读取 secret。

---

### Phase 3：后端日志

- `winston` + `nest-winston` 模块。
- 请求日志中间件，记录 method/path/status/duration/ip。
- 审计日志拦截器，注册到 `CommonModule`。

---

### Phase 4：Redis 缓存

- `RedisService` 封装 ioredis 连接。
- `CacheService` 提供 get/set/remember/delPattern/按标签失效。
- 注册到 `RedisModule` 并全局导出。

---

### Phase 5：文件上传

- `UploadModule`：单文件/多文件、类型/大小校验、本地磁盘存储。
- `main.ts` 中配置 `/uploads` 静态服务。
- 环境变量控制上传目录、大小、允许类型。

---

### Phase 6：Prisma 事务与软删除

- 核心业务表增加 `deletedAt DateTime?`。
- 创建 Prisma extension，自动过滤已软删数据。
- `PrismaService` 提供 `runInTransaction()`。
- 增加 `softDelete` / `restore` 模型方法。

---

### Phase 7：定时任务

- `@nestjs/schedule` 示例：清理 30 天前软删数据 + 心跳日志。

---

### Phase 8：CI / 安全扫描

- `.github/workflows/ci.yml`：lint/build/test + 安全审计 + E2E。
- `npm audit --audit-level=high`（`continue-on-error: true`）。
- PR 使用 `dependency-review-action`。

---

### Phase 9：多环境部署

- 修复/创建 `apps/server/Dockerfile`（支持 monorepo 构建）。
- 创建 `apps/web/Dockerfile` + `nginx.conf`。
- `docker-compose.yml` 用于开发，`docker-compose.prod.yml` 用于生产。
- 补齐 `.env.example`、环境变量说明。

---

### Phase 10：前端性能

- 路由懒加载。
- `vite.config.ts` 中配置 `manualChunks` 拆分 vendor/ui。

---

### Phase 11：代码覆盖率

- 后端 Jest：`coverageReporters` + `coverageThreshold`（先设 0，后续提高）。
- 前端 Vitest：`@vitest/coverage-v8` + thresholds。

---

### Phase 12：E2E 测试

- 安装 `@playwright/test`。
- 创建 `e2e/playwright.config.ts` + 登录页冒烟用例。
- CI 中安装浏览器并运行。

---

### Phase 13：国际化 i18n

- 安装 `vue-i18n@11`。
- `src/i18n` 目录 + `zh-CN` / `en-US`。
- 登录页接入 `t()` 作为示例。

---

### Phase 14：GitHub 分支保护

- 通过 `gh api` 为 `main` 设置保护规则：
  - 需要 1 个 PR 审批。
  - 必须通过 `lint-and-build`、`security-audit`、`e2e` 状态检查。
  - 禁止 force push / 删除分支。

---

### Phase 15：API 类型自动生成

- 后端写 `scripts/generate-openapi.ts`，离线生成 `openapi.json`。
- 前端 `api:types` 脚本读取该 JSON 生成 `src/types/api-generated.d.ts`。
- 根目录提供 `npm run api:types`。

---

### Phase 16：MSW Mock

- `npx msw init public --save`。
- `src/mocks/handlers.ts` + `browser.ts`。
- `.env.development` 启用 mock，`.env.production` 关闭。
- `main.ts` 动态启动 worker。

---

### Phase 17：RBAC 后端

- `@Public()` 装饰器。
- `@Permissions('resource:action')` 装饰器。
- `JwtAuthGuard` 全局认证，自动跳过 `@Public()`。
- `RolesGuard` 全局鉴权，按角色 `permissions` 校验。
- `GET /auth/profile` 返回当前用户及权限。

---

### Phase 18：RBAC 前端

- `stores/auth.ts`：统一 token、登录后拉 profile、`hasPermission/hasRole`。
- `api/auth.ts` 接入真实登录/用户信息接口。
- 路由守卫：未登录跳转、无权限跳转 404。
- 所有业务路由挂 `meta.permissions`。

---

### Phase 19：数据权限范围

- `DataScopeHelper` 支持 `ALL/SELF/DEPT/DEPT_AND_CHILD/REGION`。
- 在 `CustomerService.findAll` 中接入作为示例。

---

### Phase 20：统一错误处理

- 后端 `BusinessException` + 业务错误码。
- `HttpExceptionFilter` 统一返回格式。
- 前端 `request.ts` 非静默请求自动弹错误提示，401 自动跳转登录。

---

### Phase 21：角色/权限种子数据

- `prisma/seed.ts`：初始化 `super_admin`、`sales`、`region_manager`、`viewer` 角色。
- 创建默认管理员账号 `admin / admin123`。
- 数据库就绪后执行 `npm run db:seed`。

---

## 验证命令

每完成一个阶段优先跑：

```bash
npm run build:server
npm run lint:server
npm run test:server
npm run build:web
npm run api:types
```

## 输出要求

- 最后给用户一份清单，说明已完成项、验证结果、下一步建议。
- 如果 `main` 已开启分支保护，提醒用户后续非管理员 push 需要走 PR。
- 如果是从 0 创建的项目，提醒用户：
  - 创建 PostgreSQL 和 Redis 实例。
  - 填写 `.env` 后执行 `npm run db:migrate && npm run db:seed`。
  - 用 `admin / admin123` 登录验证 RBAC。
