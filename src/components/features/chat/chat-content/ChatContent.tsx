"use client";

// ==================== 会话内容组件 ====================

// ========== React、Next、Utils ==========
import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/utils/common-tools";
// ========== Components、CSS ==========
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ChatDocShow from "@/components/features/chat/chat-box/ChatDocShow";
// ========== Icon、Type ==========
import { Copy, Check, RefreshCcw, LoaderCircle } from "lucide-react";
import type { Chat, ChatHistory, Message } from "@/lib/types/app";
// ========== Stroe、Constants ==========
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ==========
// ========== Services ==========

export default function ChatContent() {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const currentSession = useSessionStore((state) => state.currentSession);
    const setChat = useChatStore((state) => state.setChat);
    const setIsAutoSend = useChatStore((state) => state.setIsAutoSend);

    const timerRef = useRef<NodeJS.Timeout[]>([]);

    // 清理所有定时器（防止内存泄漏）
    const clearAllTimers = () => {
        timerRef.current.forEach((timer) => clearTimeout(timer));
        timerRef.current = [];
    };

    // 组件卸载销毁定时器
    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    const handleCopy = (text: string, id: string) => {
        copyToClipboard(text);
        setCopiedId(id);

        // 2秒后重置复制状态
        const timer = setTimeout(() => setCopiedId(null), 2000);
        timerRef.current.push(timer);
    };

    const handleRetry = (message: Message) => {
        const chatParams: Chat = {
            id: currentSession?.id || "",
            model: message.model,
            content: message.content,
            chatHistorys: currentSession?.messages?.map((msg) => ({ role: msg.role.trim(), content: msg.content.trim() }) as ChatHistory) || [],
            docs: message.docs,
            hasDocHistorys: !!currentSession?.messages?.some((item) => item.docs?.length > 0),
        };
        setChat(chatParams);
        setIsAutoSend(true);
    };

    return (
        <div className="flex h-full w-full flex-col gap-6 px-4 md:px-0">
            {currentSession?.messages?.map((msg, index) => (
                <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {/* AI 回答：左侧 */}
                    {msg.role === "assistant" && (
                        <div className="flex w-[92%] flex-col gap-1">
                            <div className="flex w-full gap-1">
                                <div className="shrink-0 pt-1 pr-1">
                                    <Image className="rounded-sm" src={msg.model ? `/assets/images/modelIcons/${msg.model}.png` : "/assets/images/logo.png"} alt="T.AI" width={30} height={30} priority />
                                </div>
                                {msg.content ? (
                                    <div className="max-w-full min-w-0! rounded-2xl border border-gray-200 bg-white px-4 py-3 wrap-break-word whitespace-pre-wrap">
                                        <div className="prose prose-sm md:prose-base max-w-none text-gray-700">{msg.content}</div>
                                    </div>
                                ) : (
                                    <Button size="icon" variant="ghost" className="mt-2.5 ml-1 h-6 w-6 overflow-hidden text-gray-400">
                                        <LoaderCircle className="h-5! w-5! animate-spin" />
                                    </Button>
                                )}
                            </div>
                            {msg.content ? (
                                <div className="flex items-center gap-3">
                                    <Button size="icon" variant="ghost" className="mt-1 ml-11 h-6 w-6 cursor-pointer rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:translate-y-0!" onClick={() => handleCopy(msg.content, `${msg.role}-${index}`)}>
                                        {copiedId === `${msg.role}-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-5! w-5!" />}
                                    </Button>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}

                    {/* 用户回答：右侧 */}
                    {msg.role === "user" && (
                        <div className="flex max-w-[85%] flex-col items-end gap-1">
                            <ChatDocShow messageDocs={msg.docs} />
                            <div className="max-w-full min-w-0! rounded-2xl bg-[#052658] px-4 py-3 wrap-break-word whitespace-pre-wrap">
                                <div className="prose prose-sm md:prose-base prose-invert text-white">{msg.content}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="mt-1 h-6 w-6 cursor-pointer rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:translate-y-0!" onClick={() => handleRetry(msg)}>
                                    <RefreshCcw className="h-5! w-5!" />
                                </Button>
                                <Button size="icon" variant="ghost" className="mt-1 mr-2 h-6 w-6 cursor-pointer rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:translate-y-0!" onClick={() => handleCopy(msg.content, `${msg.role}-${index}`)}>
                                    {copiedId === `${msg.role}-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-5! w-5!" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
