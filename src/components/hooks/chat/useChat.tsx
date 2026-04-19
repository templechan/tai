"use client";

// ==================== 会话页面 Hook 组件 ==================== //

// ========== React、Next、Utils ========== //
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { Chat, ChatHistory, Message } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //
import { sessionService } from "@/services/sessionService";
import { chatService } from "@/services/chatService";

export const useChat = () => {
    const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
    const isAutoSend = useChatStore((state) => state.isAutoSend);
    const setIsAutoSend = useChatStore((state) => state.setIsAutoSend);
    const setIsLoading = useChatStore((state) => state.setIsLoading);
    const setChat = useChatStore((state) => state.setChat);
    const resetChat = useChatStore((state) => state.resetChat);

    // 标记会话是否初始化完成
    const [isSessionInitialized, setIsSessionInitialized] = useState(false);
    const router = useRouter();
    // 用于中断请求的控制器 Ref（持久化存储，避免重渲染丢失）
    const abortControllerRef = useRef<AbortController | null>(null);
    const timerRef = useRef<NodeJS.Timeout[]>([]);

    // 从路由参数获取会话ID
    const params = useParams<{ sessionId: string }>();
    const sessionId = params.sessionId;

    // 清理所有定时器（防止内存泄漏）
    const clearAllTimers = () => {
        timerRef.current.forEach((timer) => clearTimeout(timer));
        timerRef.current = [];
    };

    // 初始化会话
    const initSession = async () => {
        try {
            // 从服务端获取会话详情
            const res = await sessionService.getSession(sessionId);
            setCurrentSession(res.data);
            setIsSessionInitialized(true); // 标记会话初始化完成

            // 模型赋值
            if (res.data.messages?.length) {
                // 优先选最后一条消息的模型
                const modelName = res.data.messages.slice(-1)[0].model;
                setChat({ ...useChatStore.getState().chat, model: modelName });
            }

            // 自动发送消息
            if (isAutoSend) {
                sendChatMessage();
            }
        } catch (error) {
            console.log("获取会话信息失败：", error);
            // 会话不存在时跳转到首页
            router.push("/");
            resetChat();
            setCurrentSession(null);
        }
    };

    // 中止请求
    const abortChatRequest = () => {
        const controller = abortControllerRef.current;
        if (controller && !controller.signal.aborted) {
            controller.abort();
        }
    };

    // 组件挂载时初始化会话
    useEffect(() => {
        if (!sessionId) return;
        initSession();
    }, []);

    // 组件卸载时中止所有未完成的请求
    useEffect(() => {
        return () => {
            abortChatRequest();
            clearAllTimers();
        };
    }, []);

    // 自动发送会话，首页跳转和重试场景使用，确保在会话初始化完成后发送，否者消息显示会重置
    useEffect(() => {
        if (isAutoSend && isSessionInitialized) {
            sendChatMessage();
        }
    }, [isAutoSend, isSessionInitialized]);

    // 发送聊天消息
    const sendChatMessage = async () => {
        // 清理旧请求：保证同一时间只有一个请求在执行
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        try {
            // 关闭自动发送开关（避免重复触发，这个开关主要是用于首页跳转的请求和重试功能）
            setIsAutoSend(false);
            // 创建新的中断控制器，用于本次请求
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            // 组装请求参数：从状态库获取当前会话和聊天配置
            let currentSession = useSessionStore.getState().currentSession;
            const chat = useChatStore.getState().chat;
            const chatParams: Chat = {
                ...chat,
                id: sessionId,
                // 转换会话消息为接口要求的格式
                chatHistorys:
                    currentSession?.messages?.map(
                        (msg) =>
                            ({
                                role: msg.role.trim(),
                                content: msg.content.trim(),
                            }) as ChatHistory,
                    ) || [],
                // 判断是否有文档关联的历史消息
                hasDocHistorys: !!currentSession?.messages?.some((item) => item.docs?.length > 0),
            };

            // 用户问题 UI 显示，异步保存
            const userMessage: Message = {
                id: uuidv4(),
                role: "user",
                model: chat.model,
                content: chat.content,
                createTime: new Date().toISOString(),
                docs: chat.docs,
            };

            if (currentSession) {
                setCurrentSession({
                    ...currentSession,
                    messages: [...(currentSession.messages || []), userMessage],
                });
                // 更新消息到服务端
                sessionService.updateSessionMessage(sessionId, { message: userMessage });
            }

            // AI回复 UI 显示，内容暂时为空
            currentSession = useSessionStore.getState().currentSession;
            const assistantMessage: Message = {
                id: uuidv4(),
                role: "assistant",
                model: chat.model,
                content: "", // 初始为空，后续流式填充
                createTime: new Date().toISOString(),
                docs: [],
            };
            if (currentSession) {
                setCurrentSession({
                    ...currentSession,
                    messages: [...(currentSession.messages || []), assistantMessage],
                });
            }

            // 流式返回读写器
            let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

            // 中止时的处理函数：取消流读取（等于告诉后端中断），主动保存已生成的AI消息
            const handleAbort = async () => {
                if (reader) {
                    reader?.cancel();
                }
                // 取到AI回复的内容，加上终止信息，更新会话消息到服务器
                currentSession = useSessionStore.getState().currentSession;
                const allMessages = currentSession?.messages;
                const lastMessage = allMessages!.at(-1);
                // 添加终止信息
                let abortMessage = "[已中止]";
                if (lastMessage!.content) {
                    abortMessage = "...\n\n" + abortMessage;
                }

                if (currentSession) {
                    setCurrentSession({
                        ...currentSession,
                        messages: currentSession.messages?.map((item, idx, arr) =>
                            // 只更新最后一条（AI回复）的内容
                            idx === arr.length - 1 ? { ...item, content: item.content + abortMessage } : item,
                        ),
                    });
                }

                // 更新会话消息到服务端
                lastMessage!.content += abortMessage;
                if (lastMessage && chatParams.id) {
                    sessionService.updateSessionMessage(chatParams.id, { message: lastMessage });
                }
            };

            // 监听中止信号，触发流取消逻辑
            abortController.signal.addEventListener("abort", handleAbort);

            // 重置聊天输入状态，发送按钮标记加载中
            resetChat(chat.model);
            // 延迟500ms，确保请求以生成
            const timer = setTimeout(() => {
                setIsLoading(true);
            }, 500);
            timerRef.current.push(timer);

            // 发送请求：调用聊天服务，传入中断信号
            const res = await chatService.sendChat({
                chatParams: chatParams,
                signal: abortController.signal,
            });

            // 处理流式返回：逐段读取AI回复并更新UI
            reader = res.body.getReader();
            // 解码二进制流为字符串
            const decoder = new TextDecoder("utf-8");

            // 循环读取流式数据
            while (true) {
                // 若请求已中止，直接退出循环
                if (abortController.signal.aborted) break;

                try {
                    const { done, value } = await reader!.read();
                    // 流读取完成或请求中止，退出循环
                    if (done || abortController.signal.aborted) break;

                    // 实时更新AI回复内容（只修改最后一条AI消息）
                    currentSession = useSessionStore.getState().currentSession;
                    if (currentSession) {
                        setCurrentSession({
                            ...currentSession,
                            messages: currentSession.messages?.map((item, idx, arr) =>
                                // 只更新最后一条（AI回复）的内容
                                idx === arr.length - 1 ? { ...item, content: item.content + decoder.decode(value) } : item,
                            ),
                        });
                    }
                } catch (readError) {
                    console.error("流式读取异常：", readError);
                    break;
                }
            }

            // 清理中止监听事件
            abortController.signal.removeEventListener("abort", handleAbort);
        } catch (error) {
            // 忽略主动中止的错误，仅打印其他异常
            if (error instanceof DOMException && error.name === "AbortError") {
                console.log("聊天请求已主动中止");
            } else {
                console.error("发送聊天消息失败：", error);
            }
        } finally {
            // 无论成功/失败，都标记加载结束，清理控制器
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // 返回给组件的方法
    return {
        sendChatMessage, // 发送消息方法
        abortChatRequest, // 中止请求方法
        sessionId, // 当前会话ID
    };
};
