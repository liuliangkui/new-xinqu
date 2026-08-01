# CI 配置备份

由于当前 GitHub OAuth 授权缺少 `workflow` scope，无法通过命令行提交 `.github/workflows/ci.yml`。

请按以下步骤手动创建：

1. 打开 GitHub 仓库：`https://github.com/liuliangkui/new-xinqu`
2. 进入 **Actions** → **New workflow** → **set up a workflow yourself**
3. 文件路径填：`.github/workflows/ci.yml`
4. 把下面内容粘贴进去，提交

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Lint server
        run: npm run lint:server

      - name: Build server
        run: npm run build:server

      - name: Test server
        run: npm run test:server

      - name: Build web
        run: npm run build:web

      - name: Test web
        run: npm run test:web
```

## 授权问题彻底解决

如果想让命令行也能提交 workflow，需要给当前 GitHub 应用/OAuth Token 增加 `workflow` scope：

1. 访问 GitHub Settings → Applications
2. 找到当前使用的应用/Token
3. 勾选 `workflow` 权限
4. 重新授权
