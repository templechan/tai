# ======================
# 阶段 1：构建（替换为 slim，兼容 glibc）
# ======================
FROM node:20-slim AS builder
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖
COPY package*.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建时跳过数据库初始化
ENV SKIP_DB_INIT=true
ENV NODE_ENV=production

# 构建项目
RUN pnpm run build

# ======================
# 阶段 2：运行（同样用 slim）
# ======================
FROM node:20-slim AS runner
WORKDIR /app

# 生产环境
ENV NODE_ENV production

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 安全运行
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]