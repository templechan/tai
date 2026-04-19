// ==================== BFF全局应用常量 ==================== //

import { SupportedModel } from "@/bff/lib/db/modelConfig";

// BFF请求请求默认配置
export const FETCH_CONFIG = {
    TIMEOUT: 600000, // BFF请求默认超时时间
    RETRY_TIMES: 1, // 网络波动重试1次
    PREFIX: "/api", // 接口请求前缀
    BFF_PREFIX: "/api", // BFF接口请求前缀
};

// 大模型密钥映射（环境变量读取，无硬编码）
export const MODEL_API_KEY: Record<SupportedModel, string> = {
    "deepseek-chat": process.env.DEEPSEEK_API_KEY || "",
    "doubao-seed-2-0-pro-260215": process.env.DOUBAO_API_KEY || "",
    "qwen3.6-plus-2026-04-02": process.env.QIANWEN_API_KEY || "",
};
