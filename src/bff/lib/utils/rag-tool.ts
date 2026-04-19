// ==================== RAG 工具封装 ==================== //

// ========== React、Next、Utils ========== //
import { Embeddings } from "@langchain/core/embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pipeline, env } from "@xenova/transformers";
import { PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";
// 获取数据库连接池对象
import dBPools from "@/bff/lib/db/initDB";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { EmbeddingsParams } from "@langchain/core/embeddings";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

//  ========== 全局常量定义 ========== //
/** 文本分块大小 */
const CHUNK_SIZE = 800;
/** 文本分块重叠长度 */
const CHUNK_OVERLAP = 80;
/** 默认检索返回条数 */
const DEFAULT_TOP_K = 3;
/** 特征提取模型 */
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
/** 零样本分类模型 */
const CLASSIFY_MODEL = "Xenova/distilbert-base-uncased-mnli";
/** 检索关键词匹配库 */
const RETRIEVAL_KEYWORDS = ["历史", "上下文", "之前", "刚才", "会话", "文档", "记录", "总结", "回忆", "上一句"];

//  ========== 类型接口定义 ========== //

// 会话文本存储参数
export interface StoreSessionParams {
    sessionId: string;
    docs: Array<{ content?: string }>;
}

// 智能检索分类参数
export interface ClassifyParams {
    userQuery: string;
    chatHistorys?: Array<{ role: string; content: string }>;
}

// 向量检索参数
export interface RetrieveParams {
    sessionId: string;
    userQuery: string;
    topK?: number;
}

// 智能聊天核心参数
export interface SmartChatParams {
    sessionId: string;
    userQuery: string;
    docs?: Array<{ content?: string }> | null;
    chatHistorys?: Array<{ role: string; content: string }>;
    hasDocHistorys?: any;
}

// 聊天接口返回结果
export interface ChatResult {
    sessionId: string;
    userQuery: string;
    needRetrieval: boolean;
    prompt: string;
}

//  ========== 本地嵌入模型实现 ========== //
// 继承 LangChain Embeddings 基类，适配向量数据库交互
// 基于 ONNX 本地模型 的文本向量生成类
class LocalOnnxEmbeddings extends Embeddings {
    private readonly model: any;

    constructor(model: any, params?: EmbeddingsParams) {
        super(params ?? {});
        this.model = model;
    }

    // 批量生成文档向量
    async embedDocuments(texts: string[]): Promise<number[][]> {
        return Promise.all(texts.map((text) => this.embedSingleText(text)));
    }

    // 生成查询文本向量
    async embedQuery(text: string): Promise<number[]> {
        return this.embedSingleText(text);
    }

    // 单文本向量生成核心逻辑
    private async embedSingleText(text: string): Promise<number[]> {
        const output = await this.model(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }
}

//  ========== RAG核心工具类 ========== //
// 功能：文本分块、向量生成、pgvector 存储与检索、智能上下文判断
export class NextBffRagTool {
    private isInitialized: boolean;
    private readonly textSplitter: RecursiveCharacterTextSplitter;
    private embeddingModel: any;
    private classifyModel: any;
    private embeddingsInstance!: LocalOnnxEmbeddings;

    constructor() {
        this.isInitialized = false;
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: CHUNK_SIZE,
            chunkOverlap: CHUNK_OVERLAP,
        });

        // 首次调用会下载模型，然后缓存
        env.remoteHost = "https://hf-mirror.com";
        env.allowRemoteModels = true;
        env.cacheDir = "./tmp/.cache";
    }

    //  全局初始化方法（单例执行）
    //  加载 AI 模型，避免重复初始化
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log("开始下载模型...");
            this.embeddingModel = await pipeline("feature-extraction", EMBEDDING_MODEL);
            this.classifyModel = await pipeline("zero-shot-classification", CLASSIFY_MODEL);
            console.log("模型下载成功");
            this.embeddingsInstance = new LocalOnnxEmbeddings(this.embeddingModel);
            this.isInitialized = true;
        } catch (error) {
            console.error("模型初始化失败", error);
            throw new Error(`模型初始化失败: ${(error as Error).message}`);
        }
    }

    // 预加载快捷方法
    public async preloadModels(): Promise<void> {
        await this.initialize();
    }

    //  调用数据库连接池
    private async getDatabaseClient(): Promise<PoolClient> {
        // 取业务库连接池
        const chatPool = dBPools.tai_rag_db;
        // 校验业务库连接池是否初始化
        if (!chatPool) {
            throw new Error("tai_rag_db 数据库连接池未初始化 ！");
        }
        // 声明连接变量
        let dbClient: PoolClient | null = null;

        dbClient = await chatPool.connect();
        return dbClient;
    }

    // 存储会话文本到向量数据库
    // 流程：文本清洗 → 分块 → 向量化 → 批量入库
    public async storeSessionText(params: StoreSessionParams) {
        const { sessionId, docs } = params;
        if (!sessionId || !Array.isArray(docs) || docs.length === 0) {
            throw new Error("sessionId 为必填项，text 必须为非空数组");
        }
        await this.initialize();

        const fullText = docs
            .map((item) => item?.content)
            .filter((content) => typeof content === "string" && content.trim())
            .join("\n\n");
        if (!fullText) {
            return { success: true, chunkCount: 0 };
        }

        const chunks = await this.textSplitter.splitText(fullText);
        const vectors = await this.embeddingsInstance.embedDocuments(chunks);

        const client = await this.getDatabaseClient();
        try {
            const values = chunks.map((chunk, index) => [uuidv4(), `[${vectors[index].join(",")}]`, JSON.stringify({ sessionId, text: chunk })]);
            const query = `
                INSERT INTO rag_vectors (id, vector, metadata)
                VALUES ${values.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}::vector, $${i * 3 + 3}::jsonb)`).join(", ")}
            `;
            await client.query(query, values.flat());
            return { success: true, chunkCount: chunks.length };
        } finally {
            // 关键：无论成功/失败，都释放连接
            if (client) {
                client.release();
            }
        }
    }

    // 智能判断是否需要检索上下文
    // 规则：关键词匹配 + AI 零样本分类
    public async classifyNeedRetrieval(params: ClassifyParams): Promise<boolean> {
        const { userQuery, chatHistorys = [] } = params;
        if (!userQuery) return false;

        if (RETRIEVAL_KEYWORDS.some((key) => userQuery.includes(key))) {
            return true;
        }

        await this.initialize();
        const context = `用户问题：${userQuery} | 历史对话：${JSON.stringify(chatHistorys)}`;
        const result = await this.classifyModel(context, ["需要检索上下文", "不需要检索"]);
        return result.labels[0] === "需要检索上下文";
    }

    // 向量相似度检索
    // 根据用户问题匹配当前会话最相关的上下文
    public async retrieveSessionContext(params: RetrieveParams): Promise<string[]> {
        const { sessionId, userQuery, topK = DEFAULT_TOP_K } = params;

        await this.initialize();
        const queryVector = await this.embeddingsInstance.embedQuery(userQuery);

        const client = await this.getDatabaseClient();
        try {
            const res = await client.query(
                `
                    SELECT metadata->>'text' AS text
                    FROM rag_vectors
                    WHERE metadata->>'sessionId' = $1
                    ORDER BY vector <-> $2::vector
                    LIMIT $3
                `,
                [sessionId, `[${queryVector.join(",")}]`, topK * 2],
            );

            return (
                res.rows
                    .map((row) => row.text)
                    .filter(Boolean)
                    .slice(0, topK) || []
            );
        } finally {
            // 关键：无论成功/失败，都释放连接
            if (client) {
                client.release();
            }
        }
    }

    // 检查当前会话是否存在向量数据
    // public async hasSessionVector(sessionId: string): Promise<boolean> {
    //     await this.initialize();
    //     const client = await this.getDatabaseClient();

    //     try {
    //         const res = await client.query("SELECT 1 FROM rag_vectors WHERE metadata->>'sessionId' = $1 LIMIT 1", [sessionId]);
    //         return res.rows.length > 0;
    //     } catch (error) {
    //         console.error("会话向量查询失败", error);
    //         return false;
    //     } finally {
    //         // 关键：无论成功/失败，都释放连接
    //         if (client) {
    //             client.release();
    //         }
    //     }
    // }

    // 清空指定会话的所有向量数据
    public async clearSession(sessionId: string) {
        const client = await this.getDatabaseClient();

        try {
            await client.query("DELETE FROM rag_vectors WHERE metadata->>'sessionId' = $1", [sessionId]);
            return { success: true, msg: "会话数据已清空" };
        } finally {
            // 关键：无论成功/失败，都释放连接
            if (client) {
                client.release();
            }
        }
    }

    // 核心对外接口：智能聊天
    // 整合存储、判断、检索全流程
    public async smartChat(params: SmartChatParams): Promise<ChatResult> {
        const { sessionId, userQuery, docs, chatHistorys = [], hasDocHistorys } = params;
        await this.initialize();

        // const hasVector = await this.hasSessionVector(sessionId);
        let needRetrieval: boolean;

        if (docs?.length) {
            needRetrieval = true;
            await this.storeSessionText({ sessionId, docs });
        } else if (!chatHistorys.length || !hasDocHistorys) {
            needRetrieval = false;
        } else {
            needRetrieval = await this.classifyNeedRetrieval(params);
        }
        const context = needRetrieval ? await this.retrieveSessionContext({ sessionId, userQuery }) : [];

        // 拼接大模型输入内容
        const promptDocs = context?.length ? `【参考文档】\n${context.map((item, i) => `文档片段${i + 1}：\n${item}`).join("\n\n")}\n\n` : "";
        const promptHistory = `【历史对话】\n${chatHistorys.map((h) => `【${h.role}】${h.content}`).join("\n")}\n\n`;
        const promptQuestion = `【用户问题】\n${userQuery}\n\n`;
        const ask = `请根据${promptDocs ? "参考文档和" : ""}历史对话，精准回答用户问题，不要编造。`;
        const prompt = `${promptDocs}${promptHistory}${promptQuestion}${ask}`;
        return { sessionId, needRetrieval, userQuery, prompt };
    }
}

//  ========== 单例导出 ========== //
// 全局单例实例
// 避免重复加载模型，提升性能
const nextRag = new NextBffRagTool();
export default nextRag;
