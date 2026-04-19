"use client";

// ==================== 会话页面组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import CommonLayout from "@/components/layouts/CommonLayout";
import ChatTitle from "@/components/features/chat/chat-title/ChatTitle";
import ChatContent from "@/components/features/chat/chat-content/ChatContent";
import ChatBox from "@/components/features/chat/chat-box/ChatBox";
// ========== Icon、Type ========== //
import type { Chat } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
import { useChat } from "@/components/hooks/chat/useChat";
// ========== Services ========== //

export default function Chat() {
    const collapsed = useCommonStore((state) => state.collapsed);
    const chat = useChatStore((state) => state.chat);

    const { sendChatMessage, abortChatRequest } = useChat();

    return (
        <CommonLayout>
            <div className={`${collapsed ? "md:max-w-242" : "md:max-w-3xl"} flex h-full w-full flex-col`}>
                <div className={`${collapsed ? "md:max-w-242" : "md:max-w-3xl"} fixed top-0 z-30! w-full md:my-auto`}>
                    <ChatTitle />
                    <div className="pointer-events-none h-3 w-full bg-linear-to-b from-white to-transparent" />
                </div>
                <div className={`${chat.docs.length ? "pb-67" : "pb-50"} z-10! w-full pt-20`}>
                    <ChatContent />
                </div>
                <div className={`${collapsed ? "md:max-w-242" : "md:max-w-3xl"} fixed bottom-0 z-30! flex w-full justify-center bg-white px-3 py-5 md:my-auto md:px-0`}>
                    <div className="pointer-events-none absolute -top-5 left-0 h-5 w-full bg-linear-to-t from-white to-transparent" />
                    <ChatBox onSend={sendChatMessage} onAbort={abortChatRequest} />
                </div>
            </div>
        </CommonLayout>
    );
}
