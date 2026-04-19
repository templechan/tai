# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./public ./public

# 强制开启 WASM 模式（纯JS运行AI，无系统依赖）
ENV TRANSFORMERS_WASM=1
# 禁用原生 onnxruntime 加载
ENV TRANSFORMERS_NO_LOCAL_RUNTIME=1

ENV NODE_ENV=production
ENV PORT=91
# EXPOSE 3000

CMD ["node", "server.js"]