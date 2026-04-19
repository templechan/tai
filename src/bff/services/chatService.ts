// ==================== BFF 会话请求服务层  ==================== //
// 给 BFF 提供通过前端的会查请求信息、结合搜索的模型配置信息，组装参数去访问它对应模型的会话API，获取会话结果后返回给前端

// ========== React、Next、Utils ========== //
import { request } from "@/bff/lib/utils/request";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import { SupportedModel } from "@/bff/lib/db/modelConfig";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

interface SendChatParams {
    model: SupportedModel;
    chatApiUrl: string;
    apiKey: string;
    content: string;
    requestOptions?: {
        headers?: Record<string, string>;
    };
}

export const chatService = {
    // 发送会话
    async sendChat({ model, chatApiUrl, apiKey, content, requestOptions }: SendChatParams): Promise<any> {
        // 统一请求头（基础头 + 模型专属头）
        const headers = {
            Authorization: `Bearer ${apiKey}`, // 统一的鉴权格式（大部分模型遵循）
            ...requestOptions?.headers, // 模型专属头覆盖基础头
        };
        // 不同模型的请求参数适配（核心差异点）
        let requestBody: Record<string, any> = {};
        switch (model) {
            case "deepseek-chat":
                // DeepSeek参数格式（OpenAI兼容）
                requestBody = {
                    model: "deepseek-chat", // DeepSeek模型标识
                    messages: [{ role: "user", content }], // 对话消息
                    stream: true, // 开启流式响应
                };
                break;

            case "doubao-seed-2-0-pro-260215":
                // 豆包参数格式（示例，需根据实际文档调整）
                requestBody = {
                    model: "doubao-seed-2-0-pro-260215",
                    messages: [
                        {
                            content: [
                                {
                                    text: content,
                                    type: "text",
                                },
                            ],
                            role: "user",
                        },
                    ],
                    reasoning_effort: "medium", // 思考程度, minimal、low、medium、high 四种模式，其中 minimal 为不思考
                    stream: true, // 开启流式响应
                };
                break;

            case "qwen3.6-plus-2026-04-02":
                // 千问参数格式（阿里云DashScope标准）
                requestBody = {
                    model: "qwen3.6-plus-2026-04-02", // 千问模型标识
                    messages: [{ role: "user", content }], // 对话消息
                    stream: true, // 开启流式响应
                };
                break;
        }

        // 发送POST请求（流式响应）
        const response = await request(chatApiUrl, {
            method: "POST",
            headers,
            body: requestBody,
        });

        return response;
    },
};
