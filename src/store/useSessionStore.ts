"use client";

// ==================== 会话状态 ==================== //

// ========== React、Next、Utils ========== //
import { create } from "zustand";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Session } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

interface SessionStore {
    // 会话列表
    sessionList: Session[];
    setSessionList: (sessionList: Session[]) => void;
    // 当前会话详情
    currentSession: Session | null;
    setCurrentSession: (collacurrentSessionpsed: Session | null) => void;
    // 会话重命名
    editId: string;
    setEditId: (editId: string) => void;
    editName: string;
    setEditName: (editName: string) => void;
    resetEdit: () => void;
}

const initialState = {
    // 会话列表
    sessionList: [],
    // 当前会话详情
    currentSession: null,
    // 会话重命名
    editId: "",
    editName: "",
};

export const useSessionStore = create<SessionStore>((set) => ({
    ...initialState,
    // 会话列表
    setSessionList: (sessionList: Session[]) => set({ sessionList: sessionList }),
    // 当前会话详情
    setCurrentSession: (currentSession: Session | null) => set({ currentSession: currentSession }),
    // 会话重命名
    setEditId: (editId: string) => set({ editId: editId }),
    setEditName: (editName: string) => set({ editName: editName }),
    resetEdit: () => set({ editId: "", editName: "" }),
}));
