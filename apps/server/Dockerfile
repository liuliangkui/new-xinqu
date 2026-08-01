# 阶段一：依赖安装与构建
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY apps/server ./apps/server

RUN npm run build -w apps/server

# 阶段二：运行镜像
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY apps/server/prisma ./apps/server/prisma
RUN npx prisma generate --schema=apps/server/prisma/schema.prisma

COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 3000

CMD ["node", "apps/server/dist/main"]
