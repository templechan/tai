# 构建 Next BFF 级 AI 助手 - T.AI

<br />

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6} -->

<!-- code_chunk_output -->

- [构建 Next BFF 级 AI 助手 - T.AI](#构建-next-bff-级-ai-助手---tai)
  - [1 项目预览](#1-项目预览)
  - [2 技术选型](#2-技术选型)
  - [2 项目开发](#2-项目开发)
    - [2.1 项目初始化](#21-项目初始化)
      - [2.1.1 配置优化](#211-配置优化)
        - [2.1.1.1 项目依赖与脚本配置](#2111-项目依赖与脚本配置)
        - [2.1.1.2 Next 核心配置](#2112-next-核心配置)
        - [2.1.1.3 TypeScript 编译配置](#2113-typescript-编译配置)
        - [2.1.1.4 ESLint 代码规范配置](#2114-eslint-代码规范配置)
          - [2.1.1.4.1 集成代码格式化插件 prettier](#21141-集成代码格式化插件-prettier)
          - [2.1.1.4.2 Git 提交格式化配置](#21142-git-提交格式化配置)
        - [2.1.1.5 pnpm 工作区配置](#2115-pnpm-工作区配置)
        - [2.1.1.6 解除 pnpm 警告](#2116-解除-pnpm-警告)
    - [2.2 UI 开发](#22-ui-开发)
      - [2.2.1 安装依赖](#221-安装依赖)
      - [2.2.2 全局样式](#222-全局样式)
      - [2.2.3 布局相关](#223-布局相关)
        - [2.2.3.1 根布局组件](#2231-根布局组件)
        - [2.2.3.2 基础布局组件](#2232-基础布局组件)
      - [2.2.4 基础相关](#224-基础相关)
        - [2.2.4.1 通用弹窗组件](#2241-通用弹窗组件)
        - [2.2.4.2 文档预览组件](#2242-文档预览组件)
      - [2.2.5 侧边栏相关](#225-侧边栏相关)
        - [2.2.5.1 侧边栏组件](#2251-侧边栏组件)
        - [2.2.5.2 侧边栏组件 (移动端)](#2252-侧边栏组件-移动端)
        - [2.2.5.3 会话列表组件](#2253-会话列表组件)
          - [2.2.5.3.1 会话列表 Hook 组件](#22531-会话列表-hook-组件)
      - [2.2.6 会话相关](#226-会话相关)
        - [2.2.6.1 会话标题组件](#2261-会话标题组件)
        - [2.2.6.2 会话内容组件](#2262-会话内容组件)
        - [2.2.6.3 会话聊天框相关](#2263-会话聊天框相关)
          - [2.2.6.3.1 会话聊天框组件](#22631-会话聊天框组件)
          - [2.2.6.3.2 输入框组件](#22632-输入框组件)
          - [2.2.6.3.3 文件上传按钮组件](#22633-文件上传按钮组件)
          - [2.2.6.3.4 文件上传按钮 Hook 组件](#22634-文件上传按钮-hook-组件)
          - [2.2.6.3.5 文件列表展示组件](#22635-文件列表展示组件)
          - [2.2.6.3.6 模型选择组件](#22636-模型选择组件)
          - [2.2.6.3.7 发送按钮组件](#22637-发送按钮组件)
        - [2.2.6.4 前端文档解析工具封装](#2264-前端文档解析工具封装)
      - [2.2.7 页面相关](#227-页面相关)
        - [2.2.7.1 首页页面组件](#2271-首页页面组件)
        - [2.2.7.2 会话页面组件](#2272-会话页面组件)
          - [2.2.7.2.1 会话页面 Hook 组件](#22721-会话页面-hook-组件)
      - [2.2.8 通用工具](#228-通用工具)
    - [2.3 数据管理](#23-数据管理)
      - [2.3.1 安装依赖](#231-安装依赖)
      - [2.3.2 客户端全局应用常量](#232-客户端全局应用常量)
      - [2.3.3 客户端全局 TS 类型](#233-客户端全局-ts-类型)
      - [2.3.4 状态封装](#234-状态封装)
        - [2.3.4.1 通用状态](#2341-通用状态)
        - [2.3.4.2 模型状态](#2342-模型状态)
        - [2.3.4.4 会话请求状态](#2344-会话请求状态)
      - [2.3.5 客户端请求工具封装](#235-客户端请求工具封装)
      - [2.3.6 客户端服务层封装](#236-客户端服务层封装)
        - [2.3.6.1 模型列表服务层](#2361-模型列表服务层)
        - [2.3.6.2 会话列表服务层](#2362-会话列表服务层)
        - [2.3.6.3 会话请求服务层](#2363-会话请求服务层)
      - [2.3.7 SWR Hook 组件](#237-swr-hook-组件)
    - [2.4 BFF 开发](#24-bff-开发)
      - [2.4.1 BFF 全局应用常量](#241-bff-全局应用常量)
      - [2.4.2 BFF 全局 TS 类型](#242-bff-全局-ts-类型)
      - [2.4.3 数据库初始化](#243-数据库初始化)
        - [2.4.3.1 安装依赖](#2431-安装依赖)
          - [2.4.3.1.1 PostgreSQL 数据库安装](#24311-postgresql-数据库安装)
          - [2.4.3.1.2 数据库代码连接依赖安装](#24312-数据库代码连接依赖安装)
        - [2.4.3.2 模型配置文件](#2432-模型配置文件)
        - [2.4.3.3 数据库初始化脚本](#2433-数据库初始化脚本)
      - [2.4.4 BFF 请求工具封装](#244-bff-请求工具封装)
      - [2.4.5 BFF 接口异常处理工具封装](#245-bff-接口异常处理工具封装)
      - [2.4.6 API 开发](#246-api-开发)
        - [2.4.6.1 BFF 模型列表接口](#2461-bff-模型列表接口)
        - [2.4.6.2 BFF 会话列表接口](#2462-bff-会话列表接口)
        - [2.4.6.3 BFF 会话聊天接口](#2463-bff-会话聊天接口)
      - [2.4.7 BFF 服务层封装](#247-bff-服务层封装)
        - [2.4.7.1 BFF 模型列表服务层](#2471-bff-模型列表服务层)
        - [2.4.7.2 BFF 会话列表服务层](#2472-bff-会话列表服务层)
        - [2.4.7.3 BFF 会话请求服务层](#2473-bff-会话请求服务层)
          - [2.4.7.3.1 RAG 工具封装](#24731-rag-工具封装)
          - [2.4.7.3.2 大模型流式响应解析器工厂](#24732-大模型流式响应解析器工厂)
      - [2.4.8 BFF 通用工具](#248-bff-通用工具)
    - [2.5 自动化部署](#25-自动化部署)
      - [2.5.1 CI/CD 脚本](#251-cicd-脚本)
      - [2.5.2 部署脚本](#252-部署脚本)
      - [2.5.3 Docker 文件](#253-docker-文件)

<!-- /code_chunk_output -->

## 1 项目预览

- AI 助手在线地址：<a href="https://tai.templechann.com" target="_blank">`https://tai.templechann.com`</a>

## 2 技术选型

> 本项目采用的技术点版本，除了兼容性考虑外，都采用最新版，使用 pnpm-lock.yaml 保证协同一致性。

<div class="table-wrapper">
<table class="markdown-table">
  <thead>
    <tr>
      <th></th>
      <th>技术点</th>
      <th>版本</th>
      <th>生产优势</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>基础环境</td>
      <td>Git、Node.js、NVM、PNPM</td>
      <td>git 2.53.0.2<br />node.js 24.14.1<br />nvm 1.2.2.0<br />pnpm 10.33.0</td>
      <td>🔹Git：版本控制，多人协作<br />🔹NVM：Node.js 多版本管理器<br />🔹Node.js：JS 运行环境，前端全栈基础设施<br />🔹PNPM：高性能的 NPM（Node.js 的包管理器）</td>
    </tr>
    <tr>
      <td>UI设计</td>
      <td>参考 DeepSeek、字节豆包、阿里千问 的 Web 端、移动端</td>
      <td>最新</td>
      <td>🔹市场已验证，符合用户习惯</td>
    </tr>
    <tr>
      <td>前端框架</td>
      <td>React、Next.js、create-next-app</td>
      <td>react 19.2.4<br />next 16.2.3<br />create-next-app 16.2.3</td>
      <td>🔹React：前端主流框架，生态强大，大厂标准<br />🔹Next.js：React 的全栈增强框架，解决 SEO、首屏慢、路由麻烦、接口分离等痛点<br />🔹create-next-app：Next.js 的脚手架，一键搭建标准化的项目结构</td>
    </tr>
    <tr>
      <td>UI</td>
      <td>Tailwind CSS、shadcn/ui、lucide-react、sonner</td>
      <td>tailwindcss ^4<br />shadcn ^4.2.0<br />lucide-react ^1.8.0<br />sonner ^2.0.7</td>
      <td>🔹Tailwind CSS：CSS 原子化样式工具类框架，快速写页面样式，简化响应式布局<br />🔹shadcn/ui：基于 Tailwind CSS 的高质量可定制组件库<br />🔹lucide-react：React 专用的图标库，轻量<br />🔹sonner：轻量提示组件，官方推荐</td>
    </tr>
    <tr>
      <td>数据管理</td>
      <td>Zustand、SWR、fetch</td>
      <td>zustand ^5.0.12<br />swr ^2.4.1</td>
      <td>🔹Zustand：前端全局状态存取，轻量<br />🔹SWR：后端数据调度，负责统一管理服务层接口，实现数据自动缓存、刷新、重试等，轻量</td>
    </tr>
    <tr>
      <td>文档解析</td>
      <td>FileReader、mammoth、pdfjs-dist</td>
      <td>mammoth ^1.12.0<br />pdfjs-dist ^5.6.205</td>
      <td>🔹mammoth：纯前端解析 .docx 文档的库<br />🔹pdfjs-dist：纯前端解析 .pdf 文件的库</td>
    </tr>
    <tr>
      <td>RAG技术</td>
      <td>@langchain/core、@langchain/textsplitters、@xenova/transformers、pg</td>
      <td>@langchain/core ^1.1.39<br />@langchain/textsplitters ^1.0.1<br />@xenova/transformers ^2.17.2<br />pg^8.20.0</td>
      <td>🔹@langchain/core：RAG 流程调度核心，负责把 文档读取 → 分块 → 向量化 → 检索 → 提示词 → 大模型回答，串成一条完整流水线。<br />🔹@langchain/textsplitters：文档分块，切割后送入 embedding 模型<br />🔹@xenova/transformers：纯 JS 本地跑 AI 模型，负责向量生成、向量检索、问题分类等<br /><br />当前项目使用的模型有：<br />🔹Xenova/all-MiniLM-L6-v2：嵌入模型，负责向量生成、检索，轻量超快<br />🔹Xenova/distilbert-base-uncased-mnli：分类模型，负责用户意图识别，超轻量蒸馏模型</td>
    </tr>
    <tr>
      <td>后端框架</td>
      <td>Next API Routes</td>
      <td>Next.js 内置的后端接口能力</td>
      <td>🔹Next API Routes：提供接口能力，信息安全隔离，支持边缘化</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>PostgreSQL、pgvector</td>
      <td>PostgreSQL 18<br />pgvector：是 PostgreSQL 的向量插件</td>
      <td>🔹PostgreSQL：世界上最稳定、最强大的开源数据库 🐶，高一致性，适合复杂分析等<br />🔹pgvector：负责把 Xenova 模型生成的向量存进数据库，使用用户问题生产的向量去检索数据库中相似的文档片段</td>
    </tr>
    <tr>
      <td>第三方工具</td>
      <td>dayjs、uuid</td>
      <td>dayjs ^1.11.20<br />uuid ^13.0.0</td>
      <td>🔹dayjs：轻量级时间日期处理库<br />🔹uuid：唯一 ID 生成库</td>
    </tr>
    <tr>
      <td>工程化</td>
      <td>TypeScript、ESLint、Prettier、Husky、lint-staged、Turbopack</td>
      <td>typescript ^5<br />eslint ^9<br />prettier ^3.8.1<br />husky ^9.1.7<br />lint-staged ^16.4.0<br />Turbopack：Next.js 16.2.3 已全面默认的打包工具</td>
      <td>🔹TypeScript：给 JS 加类型，防止 BUG，更安全<br />🔹ESLint：检查代码语法错误、不规范写法<br />🔹Prettier：自动格式化代码，统一风格<br />🔹Husky：Git 提交钩子，拦截不合格代码<br />🔹lint-staged：只检查本次修改的文件，速度飞快<br />🔹Turbopack：由 Vercel 官方开发的下一代 JavaScript 打包工具，比 webpack 快 10～100 倍，比 Vite 快 5～20 倍，兼容 webpack</td>
    </tr>
    <tr>
      <td>自动化部署</td>
      <td>Docker、Nginx、GitHub Actions</td>
      <td>Docker 29.1.3<br />Nginx 1.24.0</td>
      <td>🔹Docker：容器化，环境统一，跨平台<br />🔹Nginx：高性能 Web 服务器，提供反向代理，解决跨域，SSL证书配置等功能<br />🔹GitHub Actions：CI/CD 自动化部署</td>
    </tr>
    <tr>
      <td>边缘部署</td>
      <td>Vercel、Vercel Postgres</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>
</div>
 
## 2 项目开发

### 2.1 项目初始化

```shell
# 进入项目的父目录
cd /d D:\dev\workspace

# 创建并初始化项目
pnpm create next-app@latest nextbff-ai-assistant --ts --eslint --react-compiler --tailwind --src-dir --app --import-alias "@/*" --no-agents-md

# .../19d71cb1a2a-1af40                    |   +1 +
# .../19d71cb1a2a-1af40                    | Progress: resolved 1, reused 0, downloaded 1, added 1, done
# Creating a new Next.js app in D:\dev\workspace\nextbff-ai-assistant.

# Using pnpm.

# Initializing project with template: app-tw


# Installing dependencies:
# - next
# - react
# - react-dom

# Installing devDependencies:
# - @tailwindcss/postcss
# - @types/node
# - @types/react
# - @types/react-dom
# - babel-plugin-react-compiler
# - eslint
# - eslint-config-next
# - tailwindcss
# - typescript

#  WARN  Request took 11474ms: https://registry.npmjs.org/next
# Downloading next@16.2.3: 33.99 MB/33.99 MB, done
# Packages: +350
# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
# Downloading @next/swc-win32-x64-msvc@16.2.3: 43.69 MB/43.69 MB, done
# Progress: resolved 424, reused 348, downloaded 7, added 350, done

# dependencies:
# + next 16.2.3
# + react 19.2.4
# + react-dom 19.2.4

# devDependencies:
# + @tailwindcss/postcss 4.2.2
# + @types/node 20.19.39 (25.5.2 is available)
# + @types/react 19.2.14
# + @types/react-dom 19.2.3
# + babel-plugin-react-compiler 1.0.0
# + eslint 9.39.4 (10.2.0 is available)
# + eslint-config-next 16.2.3
# + tailwindcss 4.2.2
# + typescript 5.9.3 (6.0.2 is available)

# Done in 2m 24.7s using pnpm v10.33.0

# Generating route types...
# ✓ Types generated successfully

# Initialized a git repository.

# Success! Created nextbff-ai-assistant at D:\dev\workspace\nextbff-ai-assistant


# 进入项目目录
cd .\nextbff-ai-assistant
```

#### 2.1.1 配置优化

##### 2.1.1.1 项目依赖与脚本配置

`/package.json`：添加生产环境脚本、清理缓存脚本、TS 类型检查脚本、代码格式检查脚本 等

```shell
# 清理缓存脚本依赖 rimraf
# rimraf 是一个跨平台的 Node.js 工具,可以在 Windows、macOS 和 Linux 上正常工作,完美替代 Unix 的 rm -rf 命令
pnpm add -D rimraf
```

```json
{
  // ... existing code ...
  // 生产环境脚本
  "prod": "pnpm build && pnpm start",
  // 清理缓存脚本
  "clean": "pnpm store prune --force && rimraf pnpm-lock.yaml node_modules .next",

  // TS 类型 检查脚本
  "type:check": "tsc --noEmit",
  // 代码规范 检查脚本
  "lint:check": "eslint",
  // 代码格式 检查脚本
  "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,scss}\"",

  // 自动修复 ESLint 问题（包括 Prettier）
  "lint:fix": "eslint . --fix",
  // 代码格式化脚本
  "format:fix": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,scss}\"",

  // 三合一检查脚本
  "check-all": "pnpm type:check && pnpm lint:check && pnpm format:check",
  // 二合一修复脚本
  "fix-all": "pnpm lint:fix && pnpm format:fix"
}
```

##### 2.1.1.2 Next 核心配置

`/next.config.ts`：添加安全配置等

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 启用生产轻量化构建，支持 API Route
    output: "standalone",

    // 关闭 React 严格模式（临时解决开发模式下 useEffect 执行两次）
    reactStrictMode: false,

    // 开启 React 官方自动优化编译器
    // 自动帮你做 useMemo/useCallback 优化，提升页面渲染流畅度，无需手写优化 Hooks
    reactCompiler: true,

    // 开启输出压缩（Next 高版本默认已开启，显式声明更稳妥）
    // 启用 Gzip/Brotli 压缩，减小静态资源（JS/CSS/HTML）体积，加快页面加载速度
    compress: true,

    // 禁用 x-powered-by 头（安全最佳实践）
    // 隐藏响应头里的 X-Powered-By: Next.js，不让攻击者知道你的技术栈，提升网站安全性
    poweredByHeader: false,

    // 允许整个局域网访问开发服务，方便调试移动端，不然移动访问时事件等无法水合过去
    allowedDevOrigins: ["192.168.1.*"],

    // 配置网站安全头部
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    // 开启 DNS 预解析，加快页面加载
                    { key: "X-DNS-Prefetch-Control", value: "on" },
                    // 强制浏览器用 HTTPS 访问，防止网络劫持
                    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                ],
            },
        ];
    },
};

export default nextConfig;
```

##### 2.1.1.3 TypeScript 编译配置

`/tsconfig.json`：添加更严格的类型检查选项（已注释，按需配置）

```json
{
    "compilerOptions": {
        "target": "ES2017", // 目标 ECMAScript 版本
        "lib": ["dom", "dom.iterable", "esnext"], // 包含浏览器环境类型
        "allowJs": true, // 允许导入 JS 文件
        "skipLibCheck": true, // 跳过声明文件检查（加速编译）
        "strict": true, // 启用严格模式
        "noEmit": true, // 不输出 JS 文件（Next.js 处理）
        "esModuleInterop": true, // 兼容 CommonJS/ESM
        "module": "esnext", // 使用最新模块系统
        "moduleResolution": "bundler", // 现代打包工具解析策略
        "resolveJsonModule": true, // 允许导入 JSON
        "isolatedModules": true, // 每个文件独立编译
        "jsx": "react-jsx", // 使用新的 JSX 转换
        "incremental": true, // 增量编译（加速）
        // "noUnusedLocals": true,  // 报告未使用的局部变量
        // "noUnusedParameters": true,  // 报告未使用的参数
        // "exactOptionalPropertyTypes": true,  // 严格可选属性类型
        // "noImplicitReturns": true,  // 确保所有代码路径都有返回值
        // "noFallthroughCasesInSwitch": true,  // 禁止 switch case 穿透
        // "forceConsistentCasingInFileNames": true,  // 强制文件名大小写一致
        "plugins": [
            {
                "name": "next"
            }
        ],
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
    "exclude": ["node_modules"]
}
```

##### 2.1.1.4 ESLint 代码规范配置

`/eslint.config.mjs`：添加更多自定义规则（已注释，按需配置）

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-plugin-prettier/recommended"; // 添加这行

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier, // 集成代码格式化插件 prettier，需要添加这行，必须在最后
    {
        rules: {
            "prettier/prettier": "error", // 将 Prettier 问题视为错误（可选）
            "max-lines": [
                "error",
                {
                    // 单个文件最大行数（默认 300 行，超了报错）
                    max: 300, // 文件最大行数
                    skipBlankLines: true, // 忽略空行
                    skipComments: true, // 忽略注释
                },
            ],
            // 允许使用 any 类型（极少数时候会用到，关闭报错）
            "@typescript-eslint/no-explicit-any": "off",
            // 关闭 原生JS 未使用表达式警告（比如用了 map 但不接收返回值，纯粹遍历）
            "no-unused-expressions": "off",
            // 关闭 TypeScript 未使用表达式警告
            "@typescript-eslint/no-unused-expressions": "off",
            // 全局关闭 React Hook 依赖项警告（永远不提示）
            "react-hooks/exhaustive-deps": "off",
            // // 禁止 console.log（生产环境）
            // 'no-console': ['warn', { allow: ['warn', 'error'] }],

            // // 强制使用箭头函数
            // 'prefer-arrow-callback': 'error',

            // // 强制 const 而非 let
            // 'prefer-const': 'error',

            // // 禁止未使用的变量
            // '@typescript-eslint/no-unused-vars': ['error', {
            //   argsIgnorePattern: '^_',
            //   varsIgnorePattern: '^_'
            // }],
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "node_modules/**",
        "public/**",
        "tmp/**",
    ]),
]);

export default eslintConfig;
```

###### 2.1.1.4.1 集成代码格式化插件 prettier

> 下面是代码内集成方式，保证项目所有人统一格式。

> 如果只是自己使用的话，可以安装 VS Code 的插件 Prettier - Code formatter：
> - 可以设置保存自动格式化，然后设置默认格式化工具为 prettier
> - 最后去插件配置里设置相关配置路径 `.prettierrc` 和 `.prettierignore` 即可
  
```shell
pnpm install -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss prettier-plugin-import-sort import-sort-style-module

# prettier：核心格式化工具
# eslint-config-prettier：会自动禁用所有与 Prettier 冲突的 ESLint 规则
# eslint-plugin-prettier：会将 Prettier 格式问题作为 ESLint 错误报告
# prettier-plugin-tailwindcss：会自动排序 Tailwind CSS 类名，非常有用！！


# 关于导入的排序，由于 相关排序插件 和 Tailwind CSS 类名排序插件不兼容，目前暂时使用手动排序：

"use client";

// ==================== 根布局组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //
```

创建 Prettier 配置文件：`/.prettierrc`
 
```json
{
  "semi": true, // 强制使用分号
  "trailingComma": "all", // 强制使用尾随逗号
  "singleQuote": false, // 禁用单引号
  "printWidth": 9999, // 自动换行长度
  "tabWidth": 4, // 缩进 4 个空格
  "useTabs": false, // 禁用制表符
  "bracketSpacing": true, // 对象括号前后加空格
  "arrowParens": "always", // 箭头函数参数使用括号
  "endOfLine": "lf", // 换行符类型，使用 lf
  // 其他可选值：
  // "crlf" - Windows 风格 (\r\n)
  // "cr"   - 旧 Mac 风格 (\r)
  // "auto" - 根据文件内容自动检测
  // 建议："lf" - 跨平台兼容性最好（Git 可以处理转换）
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

创建 .prettierignore 文件：`/.prettierignore`

```
# Dependencies
node_modules

# Build outputs
.next
out
build
dist

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment files
.env*

# IDE
.vscode
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Generated files
next-env.d.ts
*.tsbuildinfo

# Lock files (保持原样)
pnpm-lock.yaml
package-lock.json
yarn.lock

# Public assets (通常不需要格式化)
public/*.svg
public/*.png
public/*.jpg

# 禁止格式化 Markdown 文件
*.md

# 禁止格式化 shadcn/ui 原子组件
src/components/ui

tmp
```

###### 2.1.1.4.2 Git 提交格式化配置

使用 Husky + lint-staged 在提交前自动格式化：

```shell
pnpm add -D husky lint-staged
pnpm exec husky init
```

会自动创建 `/.husky/pre-commit` 文件，修改为：

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

在 `/package.json` 中添加 lint-staged 配置：

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss}": [
      "prettier --write"
    ]
  } 
}
```


##### 2.1.1.5 pnpm 工作区配置

`/pnpm-workspace.yaml`： 当前项目并非 monorepo 单体仓库，不需要 workspace 配置。ignoredBuiltDependencies 用于跳过某些包的安装后构建步骤，但是项目需要这些包，应删除此文件。

```yaml
ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

##### 2.1.1.6 解除 pnpm 警告

> 项目开发过程中，如果遇到一些包安装的错误，可以运行 `pnpm approve-builds` 检查试试。

```shell
# 项目开发前，先清空下缓存，安装依赖
pnpm clean && pnpm install
# 会提示：
# ╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
# │                                                                                            │
# │   Ignored build scripts: sharp@0.34.5, unrs-resolver@1.11.1.                               │
# │   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
# │                                                                                            │
# ╰────────────────────────────────────────────────────────────────────────────────────────────╯
# 原因：pnpm 自身的安全控制，导致 sharp、unrs-resolver 等包无法安装，但是项目需要这些包
# 解除警告，进行安装
pnpm approve-builds
# 按 a键 全选，然后回车，按 y 键，安装完毕即可
```





### 2.2 UI 开发

> 组件开发原则：每个组件尽量控制在 300行 以内（通过ESLint可检查），职责要分离清晰，便于维护
> - 页面组件：尽量只用来 调用各子组件 和 布局。
> - 业务组件：
>   - JSX 里面除了只有1行代码的的函数，都要抽出来。
>   - 业务逻辑较多，或可复用的，都应该把业务抽成对应的 Hook。

#### 2.2.1 安装依赖

```shell
# 安装组件库 shadcn/ui（自带图标库 lucide-react）
pnpm dlx shadcn@latest init --base radix --preset nova
# 安装轻量级全局提示容器 sonner（shadcn/ui 官方推荐）
pnpm install sonner
# 安装文档解析依赖
pnpm install mammoth pdfjs-dist
# 安装需要的工具
pnpm install uuid dayjs

# 按需添加组件
pnpm dlx shadcn@latest add button-group button dialog drawer dropdown-menu input select separator textarea tooltip
```

#### 2.2.2 全局样式

`/src/app/globals.css`：

```css
/* ==================== 全局样式 ==================== */

@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --font-sans: var(--font-sans);
    --font-mono: var(--font-geist-mono);
    --font-heading: var(--font-sans);
    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);
    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);
    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --radius-2xl: calc(var(--radius) * 1.8);
    --radius-3xl: calc(var(--radius) * 2.2);
    --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --radius: 0.625rem;
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.708 0 0);
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.87 0 0);
    --chart-2: oklch(0.556 0 0);
    --chart-3: oklch(0.439 0 0);
    --chart-4: oklch(0.371 0 0);
    --chart-5: oklch(0.269 0 0);
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.488 0.243 264.376);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
    * {
        @apply border-border outline-ring/50;
    }

    body {
        @apply bg-background text-foreground;
    }

    html {
        @apply font-sans;
    }
}

/* ==================== 全局美化滚动条 ==================== */
/* 滚动条宽度 */
::-webkit-scrollbar {
    /* 垂直滚动条宽度 */
    width: 4px;
    /* 水平滚动条高度 */
    height: 4px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
    background: #94a3b880;
    border-radius: 999px;
    /* hover 平滑过渡 */
    transition: all 0.2s ease;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
    background: #f8fafc80;
    border-radius: 999px;
}

/* 滚动条滑块 hover */
::-webkit-scrollbar-thumb:hover {
    /* 主题色 */
    background: #052658;
}

/* 兼容 Firefox */
* {
    scrollbar-width: thin;
    scrollbar-color: #94a3b880 #f8fafc80;
}

/* ==================== 自定义 Toast 轻提示样式 ==================== */
/* 全局容器 */
.custom-toast {
    /* 普通提示（主题深蓝 #052658） */
    --info-or-other-bg: #f5f8fb;
    --info-or-other-text: #052658;
    --info-or-other-border: #d4e1f5;
    /* 成功提示 */
    --success-bg: #dcfce7;
    --success-text: #166534;
    --success-border: #bbf7d0;
    /* 错误提示 */
    --error-bg: #fee2e2;
    --error-text: #fb2c36;
    --error-border: #fecaca;
    /* 警告提示（金黄配色） */
    --warning-bg: #fff9e6;
    --warning-text: #f0b100;
    --warning-border: #fadb8e;
    /* 通用样式 */
    --border-radius: 8px;
    --padding: 12px 16px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --font-size: 14px;
    --font-weight: 500;
    /* PC提示位置 */
    --width: max-content !important;
}

/* 移动端提示位置 */
@media (max-width: 600px) {
    .custom-toast [data-sonner-toast] {
        width: max-content !important;
        margin: 0 auto !important;
        left: -32px !important;
    }
}

/* 通用样式 */
.custom-toast [data-sonner-toast] {
    border-radius: var(--border-radius) !important;
    padding: var(--padding) !important;
    box-shadow: var(--shadow) !important;
    font-size: var(--font-size) !important;
    font-weight: var(--font-weight) !important;
    border: 1px solid var(--info-border) !important;
    /* PC提示位置 */
    top: 10px !important;
    left: -56px;
}

/* 提示样式 */
.custom-toast [data-sonner-toast][data-type="info"] {
    background: var(--info-or-other-bg) !important;
    color: var(--info-or-other-text) !important;
    border-color: var(--info-or-other-border) !important;
}

/* 成功样式 */
.custom-toast [data-sonner-toast][data-type="success"] {
    /* background: var(--success-bg) !important;
    color: var(--success-text) !important;
    border-color: var(--success-border) !important; */
    background: var(--info-or-other-bg) !important;
    color: var(--info-or-other-text) !important;
    border-color: var(--info-or-other-border) !important;
}

/* 错误样式 */
.custom-toast [data-sonner-toast][data-type="error"] {
    background: var(--error-bg) !important;
    color: var(--error-text) !important;
    border-color: var(--error-border) !important;
}

/* 警告样式 */
.custom-toast [data-sonner-toast][data-type="warning"] {
    /* background: var(--warning-bg) !important;
    color: var(--warning-text) !important;
    border-color: var(--warning-border) !important; */
    background: var(--info-or-other-bg) !important;
    color: var(--info-or-other-text) !important;
    border-color: var(--info-or-other-border) !important;
}

/* 关闭按钮隐藏（保持自动消失） */
.custom-toast [data-close-button] {
    display: none !important;
}
```

#### 2.2.3 布局相关

##### 2.2.3.1 根布局组件

`/src/app/layout.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.3.2 基础布局组件

`/src/components/layouts/CommonLayout.tsx`：

```tsx
参考仓库源码，这里省略。
```

#### 2.2.4 基础相关

##### 2.2.4.1 通用弹窗组件

`/src/components/features/common/CommonModal.tsx`：

```tsx
参考仓库源码，这里省略。
```
 
##### 2.2.4.2 文档预览组件

`/src/components/features/common/DocPreview.tsx`

```tsx
参考仓库源码，这里省略。
```


#### 2.2.5 侧边栏相关

##### 2.2.5.1 侧边栏组件

`/src/components/features/sidebar/Sidebar.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.5.2 侧边栏组件 (移动端)

`/src/components/features/sidebar/SidebarMobile.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.5.3 会话列表组件

`/src/components/features/sidebar/SessionList.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.5.3.1 会话列表 Hook 组件

`/src/components/hooks/sidebar/useSessionList.tsx`：

```tsx
参考仓库源码，这里省略。
```


#### 2.2.6 会话相关

##### 2.2.6.1 会话标题组件

`/src/components/features/chat/chat-title/ChatTitle.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.6.2 会话内容组件

`/src/components/features/chat/chat-content/ChatContent.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.6.3 会话聊天框相关

###### 2.2.6.3.1 会话聊天框组件

`/src/components/features/chat/chat-box/ChatBox.tsx`：

```tsx
参考仓库源码，这里省略。
```
###### 2.2.6.3.2 输入框组件

`/src/components/features/chat/chat-box/ChatInput.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.6.3.3 文件上传按钮组件

`/src/components/features/chat/chat-box/ChatDocUpload.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.6.3.4 文件上传按钮 Hook 组件

`/src/components/hooks/chat/useDocUpload.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.6.3.5 文件列表展示组件

`/src/components/features/chat/chat-box/ChatDocShow.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.6.3.6 模型选择组件

`/src/components/features/chat/chat-box/ChatModelSelector.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.6.3.7 发送按钮组件

`/src/components/features/chat/chat-box/ChatSendBtn.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.6.4 前端文档解析工具封装

```shell
pnpm install mammoth pdfjs-dist

```

`/src/lib/utils/universalFileParser.ts`：

```ts
参考仓库源码，这里省略。
```


#### 2.2.7 页面相关

##### 2.2.7.1 首页页面组件


`/src/app/page.tsx`：

```tsx
参考仓库源码，这里省略。
```

##### 2.2.7.2 会话页面组件

`/src/app/chat/page.tsx`：

```tsx
参考仓库源码，这里省略。
```

###### 2.2.7.2.1 会话页面 Hook 组件

`/src/components/hooks/chat/useChat.tsx`：

```tsx
参考仓库源码，这里省略。
```

#### 2.2.8 通用工具

`/src/lib/utils/common-tools.ts`：

```tsx
参考仓库源码，这里省略。
```


### 2.3 数据管理

#### 2.3.1 安装依赖

```shell
pnpm install zustand swr
```

#### 2.3.2 客户端全局应用常量

`/src/lib/constants/app.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.3.3 客户端全局 TS 类型

`/src/lib/types/app.d.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.3.4 状态封装

##### 2.3.4.1 通用状态

`/src/store/useCommonStore.ts`：

```ts
参考仓库源码，这里省略。
``` 

##### 2.3.4.2 模型状态

`/src/store/useModelStore.ts`：

```ts
参考仓库源码，这里省略。
```

##### 2.3.4.4 会话请求状态

`/src/store/useChatStore.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.3.5 客户端请求工具封装

`/src/lib/utils/request.ts`：

```ts
参考仓库源码，这里省略。
```


#### 2.3.6 客户端服务层封装

##### 2.3.6.1 模型列表服务层

`/src/services/modelService.ts`：

```ts
参考仓库源码，这里省略。
```

##### 2.3.6.2 会话列表服务层


`/src/services/sessionService.ts`：

```ts
参考仓库源码，这里省略。
```


##### 2.3.6.3 会话请求服务层

`/src/services/chatService.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.3.7 SWR Hook 组件

`/src/components/hooks/common/useSwrApi.ts`：

```ts
参考仓库源码，这里省略。
```


### 2.4 BFF 开发

#### 2.4.1 BFF 全局应用常量

`/src/bff/lib/constants/app.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.2 BFF 全局 TS 类型

`/src/bff/lib/types/app.d.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.3 数据库初始化

##### 2.4.3.1 安装依赖

###### 2.4.3.1.1 PostgreSQL 数据库安装

- PostgreSQL + pgvector 安装：参考 <a href="https://templechann.com/post/postgresql-manual" target="_blank">《PostgreSQL 使用手册》</a>

###### 2.4.3.1.2 数据库代码连接依赖安装

```shell
pnpm install pg
pnpm install -D  @types/pg
```

##### 2.4.3.2 模型配置文件

`/src/bff/lib/db/modelConfig.ts`：

```ts
参考仓库源码，这里省略。
```

##### 2.4.3.3 数据库初始化脚本

> 在应用入口文件中显式调用，如根布局组件。

```shell
pnpm install pg
```

`/src/bff/lib/db/initDB.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.4 BFF 请求工具封装

`/src/bff/lib/utils/request.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.5 BFF 接口异常处理工具封装

`/src/bff/lib/utils/errorHandler.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.6 API 开发
##### 2.4.6.1 BFF 模型列表接口

`/src/app/api/model/route.ts`：

```ts
参考仓库源码，这里省略。
```

##### 2.4.6.2 BFF 会话列表接口

`/src/app/api/session/route.ts`：

```ts
参考仓库源码，这里省略。
```


##### 2.4.6.3 BFF 会话聊天接口

`/src/app/api/chat/route.ts`：

```ts
参考仓库源码，这里省略。
```


#### 2.4.7 BFF 服务层封装
##### 2.4.7.1 BFF 模型列表服务层

> 给 BFF 提供搜索指定模型配置信息的能力。

`/src/bff/services/modelService.ts`：

```ts
参考仓库源码，这里省略。
```
##### 2.4.7.2 BFF 会话列表服务层

`/src/bff/services/sessionService.ts`：

```tsx
参考仓库源码，这里省略。
```


##### 2.4.7.3 BFF 会话请求服务层

> 给 BFF 提供通过前端的会查请求信息、结合搜索的模型配置信息，组装参数去访问它对应模型的会话API，获取会话结果后返回给前端。
 
`/src/bff/services/chatService.ts`：

```ts
参考仓库源码，这里省略。
```

###### 2.4.7.3.1 RAG 工具封装

```shell
pnpm install @langchain/core @langchain/textsplitters @xenova/transformers
```


`/src/bff/lib/utils/ragTool.ts`：

```ts
参考仓库源码，这里省略。
```

###### 2.4.7.3.2 大模型流式响应解析器工厂

`/src/bff/lib/utils/modelStreamParser.ts`：

```ts
参考仓库源码，这里省略。
```

#### 2.4.8 BFF 通用工具

`/src/bff/lib/utils/common-tools.ts`：

```ts
参考仓库源码，这里省略。
```

### 2.5 自动化部署

#### 2.5.1 CI/CD 脚本

`/.github/workflows/tai_deploy.yml`：

```yml
参考仓库源码，这里省略。
```



#### 2.5.2 部署脚本

`/deploy.sh`：

```sh
参考仓库源码，这里省略。
```

#### 2.5.3 Docker 文件

`/Dockerfile`：

```dockerfile
参考仓库源码，这里省略。
```

`/docker-compose.yml`：

```yml
参考仓库源码，这里省略。
```