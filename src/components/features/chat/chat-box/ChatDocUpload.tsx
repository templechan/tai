"use client";

// ==================== 文件上传按钮组件 ==================== //
// 支持 PDF/DOCX/TXT/MD 纯前端本地解析
// 文件限制最多3个，单文件 ≤ 100MB，自动校验大小/格式/空文件
// 内存安全，配合解析工具自动释放资源，无内存泄漏

// ========== React、Next、Utils ========== //
import { useRef } from "react";
// ========== Components、CSS ========== //
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// ========== Icon、Type ========== //
import { Paperclip, LoaderCircle } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useChatStore } from "@/store/useChatStore";
import { MAX_FILE_SIZE } from "@/lib/utils/universal-file-parser";
// ========== Hooks ========== //
import { useDocUpload } from "@/components/hooks/chat/useDocUpload";
// ========== Services ========== //

export default function ChatDocUpload() {
    const isSendLoading = useChatStore((state) => state.isLoading);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { handleFileUpload, isParsing, MAX_FILE_NUM } = useDocUpload();

    return (
        <>
            <input className="hidden" ref={fileInputRef} multiple type="file" accept=".pdf,.docx,.txt,.md" disabled={isParsing} onChange={handleFileUpload} />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button className="h-8 w-8 cursor-pointer rounded-full" variant="ghost" disabled={isParsing || isSendLoading} onClick={() => fileInputRef.current?.click()}>
                        {isParsing ? <LoaderCircle className="h-5! w-5! animate-spin" /> : <Paperclip className="h-5! w-5!" />}
                    </Button>
                </TooltipTrigger>

                <TooltipContent className="flex flex-col items-start">
                    <p>上传附件（仅识别文字）</p>
                    <p>
                        最多 {MAX_FILE_NUM} 个，每个 {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB，支持 .txt、.md、.docx、.pdf 文本文件
                    </p>
                </TooltipContent>
            </Tooltip>
        </>
    );
}
