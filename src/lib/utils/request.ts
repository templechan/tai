"use client";

// ==================== 客户端请求工具封装（提供超时等功能，兼容 后端接口 和 Next BFF 接口） ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { FETCH_CONFIG } from "@/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //

type FetchClientOptions = Omit<RequestInit, "body"> & {
    body?: Record<string, any>;
    timeout?: number;
    isBFF?: boolean;
    signal?: AbortSignal;
};

export async function request(
    path: string, // 接口路径，不带域名、前缀
    options: FetchClientOptions = {},
): Promise<any> {
    const {
        timeout = FETCH_CONFIG.TIMEOUT,
        isBFF = false, // 默认走正常后端接口
        signal = null,
        body,
        headers = {},
        ...restOptions
    } = options;

    const url = !isBFF ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${FETCH_CONFIG.PREFIX}${path}` : `${FETCH_CONFIG.BFF_PREFIX}${path}`;

    // 封装超时逻辑
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, {
            ...restOptions,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: signal ? signal : controller.signal,
        });

        if (!res.ok) throw new Error(`请求失败：${res.status} ${res.statusText}`);

        return res;
    } catch (error) {
        throw new Error((error as Error).message);
    } finally {
        clearTimeout(timeoutId);
    }
}
