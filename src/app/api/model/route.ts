// ==================== BFF 模型列表接口 ==================== //

// ========== React、Next、Utils ========== //
// 初始化BFF数据库，只在这里引用一次即可
import "@/bff/lib/db/initDB";
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/bff/lib/utils/error-handler";
// 获取数据库连接池对象
import dBPools from "@/bff/lib/db/initDB";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
import type { PoolClient } from "pg";
import type { Model } from "@/lib/types/app";
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

// GET 获取模型列表，支持 id 查询
export const GET = withErrorHandler(async (request: Request): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    let data: any;
    let result: Model[] | Model = [];

    // 取业务库连接池
    const chatPool = dBPools.tai_chat_db;
    // 取向量库连接池
    // const ragPool = dBPools.tai_rag_db;
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
            // 检查模型是否存在
            const { rowCount } = await dbClient.query("SELECT id FROM chat_models WHERE id = $1", [id]);
            if (rowCount === 0) {
                return NextResponse.json({ code: 404, message: "模型不存在" }, { status: 404 });
            }

            data = await dbClient.query(`SELECT id, name, label, description, api_key_key, chat_api_url, parser_type, request_options, enabled FROM chat_models WHERE enabled = 1 AND id = $1`, [id]);
            result = {
                apiKeyKey: data.rows[0]?.api_key_key || "",
                chatApiUrl: data.rows[0]?.chat_api_url || "",
                parserType: data.rows[0]?.parser_type || "",
                requestOptions: JSON.parse(data.rows[0]?.request_options || JSON.stringify({})),
            };
        } else {
            data = await dbClient.query(`SELECT id, name, label, description, chat_api_url, enabled FROM chat_models WHERE enabled = 1`);
            result = data.rows
                ? data.rows.map((model: any) => {
                      return {
                          name: model.name,
                          label: model.label,
                          description: model.description,
                      };
                  })
                : [];
        }
        return NextResponse.json({ code: 200, data: result, message: "获取模型列表成功" });
    } catch (error) {
        throw new Error(`获取模型列表失败: ${(error as Error).message}`);
    } finally {
        // 关键：无论成功/失败，都释放连接
        if (dbClient) {
            dbClient.release();
        }
    }
});
