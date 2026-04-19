"use client";

// ==================== 输入框组件 ==================== //

// ========== React、Next、Utils ========== //
import { useRouter } from "next/navigation";
// ========== Components、CSS ========== //
import { Textarea } from "@/components/ui/textarea";
// ========== Icon、Type ========== //
import type { KeyboardEvent } from "react";
// ========== Stroe、Constants ========== //
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
import { HOME_CHAT_PROMPT, HOME_CHATING_PROMPT } from "@/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //
import { sessionService } from "@/services/sessionService";

export default function ChatInput({ onSend }: { onSend?: () => void }) {
    const currentSession = useSessionStore((state) => state.currentSession);
    const chat = useChatStore((state) => state.chat);
    const setChat = useChatStore((state) => state.setChat);
    const isChatLoading = useChatStore((state) => state.isLoading);
    const setIsAutoSend = useChatStore((state) => state.setIsAutoSend);

    const router = useRouter();

    // 输入框输入
    const setInput = (input: string) => {
        setChat({
            ...chat,
            content: input,
        });
    };

    // 输入框回车
    const handleInputKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && chat?.content.trim()) {
            e.preventDefault();
            const chat = useChatStore.getState().chat;

            if (!currentSession) {
                // 首页发送
                // 创建会话ID
                const { id } = (
                    await sessionService.createSession({
                        // 标题默认截取前 20 位
                        title: chat?.content.slice(0, 19),
                    })
                ).data;
                setIsAutoSend(true);
                // 跳转到会话页面组件
                router.push(`/chat/${id}`);
            } else {
                onSend?.();
            }
        }
    };

    return <Textarea className="w-full flex-1 resize-none border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0" value={chat?.content || ""} onChange={(e) => setInput(e.target.value)} placeholder={isChatLoading ? HOME_CHATING_PROMPT : HOME_CHAT_PROMPT} disabled={isChatLoading} onKeyDown={(e) => handleInputKeyDown(e)} />;
}
