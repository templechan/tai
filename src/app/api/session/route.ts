// ==================== BFF 会话列表接口 ==================== //

// ========== React、Next、Utils ========== //
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/bff/lib/utils/error-handler";
import { v4 as uuidv4 } from "uuid";
// 获取数据库连接池对象
import dBPools from "@/bff/lib/db/initDB";
import { parseJson } from "@/bff/lib/utils/common-tools";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { PoolClient } from "pg";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

//  POST - 新增会话
export const POST = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const title: string = (await request.json()).title;
    let result: string = "";
    let data: any;

    // 取业务库连接池
    const chatPool = dBPools.tai_chat_db;
    // 校验业务库连接池是否初始化
    if (!chatPool) {
        throw new Error("tai_chat_db 数据库连接池未初始化 ！");
    }
    // 声明连接变量
    let dbClient: PoolClient | null = null;

    try {
        // 获取数据库连接
        dbClient = await chatPool.connect();

        // 校验
        if (!title) {
            return NextResponse.json({ code: 400, message: "会话数据标题不能为空" }, { status: 400 });
        }

        // 插入 chat_sessions 表
        data = await dbClient.query(`INSERT INTO chat_sessions (id, title, create_time) VALUES ($1, $2, $3) RETURNING id`, [uuidv4(), title, new Date().toISOString()]);

        result = data.rows[0].id;
        return NextResponse.json({ code: 200, data: { id: result }, message: "新增会话成功" });
    } catch (error) {
        throw new Error(`新增会话失败: ${(error as Error).message}`);
    } finally {
        // 关键：无论成功/失败，都释放连接
        if (dbClient) {
            dbClient.release();
        }
    }
});

// DELETE - 删除会话
export const DELETE = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // 取业务库连接池
    const chatPool = dBPools.tai_chat_db;
    // 校验业务库连接池是否初始化
    if (!chatPool) {
        throw new Error("tai_chat_db 数据库连接池未初始化 ！");
    }
    // 声明连接变量
    let dbClient: PoolClient | null = null;

    try {
        // 获取数据库连接
        dbClient = await chatPool.connect();

        // 前置校验
        if (!id) {
            return NextResponse.json({ code: 400, message: "会话ID不能为空" }, { status: 400 });
        }
        const currentSessionData = await dbClient.query("SELECT id FROM chat_sessions WHERE id = $1", [id]);
        if (currentSessionData.rowCount === 0) {
            return NextResponse.json({ code: 404, message: "会话不存在" }, { status: 404 });
        }

        // 删除会话（messages表会通过外键级联删除）
        await dbClient.query("DELETE FROM chat_sessions WHERE id = $1", [id]);

        return NextResponse.json({ code: 200, message: "删除会话成功" });
    } catch (error) {
        throw new Error(`删除会话失败: ${(error as Error).message}`);
    } finally {
        // 关键：无论成功/失败，都释放连接
        if (dbClient) {
            dbClient.release();
        }
    }
});

// PATCH - 修改会话，包括重命名、新增聊天数据
export const PATCH = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { title, message } = await request.json();

    // 取业务库连接池
    const chatPool = dBPools.tai_chat_db;
    // 校验业务库连接池是否初始化
    if (!chatPool) {
        throw new Error("tai_chat_db 数据库连接池未初始化 ！");
    }
    // 声明连接变量
    let dbClient: PoolClient | null = null;

    try {
        // 获取数据库连接
        dbClient = await chatPool.connect();

        // 前置校验
        if (!id) {
            return NextResponse.json({ code: 400, message: "会话ID不能为空" }, { status: 400 });
        }
        const currentSessionData = await dbClient.query("SELECT id FROM chat_sessions WHERE id = $1", [id]);
        if (currentSessionData.rowCount === 0) {
            await dbClient.query("ROLLBACK");
            return NextResponse.json({ code: 404, message: "会话不存在" }, { status: 404 });
        }

        await dbClient.query("BEGIN");

        if (title) {
            // 更新会话（重命名）
            await dbClient.query(`UPDATE chat_sessions SET title = $1 WHERE id = $2`, [title, id]);
        } else if (message) {
            console.log("插入", message.id, id, message.role, message.model, message.content, message.createTime, message.docs?.length ? JSON.stringify(message.docs) : "");
            // 更新会话（新增会话聊天数据）

            // 批量插入 chat_messages 表
            const placeholders = "$1, $2, $3, $4, $5, $6, $7";
            const args = [message.id, id, message.role, message.model, message.content, message.createTime, message.docs?.length ? JSON.stringify(message.docs) : ""];
            await dbClient.query(`INSERT INTO chat_messages (id, session_id, role, model, content, create_time, docs) VALUES (${placeholders})`, args);
        }

        await dbClient.query("COMMIT");

        return NextResponse.json({ code: 200, message: "更新会话成功" });
    } catch (error) {
        // 出错回滚
        if (dbClient) await dbClient.query("ROLLBACK");
        throw new Error(`更新会话失败: ${(error as Error).message}`);
    } finally {
        // 关键：无论成功/失败，都释放连接
        if (dbClient) {
            dbClient.release();
        }
    }
});

//  GET - 获取单个会话详情 或 会话列表，支持 id 查询
export const GET = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    let result: any[] | any = [];
    const messages: any[] = [];
    let data: any;

    // 取业务库连接池
    const chatPool = dBPools.tai_chat_db;
    // 校验业务库连接池是否初始化
    if (!chatPool) {
        throw new Error("tai_chat_db 数据库连接池未初始化 ！");
    }
    // 声明连接变量
    let dbClient: PoolClient | null = null;

    try {
        // 获取数据库连接
        dbClient = await chatPool.connect();

        if (id) {
            // 获取单个会话详情

            // 前置校验
            const { rowCount } = await dbClient.query("SELECT id FROM chat_sessions WHERE id = $1", [id]);
            if (rowCount === 0) {
                return NextResponse.json({ code: 404, message: "会话不存在" }, { status: 404 });
            }

            data = await dbClient.query(
                `
                SELECT 
                    s.id,
                    s.title,
                    s.create_time,
                    COALESCE(
                    json_agg(
                        json_build_object(
                        'id', m.id,
                        'role', m.role,
                        'model', m.model,
                        'content', m.content,
                        'create_time', m.create_time,
                        'docs', m.docs
                        )
                    ) FILTER (WHERE m.id IS NOT NULL),
                    '[]'::json
                    ) AS messages
                FROM chat_sessions s
                LEFT JOIN chat_messages m ON s.id = m.session_id
                WHERE s.id = $1
                GROUP BY s.id, s.title, s.create_time
                `,
                [id],
            );

            const row = data.rows[0];

            result = {
                id: row.id,
                title: row.title,
                createTime: row.create_time,
                messages: row.messages || [],
            };

            result.messages = result.messages.map((msg: { docs: string }) => ({
                ...msg,
                // 解析 docs（兼容空值/错误格式）
                docs: parseJson(msg.docs),
            }));
        } else {
            // 获取会话列表
            data = await dbClient.query(`SELECT id, title, create_time FROM chat_sessions ORDER BY create_time DESC`);
            result = data.rows
                ? data.rows.map((session: any) => {
                      return {
                          id: session.id,
                          title: session.title,
                          createTime: session.create_time,
                          messages,
                      };
                  })
                : [];
        }

        return NextResponse.json({ code: 200, data: result, message: "获取会话成功" });
    } catch (error) {
        throw new Error(`获取会话失败: ${(error as Error).message}`);
    } finally {
        // 关键：无论成功/失败，都释放连接
        if (dbClient) {
            dbClient.release();
        }
    }
});
