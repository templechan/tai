"use client";

// ==================== 文件列表展示组件 ==================== //

// ========== React、Next、Utils ========== //
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
// ========== Components、CSS ========== //
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// ========== Icon、Type ========== //
import { X } from "lucide-react";
import type { Document } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function ChatDocShow({ messageDocs }: { messageDocs?: Document[] }) {
    const [docs, setDocs] = useState<Document[]>([]);
    const setPreviewDoc = useCommonStore((state) => state.setPreviewDoc);
    const setIsPreviewDocOpen = useCommonStore((state) => state.setIsPreviewDocOpen);
    const chat = useChatStore((state) => state.chat);
    const setChat = useChatStore((state) => state.setChat);
    const docShowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 异步包裹 setState，彻底解决级联渲染报错
        Promise.resolve().then(() => {
            // 有 messageDocs 用它，没有就用 chat.docs，兜底空数组
            const finalDocs = messageDocs || chat?.docs || [];
            setDocs(finalDocs);
        });
    }, [messageDocs, chat]);

    // 滚动控制颠倒
    useEffect(() => {
        const el = docShowRef.current;
        if (el) {
            const handleWheel = (e: any) => {
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            };
            el.addEventListener("wheel", handleWheel);
            return () => el.removeEventListener("wheel", handleWheel);
        }
    }, []);

    // 预览临时上传文档
    const previewTempDoc = (doc: Document) => {
        setPreviewDoc(doc);
        setIsPreviewDocOpen(true);
    };

    // 删除临时上传文件
    const removeTempDoc = (e: any, docId: string) => {
        e.stopPropagation();

        setChat({
            ...useChatStore.getState().chat,
            docs: useChatStore.getState().chat.docs.filter((doc: Document) => doc.id !== docId),
        });
    };

    return (
        <div className={`${!docs.length && "hidden"} flex max-w-full gap-2 overflow-x-auto pb-1`} ref={docShowRef}>
            {docs?.map((doc: Document) => (
                <Tooltip key={doc.id}>
                    <TooltipTrigger asChild>
                        <div className="relative flex w-46 cursor-pointer items-center justify-start gap-2 rounded-sm bg-gray-100 py-1 pr-5 pl-3" title="点击预览文件" onClick={() => previewTempDoc(doc)}>
                            <Image src={`/assets/images/fileIcons/${doc.fileType}.png`} alt="" width={18} height={18} priority />

                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm text-gray-900">{doc.fileName}</span>

                                <span className="text-xs text-gray-500">
                                    {doc.fileType} · {doc.sizeText}
                                </span>
                            </div>
                            {!messageDocs ? (
                                <>
                                    <div className="absolute top-1 right-1 cursor-pointer" onClick={(e) => removeTempDoc(e, doc.id)} title="删除文件">
                                        <X size={12} />
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col items-start gap-1">
                        <p>文件ID：{doc.id}</p>
                        <p>文件名：{doc.fileName}</p>
                        <p>类型：{doc.fileType}</p>
                        <p>大小：{doc.sizeText}</p>
                        {/* <p>上传时间：{dayjs(doc.uploadTime).fromNow()}</p> */}
                        <p>上传时间：{dayjs(doc.uploadTime).format("YYYY-MM-DD HH:mm")}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}
