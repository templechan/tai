"use client";

// ==================== 会话列表组件 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// ========== Icon、Type ========== //
import { Bot, Check, MoreHorizontal, X } from "lucide-react";
import type { Session } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
import { useSessionList } from "@/components/hooks/sidebar/useSessionList";
// ========== Services ========== //

export default function SessionList() {
    // 从业务Hook中引入相关属性和方法
    const { currentSession, editId, editName, sessionList, handleSessionDetailClick, handleSessionRenameClick, handleSessionRenameConfirm, handleSessionRenameCancel, handleSessionDelClick, handleAllDropdownMenusClose, handleInputRefsSet, handleInputKeyDown, handleInputTextChange, splitSessionsByTime } = useSessionList();
    const { sessions7Days, sessions30Days, sessionsOlder } = splitSessionsByTime();

    // 渲染会话列表的函数
    const renderSessionItem = (session: Session) => (
        <div key={session.id} className="relative">
            {/* 单会话正常显示 */}
            <div className={` ${editId === session.id ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"} ${session.id === currentSession?.id ? "bg-blue-100 text-[#052658]" : "hover:bg-gray-200"} flex h-11 cursor-pointer items-center justify-between rounded-lg pr-2 pl-3`} onClick={() => handleSessionDetailClick(session.id)}>
                <div className="flex-1 truncate text-sm" title={session.title}>
                    {session.title}
                </div>
                <DropdownMenu onOpenChange={handleAllDropdownMenusClose}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8! w-7! cursor-pointer rounded-xl text-[#052658] hover:bg-gray-300"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <MoreHorizontal className="h-4! w-4!" />
                        </Button>
                    </DropdownMenuTrigger>

                    {/* onCloseAutoFocus 取消自动聚焦弹窗关闭后的默认行为 */}
                    <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                        <DropdownMenuItem className="cursor-pointer" onClick={(e) => handleSessionRenameClick(e, session)}>
                            重命名
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600" onClick={(e) => handleSessionDelClick(e, session)}>
                            删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 会话重命名框显示 */}
            <div className={`${editId === session.id ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} absolute top-0 left-0 my-0.5 rounded-lg border-2 border-[#052658] pr-2`}>
                <ButtonGroup className="flex items-center justify-between">
                    <Input className="h-9 border-0 border-[#052658]/20 pr-2 pl-4 focus:border-[#052658]/20 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none" ref={(el) => handleInputRefsSet(el, session)} value={editName} onChange={handleInputTextChange} onKeyDown={(e) => handleInputKeyDown(e, session)} />
                    <Button size="icon" variant="ghost" className="mr-1 h-4 w-4 cursor-pointer text-[#166534]" onClick={() => handleSessionRenameConfirm(session.id)}>
                        <Check className="h-4! w-4!" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-4 w-4 cursor-pointer text-[#FB2C36]" onClick={handleSessionRenameCancel}>
                        <X className="h-4! w-4!" />
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    );

    return (
        // Tailwind CSS 规则：calc 里不能有空格
        <div className="flex h-full flex-col overflow-x-hidden overflow-y-auto pr-2 pb-2 pl-3 md:h-[calc(100%-64px)]">
            {sessionList?.length ? (
                <>
                    {/* 7天内会话 */}
                    {sessions7Days.length > 0 && (
                        <div className="mt-7 mb-2">
                            <h3 className="pb-2 pl-3 text-xs font-semibold text-[#052658] uppercase">7天内</h3>
                            {sessions7Days.map(renderSessionItem)}
                        </div>
                    )}

                    {/* 30天内会话 */}
                    {sessions30Days.length > 0 && (
                        <div className="mt-5 mb-2">
                            <h3 className="pb-2 pl-3 text-xs font-semibold text-[#052658] uppercase">30天内</h3>
                            {sessions30Days.map(renderSessionItem)}
                        </div>
                    )}

                    {/* 更早会话 */}
                    {sessionsOlder.length > 0 && (
                        <div className="mt-5 mb-2">
                            <h3 className="pb-2 pl-3 text-xs font-bold text-[#052658] uppercase">更早</h3>
                            {sessionsOlder.map(renderSessionItem)}
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="flex h-full flex-col items-center justify-center gap-5">
                        <Bot className="h-6! w-6! text-gray-500" />
                        <div className="text-md font-bold text-gray-500">暂无历史会话</div>
                    </div>
                </>
            )}
        </div>
    );
}
