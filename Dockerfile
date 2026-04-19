# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./public ./public

# 替换国内阿里云apt源，加速依赖下载
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

# 安装 onnxruntime 所有依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libstdc++6 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=91
# EXPOSE 3000

CMD ["node", "server.js"]