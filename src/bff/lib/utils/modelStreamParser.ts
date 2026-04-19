// ==================== 流式解析器工厂 ==================== //

// ==================== 大模型流式响应解析器工厂 ==================== //
// 作用：集中管理不同模型的流式响应解析逻辑，统一输出格式
// 扩展新模型：仅需实现对应解析器函数，并加入 parserMap 映射

import { SupportedModel } from "@/bff/lib/db/modelConfig";

/**
 * 解析器统一返回格式
 * @property content 解析出的纯文本片段
 * @property done 是否解析完成（[DONE]标识）
 */
export interface StreamParserResult {
    content: string; // 前端需要的纯文本内容
    done: boolean; // 是否结束解析
}

/**
 * 解析器函数接口（所有模型解析器必须遵循该接口）
 * @param chunk 流式返回的二进制数据块
 * @param decoder 文本解码器（复用避免重复创建）
 * @returns 解析结果数组（单chunk可能包含多个消息行）
 */
export type StreamParser = (chunk: Uint8Array, decoder: TextDecoder) => StreamParserResult[];

// ==================== 各模型解析器实现（隔离不同模型的解析逻辑） ==================== //

/**
 * DeepSeek 流式解析器（适配原有逻辑）
 * DeepSeek响应格式：data: {"choices":[{"delta":{"content":"xxx"}}]}
 */
const deepseekParser: StreamParser = (chunk, decoder) => {
    const results: StreamParserResult[] = [];
    // 解码二进制数据为字符串（stream: true 保留未完成的字符）
    const chunkStr = decoder.decode(chunk, { stream: true });
    // 按行分割（流式响应每行是一个消息）
    const lines = chunkStr.split("\n").filter((line) => line.trim() !== "");

    // console.log("lines", lines);

    for (const line of lines) {
        // 过滤非data开头的行（避免空行/注释行）
        if (!line.startsWith("data: ")) continue;
        // 移除前缀，获取纯JSON字符串
        const data = line.replace("data: ", "");

        // 处理结束标识
        if (data === "[DONE]") {
            results.push({ content: "", done: true });
            continue;
        }

        // 解析JSON并提取内容（异常容错）
        try {
            const json = JSON.parse(data);
            // 解析关键
            const content = json.choices?.[0]?.delta?.content || "";
            results.push({ content, done: false });
        } catch (e) {
            console.error(`[DeepSeek解析异常] ${(e as Error).message}，原始数据：${data}`);
            results.push({ content: "", done: false }); // 解析失败返回空内容，不中断流
        }
    }
    return results;
};

/**
 * 豆包流式解析器（适配豆包实际响应格式）
 * 豆包响应格式示例：data: {"delta":{"content":"xxx"}}
 */
const doubaoParser: StreamParser = (chunk, decoder) => {
    const results: StreamParserResult[] = [];
    const chunkStr = decoder.decode(chunk, { stream: true });
    const lines = chunkStr.split("\n").filter((line) => line.trim() !== "");

    // console.log("lines", lines);

    for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.replace("data: ", "");

        if (data === "[DONE]") {
            results.push({ content: "", done: true });
            continue;
        }

        try {
            const json = JSON.parse(data);
            // 解析关键
            const content = json.choices?.[0]?.delta?.content || "";
            results.push({ content, done: false });
        } catch (e) {
            console.error(`[豆包解析异常] ${(e as Error).message}，原始数据：${data}`);
            results.push({ content: "", done: false });
        }
    }
    return results;
};

/**
 * 千问流式解析器（适配千问实际响应格式）
 * 千问响应格式示例：data: {"output":{"text":"xxx"}}
 */
const qwenParser: StreamParser = (chunk, decoder) => {
    const results: StreamParserResult[] = [];
    const chunkStr = decoder.decode(chunk, { stream: true });
    const lines = chunkStr.split("\n").filter((line) => line.trim() !== "");

    // console.log("lines", lines);

    for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.replace("data: ", "");

        if (data === "[DONE]") {
            results.push({ content: "", done: true });
            continue;
        }

        try {
            const json = JSON.parse(data);
            // 解析关键
            const content = json.choices?.[0]?.delta?.content || "";
            results.push({ content, done: false });
        } catch (e) {
            console.error(`[千问解析异常] ${(e as Error).message}，原始数据：${data}`);
            results.push({ content: "", done: false });
        }
    }
    return results;
};

/**
 * 解析器工厂函数（根据模型类型获取对应解析器）
 * @param model 模型类型
 * @returns 该模型对应的解析器函数
 * @throws 未实现解析器时抛出错误
 */
export const getStreamParser = (model: SupportedModel): StreamParser => {
    // 解析器映射表（新增模型时，只需在这里添加映射）
    const parserMap: Record<SupportedModel, StreamParser> = {
        "deepseek-chat": deepseekParser,
        "doubao-seed-2-0-pro-260215": doubaoParser,
        "qwen3.6-plus-2026-04-02": qwenParser,
    };

    const parser = parserMap[model];
    if (!parser) {
        throw new Error(`[解析器异常] 未实现 ${model} 的流式解析器，请检查 modelStreamParser.ts`);
    }
    return parser;
};
