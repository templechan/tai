"use client";

// ==================== 首页页面组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import Image from "next/image";
import CommonLayout from "@/components/layouts/CommonLayout";
import ChatTitle from "@/components/features/chat/chat-title/ChatTitle";
import ChatBox from "@/components/features/chat/chat-box/ChatBox";
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { HOME_CHAT_TITLE } from "@/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //

export default function Home() {
    const collapsed = useCommonStore((state) => state.collapsed);

    return (
        <CommonLayout>
            <div className={`${collapsed ? "md:max-w-220" : "md:max-w-3xl"} flex h-full w-full flex-col md:justify-center`}>
                <div className="fixed top-0 w-full">
                    <ChatTitle />
                </div>

                <div className="-mt-16 flex h-full w-full items-center justify-center gap-4 md:mb-6 md:h-auto">
                    <Image className="rounded-sm" src="/assets/images/logo.png" alt="T.AI" width={46} height={46} priority />
                    <h3 className="text-xl font-medium text-[#052658]">{HOME_CHAT_TITLE}</h3>
                </div>

                <div className="fixed bottom-0 w-full px-3 py-5 md:relative">
                    <ChatBox />
                </div>
            </div>
        </CommonLayout>
    );
}
