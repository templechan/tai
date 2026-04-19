"use client";

// ==================== 文档预览组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function DocPreview() {
    const previewDoc = useCommonStore((state) => state.previewDoc);
    const isPreviewDocOpen = useCommonStore((state) => state.isPreviewDocOpen);
    const setIsPreviewDocOpen = useCommonStore((state) => state.setIsPreviewDocOpen);

    return (
        <Dialog open={isPreviewDocOpen} onOpenChange={setIsPreviewDocOpen}>
            <DialogContent className="flex h-[80vh] w-[90vw] max-w-[90vw]! flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <Image src={previewDoc ? `/assets/images/fileIcons/${previewDoc?.fileType}.png` : "/assets/images/logo.png"} alt="" width={20} height={20} priority />
                        <span className="w-[60vw] truncate text-base text-gray-900" title={previewDoc?.fileName}>
                            {previewDoc?.fileName}
                        </span>
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-0 break-all">
                    <pre className="rounded-md border border-gray-200 bg-white px-4 py-2 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 shadow-sm">{previewDoc?.content || "文件内容为空"}</pre>
                </div>
            </DialogContent>
        </Dialog>
    );
}
