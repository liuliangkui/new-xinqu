# XQCOP 开发贡献指南

## 开发环境

```bash
# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 启动数据库
docker-compose up -d postgres redis

# 3. 初始化数据库
npm run db:migrate
npm run db:seed

# 4. 启动前后端开发服务
npm run dev:server
npm run dev:web
```

## 分支规范

- `main`：主分支，始终保持可构建、可运行
- `feature/<module>-<desc>`：功能分支，例如 `feature/customer-list`
- `fix/<module>-<desc>`：修复分支，例如 `fix/login-token`
- `docs/<desc>`：文档分支

## 提交规范

提交信息格式：`<type>(<scope>): <subject>`

| type | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 |
| docs | 文档 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

示例：

```bash
git commit -m "feat(customer): 客户列表分页查询接口"
git commit -m "fix(auth): 修复 token 过期未清理问题"
```

## 代码规范

- TypeScript 严格模式已开启，避免使用 `any`
- 后端接口统一返回 `{ code, data, message, success }` 格式
- 前端 API 调用统一使用 `src/api/request.ts`
- 组件命名使用多单词形式，避免单个 `index.vue` 作为页面组件名

## 测试要求

- 后端：新增 Service/Controller 至少补充一个单元测试
- 前端：新增核心 API 或工具函数至少补充一个单元测试
- 提交前确保 `npm run build:server`、`npm run build:web`、`npm run test:unit -w apps/server`、`npm run test:unit -w apps/web` 通过

## PR 规范

1. 从 `main` 切出功能分支
2. 开发完成后 push 到远程
3. 创建 Pull Request 到 `main`
4. 确保 CI 全部通过
5. 由维护者合并

## 文档更新

- 新增/修改接口时，同步更新 `docs/XQCOP-API接口规范.md`
- 新增业务模块时，在 `docs/README.md` 索引中登记
- 架构调整时，同步更新 `docs/XQCOP-技术架构方案.md`
