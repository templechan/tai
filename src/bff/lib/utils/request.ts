// ==================== BFF 请求工具封装（提供超时，重试等功能） ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { FETCH_CONFIG } from "@/bff/lib/constants/app";
// ========== Hooks ========== //
// ========== Services ========== //

type FetchBFFOptions = Omit<RequestInit, "body"> & {
    body?: Record<string, any>;
    timeout?: number;
    retryTimes?: number;
};

export async function request(
    url: string, // 接口路径，需要完整路径
    options: FetchBFFOptions = {},
): Promise<any> {
    const { timeout = FETCH_CONFIG.TIMEOUT, retryTimes = FETCH_CONFIG.RETRY_TIMES, body, headers = {}, ...restOptions } = options;

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
            signal: controller.signal,
        });

        // 响应校验
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`[模型请求失败] ${body?.model} API返回异常：${res.status} ${errorText}`);
        }

        return res;
    } catch (error) {
        // 重试逻辑（仅临时网络错误重试）
        if (retryTimes > 0 && (error as Error).name === "AbortError") {
            return request(url, { ...options, retryTimes: retryTimes - 1 });
        }
        throw new Error(`BFF 第三方服务异常: ${(error as Error).message}`);
    } finally {
        clearTimeout(timeoutId);
    }
}
