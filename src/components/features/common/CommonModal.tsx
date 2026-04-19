"use client";

// ==================== 通用弹窗组件 ==================== //

// ========== React、Next、Utils ========== //
import { ReactNode } from "react";
// ========== Components、CSS ========== //
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// ========== Icon、Type ========== //
import { AlertCircle, CheckCircle, Info, LoaderCircle } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
// ========== Hooks ========== //
// ========== Services ========== //

export type ModalType = "success" | "error" | "warning" | "info"; // 弹窗类型

export interface CommonModalProps {
    // 受控显隐
    open: boolean;
    onOpenChange?: ((open: boolean) => void) | null;

    // 基础内容
    type?: ModalType;
    title?: string;
    // ReactNode，支持换行、标签、样式（不支持表格，可以在 children 用原生表格）
    description?: ReactNode;
    // 自定义内容
    children?: ReactNode;

    // 按钮配置
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    confirmLoading?: boolean;

    // 回调
    onConfirm?: (() => void | Promise<void>) | null;
    onCancel?: (() => void) | null;
}

export default function CommonModal() {
    const commonModal = useCommonStore((state) => state.commonModal);
    const setCommonModal = useCommonStore((state) => state.setCommonModal);
    const resetCommonModal = useCommonStore((state) => state.resetCommonModal);

    const { open, onOpenChange, type = "info", title, description, children, confirmText = "确定", cancelText = "取消", showCancel = true, confirmLoading = false, onConfirm, onCancel } = commonModal;

    // 根据类型自动匹配标题图标
    const renderIcon = (): ReactNode => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-6 w-6 text-[#166534]" />;
            case "error":
                return <AlertCircle className="h-6 w-6 text-[#FB2C36]" />;
            case "warning":
                return <Info className="h-6 w-6 text-[#F0B100]" />;
            case "info":
                return <Info className="h-6 w-6 text-[#052658]" />;
            default:
                return <Info className="h-6 w-6 text-[#052658]" />;
        }
    };

    // 处理确认
    const handleConfirm = async (): Promise<void> => {
        try {
            setCommonModal({ ...useCommonStore.getState().commonModal, confirmLoading: true });
            await onConfirm?.();
            setCommonModal({ ...useCommonStore.getState().commonModal, confirmLoading: false });
        } finally {
            // 默认自动关闭，如果需要关闭时进行其他操作，请设置 onOpenChange
            if (onOpenChange) {
                onOpenChange(false);
            } else {
                setCommonModal({ ...useCommonStore.getState().commonModal, open: false });
            }
        }
    };
    // 处理取消
    const handleCancel = (): void => {
        onCancel?.();

        // 默认自动关闭，如果需要关闭时进行其他操作，请设置 onOpenChange
        if (onOpenChange) {
            onOpenChange(false);
        } else {
            setCommonModal({ ...commonModal, open: false });
            resetCommonModal();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange || undefined}>
            <DialogContent
                className="md:max-w-100"
                // 隐藏标题右侧的关闭按钮
                showCloseButton={false}
                // 禁止外部点击关闭
                onInteractOutside={(e) => e.preventDefault()}
                // 禁止按 ESC 关闭
                onEscapeKeyDown={(e) => e.preventDefault()}
                // 取消打开时的默认聚焦行为
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="flex flex-col gap-6">
                    <DialogTitle className="flex items-center justify-start gap-3 md:max-w-80">
                        <div className="shrink-0">{renderIcon()}</div>
                        <div className="flex-1 truncate" title={title}>
                            {title}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="pb-2 text-gray-950">{description}</DialogDescription>
                </DialogHeader>

                {/* 自定义内容区域 */}
                {children && <div className="pb-2 text-gray-950">{children}</div>}
                <br />

                <DialogFooter className="flex items-center justify-end gap-2">
                    {/* 取消按钮 */}
                    {showCancel && (
                        <Button variant="ghost" onClick={handleCancel} disabled={confirmLoading} className="cursor-pointer">
                            {cancelText}
                        </Button>
                    )}

                    {/* 确认按钮（根据类型变色） */}
                    <Button variant={type === "error" ? "destructive" : "default"} disabled={confirmLoading} onClick={handleConfirm} className={`flex cursor-pointer gap-2 ${type !== "error" ? "bg-[#052658]" : ""}`}>
                        {/* 确认按钮加载中图标 */}
                        {confirmLoading && <LoaderCircle className="h-4! w-4! animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
