"use client";

// ==================== SWR Hook 组件 ==================== //

// ========== React、Next、Utils ========== //
import useSWR from "swr";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //
import { modelService } from "@/services/modelService";
import { sessionService } from "@/services/sessionService";

// 基础配置
const SWR_CONFIG = {
    revalidateOnReconnect: true, // 网络恢复重新请求
    shouldRetryOnError: true, // 失败自动重试
    errorRetryCount: 3, // 失败自动重试次数
    errorRetryInterval: 1000, // 失败重试间隔时间（毫秒）
    dedupingInterval: 2000, // 2秒内相同请求自动去重（避免重复调用接口）
    revalidateOnFocus: false, // 切回页面不重新请求
    refreshInterval: 0, // 关闭自动轮询
};

// 获取模型列表
export function useGetModelList() {
    const { data, error, isLoading } = useSWR(
        "/model/getList",
        async () => {
            return (await modelService.getModelList()).data;
        },
        {
            ...SWR_CONFIG,
            // revalidateOnFocus: true, // 切回页面重新请求
            fallbackData: [], // 初始兜底数据（防止首次渲染报错）
        },
    );
    return {
        fetchedModelList: data,
        fetchedModelListLoading: isLoading,
        fetchedModelListError: error,
    };
}

// 获取会话列表
export function useGetSessionList() {
    const { data, error, isLoading, mutate } = useSWR(
        "/session/getList",
        async () => {
            return (await sessionService.getSessionList()).data;
        },
        {
            ...SWR_CONFIG,
            revalidateOnFocus: true, // 切回页面重新请求
            fallbackData: [], // 初始兜底数据（防止首次渲染报错）
        },
    );
    return {
        fetchedSessionList: data,
        fetchedSessionListLoading: isLoading,
        fetchedSessionListError: error,
        refreshSessionList: mutate,
    };
}
