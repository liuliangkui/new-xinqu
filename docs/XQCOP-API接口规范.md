# XQCOP API 接口规范

> 适用于鑫渠业务协同运营平台（XQCOP）前后端交互。
> 后端基础地址：`/api/v1`
> Swagger 文档：`http://localhost:3000/api/docs`

---

## 1. 通用约定

### 1.1 基础路径

所有业务接口均基于 `/api/v1`，由 NestJS 全局前缀 `api` + URI 版本 `v1` 组成。

示例：

```text
GET  /api/v1/users          # 用户列表
POST /api/v1/auth/login     # 登录
GET  /api/v1/health         # 健康检查
```

### 1.2 HTTP 方法

| 方法 | 语义 |
|------|------|
| GET | 查询资源 / 列表 / 详情 |
| POST | 创建资源 / 提交操作 |
| PUT | 全量更新资源 |
| PATCH | 局部更新资源（按需使用） |
| DELETE | 删除资源 |

### 1.3 请求头

```text
Content-Type: application/json
Authorization: Bearer <accessToken>
```

登录接口与公开接口不需要 `Authorization`。

---

## 2. 响应格式

### 2.1 成功响应

```json
{
  "code": 200,
  "data": { ... },
  "message": "success",
  "success": true,
  "timestamp": "2026-08-01T12:00:00.000Z"
}
```

### 2.2 错误响应

HTTP 状态码统一返回 `200`，业务错误通过 `code` 和 `success` 表达。

```json
{
  "code": 401,
  "data": null,
  "message": "未授权，请先登录",
  "success": false,
  "timestamp": "2026-08-01T12:00:00.000Z",
  "path": "/api/v1/users"
}
```

### 2.3 常用状态码

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 校验失败 |
| 500 | 服务器内部错误 |

---

## 3. 分页规范

### 3.1 请求参数

```text
GET /api/v1/users?page=1&pageSize=20&keyword=张
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 当前页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 20 |
| keyword | string | 否 | 通用关键词搜索 |

各模块可额外声明专属过滤参数，如 `status`、`level`、`poolType` 等。

### 3.2 响应结构

```json
{
  "code": 200,
  "data": {
    "list": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  },
  "message": "success",
  "success": true,
  "timestamp": "..."
}
```

---

## 4. 认证规范

### 4.1 登录

```text
POST /api/v1/auth/login
```

请求体：

```json
{
  "username": "admin",
  "password": "admin123"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "xxx",
      "username": "admin",
      "name": "系统管理员"
    }
  },
  "message": "success",
  "success": true,
  "timestamp": "..."
}
```

### 4.2 Token 使用

前端获取 `accessToken` 后，在后续请求头中携带：

```text
Authorization: Bearer <accessToken>
```

Token 过期后接口返回 `401`，前端应跳转登录页或刷新 Token（后续支持 refreshToken 时再扩展）。

---

## 5. 模块接口清单（V1.0）

### 5.1 认证 Auth

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |

### 5.2 用户 User

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users` | 用户列表 |
| GET | `/users/:id` | 用户详情 |
| POST | `/users` | 创建用户 |
| PUT | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |

### 5.3 客户 Customer

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/customers` | 客户列表 |
| GET | `/customers/:id` | 客户详情 |
| POST | `/customers` | 创建客户 |
| PUT | `/customers/:id` | 更新客户 |
| DELETE | `/customers/:id` | 删除客户 |

### 5.4 线索 Lead

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/leads` | 线索列表 |
| GET | `/leads/:id` | 线索详情 |
| POST | `/leads` | 创建线索 |
| PUT | `/leads/:id` | 更新线索 |
| DELETE | `/leads/:id` | 删除线索 |

### 5.5 健康检查 Health

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 服务与依赖健康状态 |

---

## 6. 前端请求封装

前端统一使用 `src/api/request.ts`，已自动处理：

- 基础 URL 读取 `VITE_API_BASE_URL`
- Bearer Token 注入
- 请求参数序列化
- 统一响应解构（`response.data.data`）
- 全局错误提示

示例：

```ts
import { get, post } from '@/api/request'

// 列表
const users = await get('/users', { page: 1, pageSize: 10 })

// 创建
const user = await post('/users', { username: 'foo', name: 'Foo' })
```

---

## 7. OpenAPI 类型生成

后端 Swagger 文档运行时地址：

```text
http://localhost:3000/api/docs-json
```

前端通过 `openapi-typescript` 生成 TypeScript 类型：

```bash
cd /Users/mac/qucheng
npx openapi-typescript http://localhost:3000/api/docs-json -o src/types/api-generated.d.ts
```

生成的类型可用于 API 函数签名与前端类型约束。

---

## 8. 版本演进

- `v1`：当前版本，覆盖认证、用户、客户、线索基础 CRUD。
- 后续新增业务模块（意向、任务、工单、审批等）按同样规范扩展路径与 DTO。
