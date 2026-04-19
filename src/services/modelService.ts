"use client";

// ==================== 模型列表服务层 ==================== //

// ========== React、Next、Utils ========== //
import { request } from "@/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

export const modelService = {
    // 获取模型列表
    async getModel(id: string): Promise<any> {
        return (await request(`/model?id=${id || ""}`)).json();
    },
    // 获取模型
    async getModelList(): Promise<any> {
        return (await request(`/model`)).json();
    },
};
