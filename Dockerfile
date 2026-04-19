# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./public ./public

# 双加速：阿里云源 + 国内GH代理，安装缺失的onnx运行库
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y --no-install-recommends wget && \
    wget https://ghproxy.net/https://github.com/microsoft/onnxruntime/releases/download/v1.14.0/libonnxruntime-linux-x64-1.14.0.tgz && \
    tar -zxvf libonnxruntime-linux-x64-1.14.0.tgz && \
    cp libonnxruntime-linux-x64-1.14.0/lib/libonnxruntime.so.1.14.0 /usr/local/lib/ && \
    ldconfig && \
    rm -rf libonnxruntime-linux-x64-1.14.0* && \
    apt-get purge -y wget && apt-get autoremove -y && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=91
# EXPOSE 3000

CMD ["node", "server.js"]