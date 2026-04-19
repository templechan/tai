"use client";

// ==================== 会话标题组件 ==================== //

// ========== React、Next、Utils ========== //
import { useRouter } from "next/navigation";
// ========== Components、CSS ========== //
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SidebarMobile from "@/components/features/sidebar/SidebarMobile";
// ========== Icon、Type ========== //
import { MessageCirclePlus } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function ChatTitle() {
    const currentSession = useSessionStore((state) => state.currentSession);
    const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
    const resetChat = useChatStore((state) => state.resetChat);

    const router = useRouter();

    // 会话新开启
    const handleSessionNewClick = (): void => {
        if (!currentSession) {
            toast.info("已在新对话中");
            return;
        }

        // 开启新会话
        router.push("/");
        setCurrentSession(null);
        resetChat();
    };

    return (
        <>
            {/* PC端 */}
            <div className={`${currentSession ? "hidden md:flex" : "hidden"} h-14 w-full items-center justify-center bg-white`}>
                <div className="mx-40 flex-1 truncate text-center font-bold" title={currentSession?.title}>
                    {currentSession?.title}
                </div>
            </div>
            {/* 移动端 */}
            <div className="z-30! flex h-14 w-full items-center justify-between gap-12 bg-white px-3 md:hidden">
                <SidebarMobile />
                <div className={`${currentSession ? "" : "hidden"} flex-1 truncate text-center font-bold`} title={currentSession?.title}>
                    {currentSession?.title}
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 cursor-pointer" onClick={() => handleSessionNewClick()}>
                    <MessageCirclePlus className="h-6! w-6!" />
                </Button>
            </div>
        </>
    );
}
