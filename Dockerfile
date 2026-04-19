# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./public ./public

# 安装缺失的 libonnxruntime.so.1.14.0
RUN # 1. 替换为阿里云镜像源（国内最快）
    sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources \
    # 2. 更新软件源 + 安装下载工具
    && apt-get update && apt-get install -y --no-install-recommends wget \
    # 3. 🔥 国内加速下载缺失的onnx库（核心提速！）
    && wget https://ghproxy.net/https://github.com/microsoft/onnxruntime/releases/download/v1.14.0/libonnxruntime-linux-x64-1.14.0.tgz \
    # 4. 解压文件
    && tar -zxvf libonnxruntime-linux-x64-1.14.0.tgz \
    # 5. 复制库文件到系统目录
    && cp libonnxruntime-linux-x64-1.14.0/lib/libonnxruntime.so.1.14.0 /usr/local/lib/ \
    # 6. 刷新系统库缓存
    && ldconfig \
    # 7. 清理安装包
    && rm -rf libonnxruntime-linux-x64-1.14.0* \
    # 8. 清理垃圾，缩小镜像
    && apt-get purge -y wget && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=91
# EXPOSE 3000

CMD ["node", "server.js"]