#!/bin/bash
# XQCOP 数据库备份脚本
# 用途：定期备份 PostgreSQL 数据，防止容器/硬盘故障导致数据丢失

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/xqcop-${TIMESTAMP}.sql"

# 读取 .env 中的数据库配置
DB_USER=$(grep '^DB_USER=' .env | cut -d '=' -f2 | tr -d '"')
DB_NAME=$(grep '^DB_NAME=' .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$DB_USER" ]; then
  DB_USER="xqcop"
fi
if [ -z "$DB_NAME" ]; then
  DB_NAME="xqcop"
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "=== XQCOP 数据库备份 ==="
echo "数据库: $DB_NAME"
echo "备份文件: $BACKUP_FILE"

# 执行备份
if docker ps | grep -q xqcop-postgres; then
  docker exec xqcop-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
  echo "✅ 备份成功"
else
  echo "❌ PostgreSQL 容器未运行，请先执行 docker-compose up -d postgres"
  exit 1
fi

# 保留最近 7 天的备份
find "$BACKUP_DIR" -name 'xqcop-*.sql' -type f -mtime +7 -delete

echo ""
echo "最近 5 个备份："
ls -lt "$BACKUP_DIR"/*.sql | head -5
