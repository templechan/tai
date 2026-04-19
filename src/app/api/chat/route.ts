// ==================== BFF 会话聊天接口 ==================== //

// ========== React、Next、Utils ========== //
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/bff/lib/utils/error-handler";
import { nextRag } from "@/bff/lib/utils/rag-tool";
import { v4 as uuidv4 } from "uuid";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { ChatBFF } from "@/bff/lib/types/app";
// ========== Stroe、Constants ========== //
import { MODEL_API_KEY } from "@/bff/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //
import { modelService } from "@/bff/services/modelService";
import { sessionService } from "@/bff/services/sessionService";
import { chatService } from "@/bff/services/chatService";
import { MODEL_CONFIG_MAP, SupportedModel } from "@/bff/lib/db/modelConfig";
import { getStreamParser } from "@/bff/lib/utils/modelStreamParser";

// 发送会话
export const POST = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const chatParams: ChatBFF = (await request.json()).chatParams;

    // 类型校验：确保模型在支持列表中（避免非法模型请求）
    const models = Object.entries(MODEL_CONFIG_MAP).map(([model]) => model);
    if (!models.includes(chatParams.model)) {
        throw new Error(`[参数异常] 不支持的模型类型：${chatParams.model}`);
    }

    const model = chatParams.model as SupportedModel;

    // 调用 RAG 获取处理后的 prompt
    const { prompt } = await nextRag.smartChat({
        sessionId: chatParams.id,
        userQuery: chatParams.content,
        docs: chatParams.docs,
        chatHistorys: chatParams.chatHistorys,
        hasDocHistorys: chatParams.hasDocHistorys,
    });

    // 从统一配置中心获取模型配置
    const modelConfig = (await modelService.getModelConfig(model)).data;
    // 根据配置获取API密钥（兼容原有MODEL_API_KEY常量）
    const apiKey = MODEL_API_KEY[modelConfig.apiKeyKey as SupportedModel];

    if (!apiKey) {
        throw new Error(`[配置异常] 未配置 ${model} 的API密钥，请检查 MODEL_API_KEY 常量`);
    }

    const modelResponse = await chatService.sendChat({
        model,
        chatApiUrl: modelConfig.chatApiUrl,
        apiKey,
        content: prompt,
        requestOptions: modelConfig.requestOptions,
    });
    // 统一流式响应处理
    const stream = new ReadableStream({
        async start(controller) {
            // 防御性校验：确保响应体存在
            if (!modelResponse.body) {
                console.error(`[流异常] ${model} 返回空响应体`);
                controller.close();
                return;
            }

            const reader = modelResponse.body.getReader(); // 获取流读取器
            const decoder = new TextDecoder("utf-8"); // 复用解码器（避免重复创建）
            let fullText: string = ""; // 拼接完整回复内容（用于持久化）
            const parser = getStreamParser(model); // 获取当前模型的解析器

            try {
                // 通用流读取循环（所有模型共用此逻辑）
                while (true) {
                    const { done: readerDone, value } = await reader.read();
                    // 流读取完成，退出循环
                    if (readerDone) break;

                    // 调用解析器处理二进制chunk，获取标准化结果
                    const parseResults = parser(value, decoder);
                    // 遍历解析结果，推送给前端
                    for (const result of parseResults) {
                        // 跳过结束标识
                        if (result.done) continue;
                        // 有内容则推送给前端
                        if (result.content) {
                            fullText += result.content;
                            controller.enqueue(result.content); // 仅推送纯文本给前端
                        }
                    }
                }
            } catch (error) {
                const errorMsg = `${model} 模型服务异常，请稍后重试`;
                fullText = errorMsg;
                controller.enqueue(errorMsg);
                console.error(`[流处理异常] ${model} 流读取失败：`, error);
            } finally {
                // 关闭流（必须执行，否则前端会一直等待）
                controller.close();

                // ========== 原有逻辑：持久化助手回复 ========== //
                await sessionService.updateSessionMessage(chatParams.id, {
                    message: {
                        id: uuidv4(),
                        role: "assistant",
                        model: chatParams.model,
                        content: fullText,
                        createTime: new Date().toISOString(),
                        docs: [],
                    },
                });
            }
        },
    });
    // 返回标准 SSE 流
    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
});
