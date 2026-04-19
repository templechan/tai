"use client";

// ==================== 侧边栏组件（移动端） ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import SessionList from "@/components/features/sidebar/SessionList";
// ========== Icon、Type ========== //
import { PanelLeft } from "lucide-react";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useSessionStore } from "@/store/useSessionStore";
// ========== Hooks ========== //
// ========== Services ========== //

export default function SidebarMobile() {
    const isSidebarMobileOpen = useCommonStore((state) => state.isSidebarMobileOpen);
    const setIsSidebarMobileOpen = useCommonStore((state) => state.setIsSidebarMobileOpen);
    const editId = useSessionStore((state) => state.editId);
    const resetEdit = useSessionStore((state) => state.resetEdit);

    // 受控抽屉隐藏操作
    const handleSidebarMobileClose = (isOpen: boolean): void => {
        // 抽屉隐藏后，取消重命名状态
        if (editId && !isOpen) {
            resetEdit();
            toast.info("会话重命名已取消");
        }
        // 设置受控抽屉状态
        setIsSidebarMobileOpen(isOpen);
    };

    return (
        // autoFocus：禁止抽屉隐藏后，抽屉按钮获取焦点
        <Drawer direction="left" open={isSidebarMobileOpen} onOpenChange={(isOpen) => handleSidebarMobileClose(isOpen)} autoFocus={false}>
            <DrawerTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6 cursor-pointer">
                    <PanelLeft className="h-6! w-6!" />
                </Button>
            </DrawerTrigger>
            {/* h-dvh!，防止输入法自动关闭时，SessionList 高度没有自适应占满屏幕 */}
            {/* 取消 ESC 关闭抽屉，兼容会话列表组件 SessionList */}
            <DrawerContent className="h-dvh! rounded-none!" onEscapeKeyDown={(e) => e.preventDefault()}>
                <DrawerTitle />
                <DrawerDescription />
                <SessionList />
            </DrawerContent>
        </Drawer>
    );
}
