# ======================
# 阶段 1：构建阶段（slim 镜像 + 安装系统依赖）
# ======================
FROM node:20-slim AS builder
WORKDIR /app

# 🔥 核心修复：安装 sharp / AI 模块必需的系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libvips-dev \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package*.json pnpm-lock.yaml* ./

# 安装依赖 + 强制重新编译 sharp
RUN pnpm install --frozen-lockfile
RUN pnpm rebuild sharp  # 🔥 强制编译sharp，修复二进制缺失

# 复制源码
COPY . .

# 构建时跳过数据库初始化
ENV SKIP_DB_INIT=true
ENV NODE_ENV=production

# 构建 Next 项目
RUN pnpm run build

# ======================
# 阶段 2：运行阶段（轻量化，仅保留运行依赖）
# ======================
FROM node:20-slim AS runner
WORKDIR /app

# 安装运行时必需的轻量依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libvips \
    && rm -rf /var/lib/apt/lists/*

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

EXPOSE 91
CMD ["node", "server.js"]