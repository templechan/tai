"use client";

// ==================== 侧边栏组件 ==================== //

// ========== React、Next、Utils ========== //
import { useRouter } from "next/navigation";
// ========== Components、CSS ========== //
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SessionList from "@/components/features/sidebar/SessionList";
// ========== Icon、Type ========== //
import { PanelLeft, MessageCirclePlus } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function Sidebar() {
    const collapsed = useCommonStore((state) => state.collapsed);
    const setCollapsed = useCommonStore((state) => state.setCollapsed);
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
            <div className={`hidden md:flex ${!collapsed ? "translate-x-0" : "-translate-x-full"} fixed top-0 left-0 z-30! h-full w-64 flex-col overflow-hidden border-r border-gray-200 bg-[#F9F9F9] transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between pt-4 pr-2 pb-5 pl-4">
                    <div className="flex items-center gap-2">
                        <Image className="rounded-sm" src="/assets/images/logo.png" alt="T.AI" width={32} height={32} priority />
                        <span className="text-xl font-bold tracking-widest text-[#052658] italic drop-shadow-2xl">T.AI</span>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="cursor-pointer text-gray-500" onClick={() => setCollapsed(!collapsed)}>
                                <PanelLeft className="h-6! w-6!" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>收起边栏</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="mx-4 flex cursor-pointer items-center justify-center rounded-xl border border-gray-500 bg-white py-1 transition-shadow hover:shadow-md" onClick={() => handleSessionNewClick()}>
                    <Button size="icon" variant="ghost" className="cursor-pointer">
                        <MessageCirclePlus className="h-4! w-4!" />
                    </Button>
                    <span className="text-sm">开启新对话</span>
                </div>
                <SessionList />
            </div>

            <div className={`hidden md:flex ${!collapsed ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"} fixed top-4 left-4 z-30! flex items-center gap-4 transition-opacity duration-1000 ease-in-out`}>
                <Image className="rounded-sm" src="/assets/images/logo.png" alt="T.AI" width={32} height={32} priority />
                <div className="flex items-center gap-5 rounded-xl border border-gray-500 px-3.5 py-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-5! w-5! cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
                                <PanelLeft className="h-5! w-5!" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>打开边栏</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-5! w-5! cursor-pointer" onClick={() => handleSessionNewClick()}>
                                <MessageCirclePlus className="h-5! w-5!" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>开启新对话</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </>
    );
}
