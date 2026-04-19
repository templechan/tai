"use client";

// ==================== 发送按钮组件 ==================== //

// ========== React、Next、Utils ========== //
import { useRouter } from "next/navigation";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import { LoaderCircle, Send } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //
import { sessionService } from "@/services/sessionService";

export default function ChatSendBtn({ onSend, onAbort }: { onSend?: () => void; onAbort?: () => void }) {
    const currentSession = useSessionStore((state) => state.currentSession);
    const chat = useChatStore((state) => state.chat);
    const isDocUploaded = useChatStore((state) => state.isDocUploaded);
    const isSendLoading = useChatStore((state) => state.isLoading);
    const setIsAutoSend = useChatStore((state) => state.setIsAutoSend);

    const router = useRouter();

    // 处理请求发送
    const handleSend = async (): Promise<void> => {
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
            // 跳转到会话页面组件
            setIsAutoSend(true);
            router.push(`/chat/${id}`);
        } else {
            onSend?.();
        }
    };

    return (
        <>
            {isSendLoading ? (
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all duration-200 hover:bg-red-600 hover:shadow-red-500/30 active:scale-95" onClick={onAbort}>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                </div>
            ) : !chat.content.trim() || !isDocUploaded ? (
                <div className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-gray-300 text-gray-500 shadow-lg transition-all duration-200">
                    <Send className="h-4 w-4" />
                </div>
            ) : (
                <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#052658] text-white shadow-lg transition-all duration-200 hover:bg-[#063272] hover:shadow-[#052658]/30 active:scale-95" onClick={handleSend}>
                    <Send className="h-4 w-4" />
                </div>
            )}
        </>
    );
}
