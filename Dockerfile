# ======================
# 构建阶段：无编译，极速构建
# ======================
FROM node:20-slim AS builder
WORKDIR /app

# 仅安装最基础依赖，不装任何编译工具（核心提速！）
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# 启用pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY package*.json pnpm-lock.yaml* ./
# 🔥 关键：禁止自动编译原生模块，用预编译版本
RUN pnpm install --frozen-lockfile --ignore-scripts

# 复制代码
COPY . .

# 构建配置
ENV SKIP_DB_INIT=true
ENV NODE_ENV=production
RUN pnpm run build

# ======================
# 运行阶段：超轻量，无编译
# ======================
FROM node:20-slim AS runner
WORKDIR /app

# 仅安装运行必需的最小库，秒装完成
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libvips \
    && rm -rf /var/lib/apt/lists/*

# 生产环境
ENV NODE_ENV production

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static

# 安全用户
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs
USER nextjs

WORKDIR /app/standalone
EXPOSE 3000
CMD ["node", "server.js"]