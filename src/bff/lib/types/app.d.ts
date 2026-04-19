// ==================== BBF全局TS类型 ==================== //

// 模型类型
export interface ModelBFF {
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
export interface SessionBFF {
    id?: string;
    title: string;
    createTime?: string;
    messages?: MessageBFF[];
}

// 对话消息类型
export interface MessageBFF {
    id: string;
    role: "user" | "assistant";
    model: string;
    content: string;
    createTime: string;
    docs: DocumentBFF[];
}

// 文档类型
export interface DocumentBFF {
    id: string;
    fileName: string;
    fileType: string;
    sizeText: string;
    content: string;
    uploadTime: string;
}

// 会话请求类型
export interface ChatBFF {
    id: string;
    model: string;
    content: string;
    chatHistorys: ChatHistoryBFF[];
    docs: DocumentBFF[];
    hasDocHistorys: boolean;
}

// 对话历史类型
export interface ChatHistoryBFF {
    role: "user" | "assistant";
    content: string;
}

// 大模型会话请求类型
export interface ModelChatBFF {
    model: string;
    chatApiUrl: string;
    apiKey: string;
    content: string;
}
