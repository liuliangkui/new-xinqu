#!/bin/bash
# XQCOP 工作区自动备份脚本
# 用途：终端崩溃/换电脑前快速保存当前未提交的工作

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
STASH_MSG="auto-backup-${TIMESTAMP}"

echo "=== XQCOP 工作区备份 ==="

# 检查是否有未提交的更改
if git diff --quiet && git diff --cached --quiet; then
  echo "工作区干净，无需备份"
  exit 0
fi

# 自动 stash 当前工作区
echo "发现未提交更改，正在创建 stash: ${STASH_MSG}"
git stash push -m "${STASH_MSG}" --include-untracked

echo "✅ 已保存到 stash"
echo ""
echo "查看 stash 列表：git stash list"
echo "恢复工作区：git stash pop"
