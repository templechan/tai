// ==================== BFF 模型列表服务层 ==================== //
// 给 BFF 提供搜索指定模型配置信息的能力

// ========== React、Next、Utils ========== //
import { request } from "@/bff/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { FETCH_CONFIG } from "@/bff/lib/constants/app";
import { SupportedModel } from "@/bff/lib/db/modelConfig";
// ========== Hooks ========== //
// ========== Services ========== //

export const modelService = {
    // 新增：获取模型完整配置（推荐新逻辑使用）
    async getModelConfig(model: SupportedModel): Promise<any> {
        return (await request(`${process.env.BFF_PUBLIC_API_BASE_URL}${FETCH_CONFIG.BFF_PREFIX}/model?id=${model}`)).json();
    },
};
