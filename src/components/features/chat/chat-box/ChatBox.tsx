"use client";

// ==================== 会话聊天框相关 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import ChatInput from "@/components/features/chat/chat-box/ChatInput";
import ChatDocUpload from "@/components/features/chat/chat-box/ChatDocUpload";
import ChatDocShow from "@/components/features/chat/chat-box/ChatDocShow";
import ChatModelSelector from "@/components/features/chat/chat-box/ChatModelSelector";
import ChatSendBtn from "@/components/features/chat/chat-box/ChatSendBtn";
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function ChatBox({ onSend, onAbort }: { onSend?: () => void; onAbort?: () => void }) {
    const chat = useChatStore((state) => state.chat);

    return (
        <div className={`${chat.docs.length ? "h-51" : "h-34"} flex w-full flex-col gap-1 rounded-4xl border border-gray-400 bg-white p-3 shadow-sm`}>
            <ChatDocShow />
            <ChatInput onSend={onSend} />
            <div className="flex items-center justify-between">
                <ChatModelSelector />
                <div className="flex items-center gap-3">
                    <ChatDocUpload />
                    <ChatSendBtn onSend={onSend} onAbort={onAbort} />
                </div>
            </div>
        </div>
    );
}
