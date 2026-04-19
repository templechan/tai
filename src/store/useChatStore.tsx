"use client";

// ==================== 会话请求状态 ==================== //

// ========== React、Next、Utils ========== //
import { create } from "zustand";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Chat } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

interface ChatStore {
    chat: Chat;
    setChat: (chat: Chat) => void;
    isDocUploaded: boolean;
    setIsDocUploaded: (isDocUploaded: boolean) => void;
    isAutoSend: boolean; // 是否自动发送，首页过来需要设置 true
    setIsAutoSend: (isAutoSend: boolean) => void;
    resetChat: (model?: string) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    error: string;
}

const initialState = {
    chat: {
        id: "",
        model: "",
        content: "",
        chatHistorys: [],
        docs: [],
        hasDocHistorys: false,
    },
    isDocUploaded: true,
    isAutoSend: false,
    isLoading: false,
    error: "",
};

export const useChatStore = create<ChatStore>((set) => ({
    ...initialState,
    setChat: (chat: Chat) => set({ chat: chat }),
    setIsDocUploaded: (isDocUploaded: boolean) => set({ isDocUploaded: isDocUploaded }),
    setIsAutoSend: (isAutoSend: boolean) => set({ isAutoSend: isAutoSend }),
    setIsLoading: (isLoading: boolean) => set({ isLoading: isLoading }),
    resetChat: (model?: string) =>
        set({
            ...initialState,
            chat: {
                id: "",
                model: model || "",
                content: "",
                chatHistorys: [],
                docs: [],
                hasDocHistorys: false,
            },
        }),
}));
