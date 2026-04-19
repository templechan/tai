"use client";

// ==================== 模型选择组件 ==================== //

// ========== React、Next、Utils ========== //
import { useEffect } from "react";
// ========== Components、CSS ========== //
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// ========== Icon、Type ========== //
import type { Model } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useModelStore } from "@/store/useModelStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //
import { useGetModelList } from "@/components/hooks/common/useSwrApi";

export default function ChatModelSelector() {
    const modelList = useModelStore((state) => state.modelList);
    const setModelList = useModelStore((state) => state.setModelList);
    const chat = useChatStore((state) => state.chat);
    const setChat = useChatStore((state) => state.setChat);

    const { fetchedModelList } = useGetModelList();

    // 模型自动赋值
    const setCurrentModelByChatData = () => {
        if (fetchedModelList?.length) {
            if (!chat.model) {
                // 无选中模型时，默认选中第一个
                setChat({ ...useChatStore.getState().chat, model: fetchedModelList[0].name });
            } else {
                const isExist = useModelStore.getState().modelList.some((model: Model) => model.name === chat.model);
                setChat({ ...useChatStore.getState().chat, model: isExist ? chat.model : fetchedModelList[0].name });
            }
        }
    };

    // 模型列表 状态存储
    useEffect(() => {
        if (!fetchedModelList) return;
        setModelList(fetchedModelList);
    }, [fetchedModelList]);

    useEffect(() => {
        setCurrentModelByChatData();
    }, [fetchedModelList, chat.model]);

    // 获取当前模型配置（本项目是开启了 React Compiler，会自动 useMemo/useCallback 优化）
    const getCurrentModelByChatData = (modelName: string): Model | undefined => {
        return modelList?.find((model: Model) => model.name === modelName);
    };

    return (
        <Select value={chat.model || ""} onValueChange={(name) => setChat({ ...chat, model: name })}>
            <SelectTrigger className="flex w-35 cursor-pointer items-center px-2 py-4" autoFocus={false}>
                <SelectValue>
                    <Image className="rounded-sm" src={chat.model ? `/assets/images/modelIcons/${chat.model}.png` : "/assets/images/logo.png"} alt="" width={24} height={24} priority />
                    <span className="font-medium text-gray-900">{getCurrentModelByChatData(chat.model)?.label}</span>
                </SelectValue>
            </SelectTrigger>

            <SelectContent className="w-60 px-1" position="popper" side="top" sideOffset={0} align="start" alignOffset={0} autoFocus={false}>
                {modelList?.map((model) => (
                    <SelectItem className="m-1 cursor-pointer px-5 py-2" key={model.name} value={model.name || ""}>
                        <div className="mr-4 flex w-full items-start gap-2">
                            <Image className="mt-1 rounded-sm" src={chat.model ? `/assets/images/modelIcons/${model.name}.png` : "/assets/images/logo.png"} alt="" width={24} height={24} priority />
                            <div className="flex flex-col">
                                <span className="flex h-6 items-center font-medium text-gray-900">{model.label}</span>
                                <span className="text-xs text-gray-500!">{model.description}</span>
                            </div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
