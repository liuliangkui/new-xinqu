# XQCOP Server

鑫渠业务协同运营平台后端服务，基于 NestJS + Prisma + PostgreSQL + Redis。

## 本地开发

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run start:dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 热重载开发模式 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行单元测试 |
| `npm run db:migrate` | 数据库迁移 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:seed` | 种子数据 |

## 目录结构

```text
src/
├── common/           # 拦截器、过滤器、公共模块
├── modules/          # 业务模块
├── prisma/           # Prisma 服务
├── redis/            # Redis 服务
├── app.module.ts
└── main.ts
```

## API 文档

启动后访问：`http://localhost:3000/api/docs`
