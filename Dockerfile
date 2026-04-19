# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./public ./public

# 安装缺失的 libonnxruntime.so.1.14.0
RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && wget https://github.com/microsoft/onnxruntime/releases/download/v1.14.0/libonnxruntime-linux-x64-1.14.0.tgz \
    && tar -zxvf libonnxruntime-linux-x64-1.14.0.tgz \
    && cp libonnxruntime-linux-x64-1.14.0/lib/libonnxruntime.so.1.14.0 /usr/local/lib/ \
    && ldconfig \
    && rm -rf libonnxruntime-linux-x64-1.14.0* \
    && apt-get purge -y wget && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=91
# EXPOSE 3000

CMD ["node", "server.js"]