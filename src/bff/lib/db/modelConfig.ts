// ==================== 模型配置文件 ==================== //

// ==================== 大模型统一配置中心 ==================== //
// 作用：集中管理所有大模型的API地址、密钥映射、解析器类型等配置
// 扩展新模型：仅需在 MODEL_CONFIG_MAP 中新增配置项即可

// 定义支持的模型类型（强类型约束，避免拼写错误）
export type SupportedModel = "deepseek-chat" | "doubao-seed-2-0-pro-260215" | "qwen3.6-plus-2026-04-02";

/**
 * 单个模型的核心配置结构
 * @property apiKeyKey 对应 MODEL_API_KEY 常量中的key（用于获取API密钥）
 * @property chatApiUrl 模型的聊天API地址
 * @property parserType 该模型对应的流式解析器类型（与解析器工厂一一对应）
 * @property requestOptions 额外请求配置（请求头、超时等）
 */
export interface ModelConfig {
    label: string;
    description: string;
    apiKeyKey: SupportedModel;
    chatApiUrl: string;
    parserType: SupportedModel;
    requestOptions?: {
        headers?: Record<string, string>; // 请求头配置
    };
    enabled: number;
}

/**
 * 所有支持模型的配置映射表
 * 新增模型时：
 * 1. 在 SupportedModel 类型中添加模型标识
 * 2. 在该对象中新增对应模型的配置
 */
export const MODEL_CONFIG_MAP: Record<SupportedModel, ModelConfig> = {
    // DeepSeek 模型配置（原有模型，适配现有逻辑）
    "deepseek-chat": {
        label: "DeepSeek",
        description: "调用 DeepSeek-V3.2（非思考模式）模型",
        apiKeyKey: "deepseek-chat", // 对应 MODEL_API_KEY["deepseek-chat"]
        chatApiUrl: "https://api.deepseek.com/v1/chat/completions", // DeepSeek官方流式API地址
        parserType: "deepseek-chat", // 使用deepseek专属解析器
        requestOptions: {
            headers: {}, // 固定请求头
        },
        enabled: 1,
    },
    // 豆包模型配置（新增，需替换为实际API地址）
    "doubao-seed-2-0-pro-260215": {
        label: "字节豆包",
        description: "调用 Doubao-Seed-2.0-pro（非思考模式）模型",
        apiKeyKey: "doubao-seed-2-0-pro-260215", // 需在 MODEL_API_KEY 中配置该key的密钥
        chatApiUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions", // 豆包流式API示例地址
        parserType: "doubao-seed-2-0-pro-260215", // 使用doubao专属解析器
        requestOptions: {
            headers: {},
        },
        enabled: 1,
    },
    // 千问模型配置（新增，阿里云千问官方地址）
    "qwen3.6-plus-2026-04-02": {
        label: "通义千问",
        description: "调用 Qwen3.6-Plus（非思考模式）模型",
        apiKeyKey: "qwen3.6-plus-2026-04-02", // 需在 MODEL_API_KEY 中配置该key的密钥
        chatApiUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", // 千问流式API地址
        parserType: "qwen3.6-plus-2026-04-02", // 使用qwen专属解析器
        requestOptions: {
            headers: {},
        },
        enabled: 1,
    },
};

// 获取指定模型的配置（封装成函数，统一异常处理）
export const getModelConfig = (model: SupportedModel): ModelConfig => {
    const config = MODEL_CONFIG_MAP[model];
    if (!config) {
        throw new Error(`[模型配置异常] 未找到 ${model} 的配置，请检查 modelConfig.ts`);
    }
    return config;
};
