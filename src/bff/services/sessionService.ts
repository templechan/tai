// ==================== BFF 会话列表服务层 ==================== //

// ========== React、Next、Utils ========== //
import { request } from "@/bff/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import { MessageBFF } from "@/bff/lib/types/app";
// ========== Stroe、Constants ========== //
import { FETCH_CONFIG } from "@/bff/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //

export const sessionService = {
    // 更新会话（新增会话聊天数据）
    async updateSessionMessage(id: string, data: { message: MessageBFF }): Promise<any> {
        return (await request(`${FETCH_CONFIG.BFF_API_BASE_URL}${FETCH_CONFIG.BFF_PREFIX}/session?id=${id}`, { method: "PATCH", body: data })).json();
    },
};
