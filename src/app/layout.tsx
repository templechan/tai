// ==================== 根布局组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
// ========== Icon、Type ========== //
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    preload: false, // 关闭预加载，警告直接消失
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    preload: false,
});

export const metadata: Metadata = {
    title: "T.AI - AI助手",
    description: "Chat with T.AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | T.AI 助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。",
    keywords: ["AI", "Assistant", "Next.js", "Chat"],
    icons: {
        icon: "/favicon.ico",
        apple: "/assets/images/logo.png",
    },
    authors: [{ name: "谌中钱" }],
    creator: "谌中钱",
    publisher: "爬界科技",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://tai.templechann.com"),
    openGraph: {
        title: "T.AI - AI助手",
        description: "Chat with T.AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | T.AI 助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。",
        url: "https://tai.templechann.com",
        siteName: "T.AI - AI助手",
        locale: "zh_CN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "T.AI - AI助手",
        description: "Chat with T.AI – your intelligent assistant for coding, content creation, file reading, and more. Upload documents, engage in long-context conversations, and get expert help in AI, natural language processing, and beyond. | T.AI 助力编程代码开发、创意写作、文件处理等任务，支持文件上传及长文本对话，随时为您提供高效的AI支持。",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        // data-scroll-behavior="smooth"：Next.js 路由切换时会自动管理页面滚动，手动开启平滑滚动需要显示声明，不然会有警告
        <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} antialiased`} data-scroll-behavior="smooth">
            {/* h-dvh，是现代动态 CSS 视口单位，专门解决移动端浏览器的坑：传统 vh 会被地址栏 / 底部导航栏挤占，导致高度计算错误 */}
            <body className="h-dvh w-full overflow-hidden">
                <TooltipProvider>{children}</TooltipProvider>
                {/* 全局提示容器，轻量级 toast，shadcn/ui 官方推荐 */}
                {/* toast.success("操作成功！"); 
                    toast.error("操作失败！");
                    toast.warning("请注意！");
                    toast.info("普通提示");
                */}
                <Toaster
                    className="custom-toast" // 自定义样式
                    position="top-center" // 位置：top-center / top-right 等
                    duration={2000} // 2秒自动消失
                    expand={true} // 多个弹窗需要展开
                    visibleToasts={3} // 允许同时显示5个弹窗
                    closeButton={false} // 隐藏关闭按钮
                    richColors={false} // 关闭默认配色，用我们的自定义色
                    gap={10} // 多个提示间距
                />
            </body>
        </html>
    );
}
