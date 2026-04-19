// ==================== BFF 接口异常处理工具封装 ==================== //

// ========== React、Next、Utils ========== //
import { NextResponse } from "next/server";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

export function withErrorHandler(fn: (...args: any[]) => Promise<NextResponse>): typeof fn {
    {
        return async (...args: any[]) => {
            try {
                return await fn(...args);
            } catch (error) {
                return NextResponse.json({ code: 500, message: (error as Error).message, error: (error as Error).message }, { status: 500 });
            }
        };
    }
}
