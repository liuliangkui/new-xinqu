#!/bin/bash
# 鑫渠高保真原型一键预览脚本
# 用法：./scripts/preview-prototype.sh

set -e

# 切换到项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

PROJECT_ROOT="$(pwd)"
PORT=8080
PROTOTYPE_URL="http://localhost:${PORT}/鑫渠高保真原型.html"

# 检查端口是否已占用
if ! lsof -i :${PORT} > /dev/null 2>&1; then
  echo "🚀 启动本地预览服务（端口 ${PORT}）..."
  python3 -m http.server ${PORT} > /dev/null 2>&1 &
  # 等待服务启动
  for i in {1..10}; do
    if lsof -i :${PORT} > /dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
else
  echo "✅ 本地预览服务已在运行"
fi

# 打开浏览器
echo "🌐 打开原型：${PROTOTYPE_URL}"
open "${PROTOTYPE_URL}"
