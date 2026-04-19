# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY  ./.next/standalone ./
COPY  ./.next/static ./.next/static
COPY  ./public ./public

# 环境
ENV NODE_ENV=production

# 指定端口为 91（和EXPOSE一致，否则监听3000端口冲突/失败）
ENV PORT=91
EXPOSE 91
CMD ["node", "server.js"]