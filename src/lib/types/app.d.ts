// ==================== 客户端全局TS类型 ==================== //

// 模型类型
export interface Model {
    name?: string;
    label?: string;
    description?: string;
    apiKeyKey?: string;
    chatApiUrl?: string;
    parserType?: string;
    requestOptions?: string;
    enabled?: number;
}

// 会话类型
export interface Session {
    id: string;
    title: string;
    createTime: string;
    messages: Message[];
}

// 对话消息类型
export interface Message {
    id: string;
    role: "user" | "assistant";
    model: string;
    content: string;
    createTime: string;
    docs: Document[];
}

// 文档类型
export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    sizeText: string;
    content: string;
    uploadTime: string;
}

// 会话请求类型
export interface Chat {
    id: string;
    model: string;
    content: string;
    chatHistorys: ChatHistory[];
    docs: Document[];
    hasDocHistorys: boolean;
}

// 对话历史类型
export interface ChatHistory {
    role: "user" | "assistant";
    content: string;
}
