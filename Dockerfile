# 🔥 极简版：无任何系统安装，秒构建，永不SSH超时
FROM node:20-alpine AS builder
WORKDIR /app

# 仅启用pnpm，无任何下载
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖，跳过所有编译脚本（关键！不编译、不下载）
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# 构建配置
ENV SKIP_DB_INIT=true
ENV NODE_ENV=production
RUN pnpm run build

# 运行阶段：纯空镜像，无任何操作
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]