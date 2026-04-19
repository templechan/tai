"use client";

// ==================== 会话请求服务层 ==================== //

// ========== React、Next、Utils ========== //
import { request } from "@/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Chat } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

export const chatService = {
    // 发送会话
    async sendChat(data: { chatParams: Chat; signal: AbortSignal }): Promise<any> {
        return await request(`/chat`, { method: "POST", body: data });
    },
};
