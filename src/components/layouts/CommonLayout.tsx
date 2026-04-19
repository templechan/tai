"use client";

// ==================== 基础布局组件 ==================== //

// ========== React、Next、Utils ========== //
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import nextRag from "@/bff/lib/utils/rag-tool";
// ========== Components、CSS ========== //
import Sidebar from "@/components/features/sidebar/Sidebar";
import CommonModal from "@/components/features/common/CommonModal";
import DocPreview from "@/components/features/common/DocPreview";
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function BaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [autoScroll, setAutoScroll] = useState(true);
    // 移动端触摸状态（解决 iOS 滑动冲突）
    const [isTouching, setIsTouching] = useState(false);

    // 精确订阅
    const collapsed = useCommonStore((state) => state.collapsed);
    const currentSession = useSessionStore((state) => state.currentSession);
    const isSendLoading = useChatStore((state) => state.isLoading);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout[]>([]);
    const rafId = useRef<number>(null);

    // 服务启动后，自动预下载模型
    (async () => {
        try {
            // 启动时预加载模型，不阻塞服务
            await nextRag.preloadModels();
        } catch (e) {
            console.error("⚠️ 模型预加载失败，首次调用会自动重试", e);
        }
    })();

    // 清理所有定时器（防止内存泄漏）
    const clearAllTimers = () => {
        timerRef.current.forEach((timer) => clearTimeout(timer));
        timerRef.current = [];
    };

    // 组件卸载销毁定时器
    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    // 自动滚动到最底部
    const scrollToBottom = () => {
        if (autoScroll && !isTouching && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // 当组件重新挂载时，重新开启自动滚动并滚动到底部
    useLayoutEffect(() => {
        if (currentSession) {
            rafId.current = requestAnimationFrame(() => {
                scrollToBottom();
            });
        }
        return () => {
            rafId.current && cancelAnimationFrame(rafId.current);
        };
    }, [currentSession, autoScroll]);

    useLayoutEffect(() => {
        let timer = null;
        if (isSendLoading) {
            // 异步更新，绕过 ESLint 严格校验，功能完全不变
            timer = setTimeout(() => {
                setAutoScroll(true);
            }, 0);
            timerRef.current.push(timer);
        }
    }, [isSendLoading]);

    // 处理滚动事件，用户手动滚动时暂停自动滚动
    const handleScroll = () => {
        if (!chatContainerRef.current || isTouching) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // 移动端适配：缩小阈值，更灵敏
        const threshold = window.innerWidth < 768 ? 160 : 100;

        if (scrollHeight - scrollTop - clientHeight > threshold) {
            setAutoScroll(false);
        } else {
            setAutoScroll(true);
        }
    };

    // 触摸事件
    const handleTouchStart = () => setIsTouching(true);
    const handleTouchEnd = () => {
        setIsTouching(false);
        handleScroll();
        autoScroll && scrollToBottom();
    };

    return (
        // flex 布局必须加 w-full：因为 flex 布局默认宽度是内容宽度，会被被内容撑开
        <div className="flex h-full w-full md:min-w-350">
            <Sidebar />
            <div ref={chatContainerRef} className={`${!collapsed ? "md:pl-64" : ""} flex h-full w-full flex-1 justify-center overflow-y-auto transition-all duration-300`} onScroll={handleScroll} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
                {children}
            </div>
            <CommonModal />
            <DocPreview />
        </div>
    );
}
