# 阶段一：依赖安装与构建
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# 阶段二：运行镜像
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
