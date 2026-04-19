# ======================
# 阶段 1：构建（pnpm）
# ======================
FROM node:20-alpine AS builder
WORKDIR /app

# 启用 corepack 自动安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件（Docker 缓存优化）
COPY package*.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目源码
COPY . .

# 核心修复：构建时跳过数据库初始化
ENV SKIP_DB_INIT=true

# 生产环境
ENV NODE_ENV production

# 构建 Next 项目
RUN pnpm run build

# ======================
# 阶段 2：生产运行
# ======================
FROM node:20-alpine AS runner
WORKDIR /app

# 生产环境
ENV NODE_ENV production

# 复制构建产物（最小化文件）
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 非 root 运行（安全）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Next 默认端口
EXPOSE 91

# 启动服务
CMD ["node", "server.js"]