#!/bin/bash
# XQCOP 开发环境一键初始化脚本
# 用途：新电脑/重装系统后快速恢复开发环境

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== XQCOP 开发环境初始化 ==="
echo "项目目录: $PROJECT_DIR"

# 检查 Node 版本
echo ""
echo "[1/7] 检查 Node 版本..."
node -v
npm -v

# 检查 .env
if [ ! -f ".env" ]; then
  echo ""
  echo "[2/7] 复制 .env.example 为 .env..."
  cp .env.example .env
  echo "⚠️  请检查 .env 中的配置是否需要修改"
else
  echo ""
  echo "[2/7] .env 已存在，跳过"
fi

# 安装依赖
echo ""
echo "[3/7] 安装项目依赖..."
npm install --legacy-peer-deps

# 生成 Prisma Client
echo ""
echo "[4/7] 生成 Prisma Client..."
npm run db:generate

# 启动 Docker 服务
echo ""
echo "[5/7] 启动 PostgreSQL 和 Redis..."
if command -v docker-compose &> /dev/null; then
  docker-compose up -d postgres redis
elif command -v docker &> /dev/null; then
  docker compose up -d postgres redis
else
  echo "❌ 未找到 docker-compose 或 docker 命令，请安装 Docker Desktop"
  exit 1
fi

# 等待数据库就绪
echo ""
echo "[6/7] 等待数据库就绪..."
sleep 5

# 数据库迁移和种子
echo ""
echo "[7/7] 执行数据库迁移和种子..."
npm run db:migrate
npm run db:seed

echo ""
echo "=== 初始化完成 ==="
echo ""
echo "启动后端：npm run dev:server"
echo "启动前端：npm run dev:web"
echo "Swagger：http://localhost:3000/api/docs"
echo "默认账号：admin / admin123"
