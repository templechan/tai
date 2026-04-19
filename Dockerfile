# ======================
# 🔥 用回 alpine：体积最小、无apt下载、秒构建
# ======================
FROM node:20-alpine AS builder
WORKDIR /app

# 仅安装兼容AI/sharp的极小依赖（国内秒下）
RUN apk add --no-cache libc6-compat vips

# 启用pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖 + 跳过编译脚本
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制代码
COPY . .

# 构建配置
ENV SKIP_DB_INIT=true
ENV NODE_ENV=production
RUN pnpm run build

# ======================
# 运行阶段：纯alpine，无任何下载
# ======================
FROM node:20-alpine AS runner
WORKDIR /app

# 安装运行时极小依赖（秒装）
RUN apk add --no-cache libc6-compat vips

# 生产环境
ENV NODE_ENV production

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 安全用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001 -G nodejs
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]