"use client";

// ==================== 通用状态 ==================== //

// ========== React、Next、Utils ========== //
import { create } from "zustand";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { ModalType, CommonModalProps } from "@/components/features/common/CommonModal";
import type { Document } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

interface CommonStore {
    // 侧边栏
    collapsed: boolean;
    isSidebarMobileOpen: boolean;
    setCollapsed: (collapsed: boolean) => void;
    setIsSidebarMobileOpen: (collapsed: boolean) => void;
    // 通用弹窗
    commonModal: CommonModalProps;
    setCommonModal: (commonModal: CommonModalProps) => void;
    resetCommonModal: () => void;
    // 文档预览
    previewDoc: Document | null;
    isPreviewDocOpen: boolean;
    setPreviewDoc: (previewDoc: Document | null) => void;
    setIsPreviewDocOpen: (isPreviewDocOpen: boolean) => void;
}

const initialState = {
    // 侧边栏
    collapsed: false,
    isSidebarMobileOpen: false,
    // 通用弹窗
    commonModal: {
        open: false,
        onOpenChange: null,
        type: "info" as ModalType,
        title: "",
        description: "",
        children: null,
        confirmText: "确定",
        cancelText: "取消",
        showCancel: true,
        confirmLoading: false,
        onConfirm: null,
        onCancel: null,
    },
    // 文档预览
    previewDoc: null,
    isPreviewDocOpen: false,
};

export const useCommonStore = create<CommonStore>((set) => ({
    ...initialState,
    // 侧边栏
    setCollapsed: (collapsed: boolean) => set({ collapsed: collapsed }),
    setIsSidebarMobileOpen: (isSidebarMobileOpen: boolean) => set({ isSidebarMobileOpen: isSidebarMobileOpen }),
    // 通用弹窗
    setCommonModal: (commonModal: CommonModalProps) => set({ commonModal: commonModal }),
    resetCommonModal: () => set({ commonModal: initialState.commonModal }),
    // 文档预览
    setPreviewDoc: (previewDoc: Document | null) => set({ previewDoc: previewDoc }),
    setIsPreviewDocOpen: (isPreviewDocOpen: boolean) => set({ isPreviewDocOpen: isPreviewDocOpen }),
}));
