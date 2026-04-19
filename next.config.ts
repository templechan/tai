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
