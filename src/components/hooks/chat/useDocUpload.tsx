"use client";

// ==================== 文件上传按钮 Hook 组件 ==================== //

// ========== React、Next、Utils ========== //
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatFileSize } from "@/lib/utils/common-tools";
// 解析工具核心
import { browserParser, type ParseResult } from "@/lib/utils/universal-file-parser";
// ========== Components、CSS ========== //
import { toast } from "sonner";
// ========== Icon、Type ========== //
import type { Document } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export const useDocUpload = () => {
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const setCommonModal = useCommonStore((state) => state.setCommonModal);
    const setChat = useChatStore((state) => state.setChat);
    const setIsDocUploaded = useChatStore((state) => state.setIsDocUploaded);

    // 最大文件上传数量
    const MAX_FILE_NUM = 5;

    // 文件上传处理
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsParsing(true);
        setIsDocUploaded(false); // 发送按钮不能点击
        // toast.info("文件上传中，请稍等...");

        try {
            // 1. 仅校验文件数量（大小/格式/空文件 由解析工具内部统一校验）
            if (files.length > MAX_FILE_NUM || useChatStore.getState().chat.docs.length >= MAX_FILE_NUM) {
                toast.error(`文件上传失败，最多支持上传 ${MAX_FILE_NUM} 个文件`);
                return;
            }

            const successResults: ParseResult[] = [];
            const errorMap: Record<string, string> = {};

            // 2. 遍历所有文件，执行解析
            for (const file of files) {
                // 调用解析工具
                const result = await browserParser.parse(file);

                // 分类收集结果/错误
                if (result.success) {
                    successResults.push(result);
                } else {
                    errorMap[file.name] = result.error!;
                }
            }

            // 3. 更新到 会话请求状态 中
            setChat({
                ...useChatStore.getState().chat,
                docs: [
                    ...useChatStore.getState().chat.docs,
                    ...successResults.map((result: ParseResult) => {
                        const doc = {
                            id: uuidv4(),
                            fileName: result.file.name,
                            fileType: result.fileType,
                            sizeText: formatFileSize(result.file.size),
                            content: result.text,
                            uploadTime: new Date().toISOString(),
                        } as Document;
                        return doc;
                    }),
                ],
            });

            // 4. 有上传错误的文件，弹窗展示告知
            const errorNums = Object.keys(errorMap).length;
            if (errorNums) {
                toast.warning(`文件上传结束，${files.length - errorNums} 个上传成功，${errorNums} 个上传失败，请查看原因`);
                // 打开上传错误文件信息弹窗
                setCommonModal({
                    open: true,
                    title: "部分文件上传失败信息",
                    type: "error",
                    children: (
                        <div className="mt-2 w-full rounded-md border border-gray-200">
                            {/* 关键：table-layout:fixed 固定布局，强制适配容器宽度 */}
                            <table className="table-layout-fixed w-full border-collapse text-left text-sm">
                                {/* 表头 */}
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="w-2/5 px-3 py-2 font-medium">文件名</th>
                                        <th className="w-3/5 px-3 py-2 font-medium">错误信息</th>
                                    </tr>
                                </thead>

                                {/* 表体 */}
                                <tbody className="divide-y divide-gray-200">
                                    {Object.entries(errorMap).map(([fileName, errorMsg]) => (
                                        <tr key={fileName} className="bg-white transition-colors hover:bg-gray-50">
                                            {/* 文件名：移除截断，自动换行，长文本拆分 */}
                                            <td className="px-3 py-2 break-all whitespace-normal text-gray-900">{fileName}</td>
                                            {/* 错误信息：自动换行，红色高亮 */}
                                            <td className="px-3 py-2 break-all whitespace-normal text-red-500">{errorMsg}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ),
                    confirmText: "确认",
                    showCancel: false,
                });
            } else {
                toast.success("文件上传完成");
            }
        } catch (err) {
            console.error("文件处理失败:", err);
            toast.error("文件处理失败，请重试");
        } finally {
            setIsParsing(false);
            setIsDocUploaded(true);
            e.target.value = "";
        }
    };

    return {
        handleFileUpload,
        isParsing,
        MAX_FILE_NUM,
    };
};
