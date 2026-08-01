# resume-dev

## 描述

在新电脑或新环境中快速恢复一个已有项目的开发环境，确保可以立即继续开发。

适用于：换电脑、重装系统、新员工入职、在新机器上接手项目。

## 用法

```text
/resume-dev [项目 GitHub 仓库地址或本地路径]
```

- 如果参数是 GitHub URL：先 clone 到当前工作目录或指定目录。
- 如果参数是本地路径：直接进入该目录检查环境。
- 如果没有参数：使用当前工作目录。
- 参数通过 `$1` / `$ARGUMENTS` 传入。

## 执行原则

- 先检查本地是否已有项目，避免重复 clone。
- 所有关键步骤都要验证，不通过的停下来报告。
- 如果数据库/Redis 起不来，给出排查命令。
- 最后给出“可以开始开发”的确认和启动命令。

## 执行清单

### 1. 获取项目代码

#### 1.1 如果参数是 GitHub URL

```bash
git clone $REPO_URL
```

进入项目目录。

#### 1.2 如果参数是本地路径或当前目录

确认目录下存在：

- `package.json`
- `apps/server/package.json`
- `apps/web/package.json`
- `.env.example`

如果不存在，提示用户路径错误。

### 2. 检查基础环境

确认已安装：

- `node --version` >= 22
- `npm --version` >= 10
- `docker --version`
- `docker compose version`
- `git --version`

缺少任何一项都要明确告诉用户先安装。

### 3. 安装依赖

```bash
npm install
```

如果失败，尝试：

```bash
npm install --legacy-peer-deps
```

### 4. 启动基础设施

```bash
docker compose up -d
```

然后检查健康状态：

```bash
docker compose ps
```

如果 postgres/redis 不健康，查看日志：

```bash
docker compose logs postgres
```

### 5. 配置环境变量

如果 `.env` 不存在，从 `.env.example` 复制：

```bash
cp .env.example .env
```

提醒用户检查关键配置：

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_HOST` / `REDIS_PORT`
- `CORS_ORIGIN`
- `UPLOAD_*`

### 6. 初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

如果 seed 已经执行过，可以跳过 `db:seed`，但建议执行一次确保角色/管理员存在。

### 7. 验证构建

```bash
npm run build:server
npm run build:web
```

### 8. 启动开发服务

打开两个终端（或后台任务）：

```bash
# 终端 1：后端
npm run dev:server
```

```bash
# 终端 2：前端
npm run dev:web
```

### 9. 检查服务是否就绪

```bash
curl http://localhost:3000/api/health
```

前端默认地址：`http://localhost:5173`

### 10. 登录验证

使用 seed 创建的默认管理员账号登录：

- 用户名：`admin`
- 密码：`admin123`

如果登录失败，检查：

- 后端是否正常启动
- 数据库是否已 seed
- `.env` 中的 `JWT_SECRET` 是否一致

## 常见问题

### 端口冲突

如果 3000/5173/5432/6379 被占用，修改 `.env` 和 `docker-compose.yml` 中的端口映射。

### 数据库已存在但 schema 不对

```bash
npm run db:migrate reset
```

或手动进入 PostgreSQL 容器清理后重新 migrate。

### 前端依赖安装失败

可能是 Node 版本或 npm workspace 问题，尝试：

```bash
npm install --legacy-peer-deps
# 或单独安装前端
npm install -w apps/web
```

## 输出要求

- 最后明确告诉用户：项目已恢复，可以开始开发。
- 给出接下来常用的开发命令。
- 如果某一步失败，说明失败原因和下一步排查建议。
