# 运行阶段
FROM node:20-slim
WORKDIR /app

COPY  ./public ./public
COPY  ./.next/standalone ./

# 环境
ENV NODE_ENV=production

EXPOSE 91
CMD ["node", "server.js"]