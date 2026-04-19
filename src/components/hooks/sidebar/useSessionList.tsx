"use client";

// ==================== 会话列表 Hook 组件 ==================== //

// ========== React、Next、Utils ========== //
import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// ========== Components、CSS ========== //
import { toast } from "sonner";
// ========== Icon、Type ========== //
import type { ChangeEvent, KeyboardEvent } from "react";
import type { Session } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
import { useCommonStore } from "@/store/useCommonStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useChatStore } from "@/store/useChatStore";
// ========== Hooks ========== //
// ========== Services ========== //
import { useGetSessionList } from "@/components/hooks/common/useSwrApi";
import { sessionService } from "@/services/sessionService";

export const useSessionList = () => {
    const setCommonModal = useCommonStore((state) => state.setCommonModal);
    const setIsSidebarMobileOpen = useCommonStore((state) => state.setIsSidebarMobileOpen);
    const sessionList = useSessionStore((state) => state.sessionList);
    const setSessionList = useSessionStore((state) => state.setSessionList);
    const currentSession = useSessionStore((state) => state.currentSession);
    const setCurrentSession = useSessionStore((state) => state.setCurrentSession);
    const editId = useSessionStore((state) => state.editId);
    const setEditId = useSessionStore((state) => state.setEditId);
    const editName = useSessionStore((state) => state.editName);
    const setEditName = useSessionStore((state) => state.setEditName);
    const resetEdit = useSessionStore((state) => state.resetEdit);
    const resetChat = useChatStore((state) => state.resetChat);
    const chat = useChatStore((state) => state.chat);

    const router = useRouter();
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const timerRef = useRef<NodeJS.Timeout[]>([]);

    const { fetchedSessionList, refreshSessionList } = useGetSessionList();

    // 清理所有定时器（防止内存泄漏）
    const clearAllTimers = () => {
        timerRef.current.forEach((timer) => clearTimeout(timer));
        timerRef.current = [];
    };

    // 组件卸载销毁定时器
    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    // 会话列表 状态存储
    useEffect(() => {
        if (fetchedSessionList) {
            setSessionList(fetchedSessionList);
        }
    }, [fetchedSessionList]);

    // 输入框获取焦点
    // 问题：输入框获取焦点时，会立马失去焦点
    // 原因：shadcn/ui 的下拉菜单关闭瞬间，会给父容器自动设置 aria-hidden="true"（无障碍机制），会强制清空父容器在的所有焦点
    // 解决办法：
    // 1 必须：<DropdownMenuContent> 设置 onCloseAutoFocus, 取消 自动聚焦弹窗关闭后 的默认行为（取消开启无障碍机制的行为）
    // 2 加强：延时菜单项的点击事件 handleSessionRenameClick 100ms 左右再进入编辑态，等菜单完全关闭，aria-hidden 自动移除（等开启的无障碍机制结束）
    useLayoutEffect(() => {
        if (!editId) return;
        const rafId = requestAnimationFrame(() => {
            const input = inputRefs.current.get(editId);
            if (input) {
                input.focus();
            }
        });
        return () => cancelAnimationFrame(rafId);
    }, [editId]);

    // 会话详情获取
    const handleSessionDetailClick = (sessionId: string): void => {
        // 如果有会话正在编辑重命名，则取消重命名状态
        if (editId) {
            handleSessionRenameCancel();
        }
        if (!sessionId) {
            toast.error("会话ID不存在");
            return;
        }
        // 关闭侧边栏（移动端）
        setIsSidebarMobileOpen(false);
        if (!currentSession || (currentSession && sessionId !== currentSession.id)) {
            resetChat(chat.model);
        }
        // 跳转到会话页面组件
        router.push(`/chat/${sessionId}`);
    };

    // 会话重命名点击
    const handleSessionRenameClick = (e: React.MouseEvent<HTMLDivElement>, session: Session): void => {
        e.stopPropagation();
        if (!session.id) {
            toast.error("会话ID不存在");
            return;
        }

        // 延时菜单项的点击事件 handleSessionRenameClick 100ms 左右再进入编辑态，等菜单完全关闭，aria-hidden 自动移除
        const timer = setTimeout(() => {
            setEditId(session.id);
            setEditName(session.title || "");
        }, 100);

        timerRef.current.push(timer);
    };

    // 会话重命名确认
    const handleSessionRenameConfirm = async (sessionId: string): Promise<void> => {
        if (!sessionId) {
            toast.error("会话ID不存在");
            return;
        }
        if (!editName.trim()) {
            toast.error("会话名不能设置为空");
            return;
        }

        try {
            // 更新会话名称
            await sessionService.updateSession(sessionId, { title: editName.trim().slice(0, 19) });
            toast.success("会话重命名成功");
            if (currentSession && sessionId === currentSession.id) {
                const res = await sessionService.getSession(sessionId);
                setCurrentSession(res.data);
            }
            resetEdit();
            refreshSessionList();
        } catch (error) {
            console.error(error);
            toast.error("会话重命名失败");
        }
    };

    // 会话重命名取消
    const handleSessionRenameCancel = (): void => {
        resetEdit();
        toast.info("会话重命名已取消");
    };

    // 会话删除点击
    const handleSessionDelClick = (e: React.MouseEvent<HTMLDivElement>, session: Session): void => {
        e.stopPropagation();
        if (!session.id) {
            toast.error("会话ID不存在");
            return;
        }
        // 打开删除弹窗
        setCommonModal({
            open: true,
            title: "删除对话",
            type: "error",
            description: (
                <>
                    确定删除对话 「{session.title}」吗?
                    <br />
                    <br />
                    此操作不可撤销，所有对话记录将被永久删除。
                </>
            ),
            confirmText: "删除",
            cancelText: "取消",
            onConfirm: () => {
                handleSessionDelConfirm(session.id);
            },
        });
    };

    // 会话删除确认
    const handleSessionDelConfirm = async (sessionId: string): Promise<void> => {
        if (!sessionId) {
            toast.error("会话ID不存在");
            return;
        }
        try {
            // 会话删除
            await sessionService.deleteSession(sessionId);
            toast.success("会话删除成功");
            if (currentSession && sessionId === currentSession.id) {
                router.push(`/`);
            }
            setCurrentSession(null);
            refreshSessionList();
        } catch (error) {
            console.error(error);
            toast.error("会话删除失败");
        }
    };

    // 手动安全关闭所有下拉菜单
    // 问题：如果前一个菜单没有关闭，在点击打开下一个菜单前，旧菜单不会关闭
    // 原因：shadcn/ui 的 DropdownMenu 组件默认独立管理自身展开 / 收起状态，多个 DropdownMenu 实例之间不会联动，因此点击新菜单的触发按钮时，旧菜单不会自动关闭。
    // 解决办法：
    // 触发 ESC 按键事件关闭菜单（shadcn/ui 原生支持 ESC 关闭，最稳妥），无副作用
    const handleAllDropdownMenusClose = (): void => {
        // 函数内部的局部临时对象，自动回收，无内存泄漏诱因
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "Escape",
                // bubbles: true, // 开启事件冒泡，这里是 按键事件，不需要设置
                cancelable: true, // 可取消事件，浏览器标准，兼容必备
            }),
        );
    };

    // 设置输入框 Refs
    const handleInputRefsSet = (el: HTMLInputElement | null, session: Session): void => {
        if (el) {
            inputRefs.current.set(session.id, el);
        } else {
            inputRefs.current.delete(session.id);
        }
    };
    // 输入框按键事件
    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>, session: Session): void => {
        if (e.key === "Enter") handleSessionRenameConfirm(session.id);
        if (e.key === "Escape") handleSessionRenameCancel();
    };

    // 输入框文本限制
    const handleInputTextChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (value.length > 20) {
            toast.warning("最多只能输入20个文字");
            setEditName(value.slice(0, 19));
        } else {
            setEditName(value);
        }
    };

    // 按创建时间分割会话列表
    const splitSessionsByTime = () => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const sessions7Days: Session[] = [];
        const sessions30Days: Session[] = [];
        const sessionsOlder: Session[] = [];

        sessionList.forEach((session) => {
            if (session.createTime) {
                const createTime = new Date(session.createTime);
                if (createTime >= sevenDaysAgo) {
                    sessions7Days.push(session);
                } else if (createTime >= thirtyDaysAgo) {
                    sessions30Days.push(session);
                } else {
                    sessionsOlder.push(session);
                }
            } else {
                // 没有创建时间的会话默认归为更早
                sessionsOlder.push(session);
            }
        });

        return { sessions7Days, sessions30Days, sessionsOlder };
    };

    return {
        currentSession,
        editId,
        editName,
        sessionList,
        setEditName,
        handleSessionDetailClick,
        handleSessionRenameClick,
        handleSessionRenameConfirm,
        handleSessionRenameCancel,
        handleSessionDelClick,
        handleAllDropdownMenusClose,
        handleInputRefsSet,
        handleInputKeyDown,
        handleInputTextChange,
        splitSessionsByTime,
    };
};
