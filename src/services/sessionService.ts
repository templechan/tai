"use client";

// ==================== 会话列表服务层 ==================== //

// ========== React、Next、Utils ========== //
import { request } from "@/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Message } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

export const sessionService = {
    // 新增会话
    async createSession(data: { title: string }): Promise<any> {
        return (await request(`/session`, { method: "POST", body: data })).json();
    },
    // 删除会话
    async deleteSession(id: string): Promise<any> {
        return (await request(`/session?id=${id}`, { method: "DELETE" })).json();
    },
    // 更新会话（重命名）
    async updateSession(id: string, data: { title: string }): Promise<any> {
        return (await request(`/session?id=${id}`, { method: "PATCH", body: data })).json();
    },
    // 更新会话（新增会话聊天数据）
    async updateSessionMessage(id: string, data: { message: Message }): Promise<any> {
        return (await request(`/session?id=${id}`, { method: "PATCH", body: data })).json();
    },
    // 获取单个会话
    async getSession(id: string): Promise<any> {
        return (await request(`/session?id=${id || ""}`)).json();
    },
    // 获取会话列表
    async getSessionList(): Promise<any> {
        return (await request(`/session`)).json();
    },
};
