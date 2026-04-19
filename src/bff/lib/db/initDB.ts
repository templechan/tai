// ==================== 数据库初始化脚本 ==================== //

// ========== React、Next、Utils ========== //
import { Pool, PoolClient, QueryResult } from "pg";
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// 模型厂商配置数据
import { MODEL_CONFIG_MAP, SupportedModel } from "@/bff/lib/db/modelConfig";
// ========== Hooks ========== //
// ========== Services ========== //

//  ========== 数据库连接池管理 dBPools ========== //
// 数据库连接池配置
// 连接池大小根据业务QPS调整，生产环境建议10-20；连接字符串优先从环境变量注入，避免硬编码敏感信息
const DB_POOL_CONFIGS = {
    // 默认库（postgres）：仅用于创建业务库/向量库，初始化完成后关闭
    default: {
        connectionString: `${process.env.POSTGRES_URL}/postgres`,
        max: 5,
        idleTimeoutMillis: 30000,
    },
    // 业务库：存储模型配置、会话、消息等
    tai_chat_db: {
        connectionString: `${process.env.POSTGRES_URL}/tai_chat_db`,
        max: 10, // 最大连接数（本地5 / 生产10~20，绝对不超过20）
        min: 2, // 最小空闲连接（保持2个活跃，避免反复重连）
        idleTimeoutMillis: 30000, // 空闲30秒自动释放（关键！解决ECONNRESET）
        connectionTimeoutMillis: 5000, // 连接超时5秒，快速失败
        maxUses: 1000, // 单个连接最多使用1000次（防内存泄漏）
        keepAlive: true, // 开启心跳保活
        keepAliveInitialDelayMillis: 10000, // 10秒发一次心跳
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    },
    // 向量库：存储RAG相关向量数据
    tai_rag_db: {
        connectionString: `${process.env.POSTGRES_URL}/tai_rag_db`,
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        maxUses: 1000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    },
};
// 连接池对象，后面会导出给业务使用
const dBPools = {
    default: new Pool(DB_POOL_CONFIGS.default), // 默认库连接池：仅用于创建业务库/向量库，初始化完成后关闭
    tai_chat_db: null as Pool | null, // 业务库
    tai_rag_db: null as Pool | null, // 向量库连接池
};

//  ========== 数据库初始化配置 DB_SCHEMA_CONFIGS ========== //
// 向量库核心配置
// 向量维度需匹配 embedding 模型（all-MiniLM-L6-v2 对应 384），向量索引分片数 建议为 数据量 平方根的 1-3 倍
const VECTOR_CONFIG = {
    dimension: 384, // 向量维度
    ivfflatLists: 100, // 向量索引分片数
};
// 数据库初始化配置项类型
interface DBSchemaConfig {
    dbName: keyof typeof DB_POOL_CONFIGS; // 库名，关联连接池配置
    createTableSQL: string[]; // 该库需要执行的建表/建索引SQL列表
}
// 数据库表结构初始化SQL配置
// 1. 所有表名/索引名统一前缀，避免冲突
// 2. 索引按需创建，避免冗余
// 3. 外键约束带级联删除，保证数据一致性
const DB_SCHEMA_CONFIGS: DBSchemaConfig[] = [
    {
        dbName: "tai_chat_db",
        createTableSQL: [
            `
        -- 模型配置表：存储可用的大模型元信息
        CREATE TABLE IF NOT EXISTS chat_models (
          id TEXT PRIMARY KEY,                 -- 模型唯一ID，主键保证唯一性
          name TEXT NOT NULL,                  -- 模型内部名称（与接口对接使用）
          label TEXT NOT NULL,                 -- 模型展示名称
          description TEXT NOT NULL,           -- 模型功能描述
          api_key_key VARCHAR(50) NOT NULL,  -- 密钥映射键名
          chat_api_url TEXT NOT NULL,            -- 模型对话接口地址
          parser_type VARCHAR(50) NOT NULL,  -- 解析器类型
          request_options TEXT NOT NULL,     -- 请求头配置
          enabled SMALLINT DEFAULT 1,          -- 启用状态：0=禁用 1=启用
          CHECK (enabled IN (0, 1))            -- 约束状态值只能是0/1，避免非法值
        );
        -- 索引：按启用状态查询模型，提升列表筛选效率
        CREATE INDEX IF NOT EXISTS idx_chat_models_enabled 
        ON chat_models(enabled);
      `,
            `
        -- 会话表：存储用户的聊天会话信息
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,                 -- 会话唯一ID
          title TEXT NOT NULL,                 -- 会话标题
          create_time TEXT NOT NULL             -- 创建时间（字符串格式，兼容前端时间处理）
        );
        -- 索引：按创建时间倒序查询会话，提升会话列表加载效率
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_create_time 
        ON chat_sessions (create_time DESC);
      `,
            `
        -- 对话消息表：存储会话下的单条聊天消息
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,                   -- 消息唯一ID
          session_id TEXT NOT NULL,              -- 关联会话ID
          role TEXT NOT NULL,                    -- 角色：user（用户）/assistant（助手）
          model TEXT NOT NULL,                   -- 生成消息使用的模型名称
          content TEXT NOT NULL,                 -- 消息内容
          create_time TEXT NOT NULL,              -- 消息创建时间
          docs TEXT NOT NULL,                    -- 检索到的文档列表（JSON字符串）
          CHECK (role IN ('user', 'assistant')), -- 约束角色值，避免非法角色
          -- 外键约束：关联会话表，删除会话时自动删除关联消息（级联删除）
          FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        );
        -- 复合索引：按会话ID+创建时间查询消息，提升会话消息加载效率
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_time 
        ON chat_messages (session_id, create_time ASC);
      `,
        ],
    },
    {
        dbName: "tai_rag_db",
        createTableSQL: [
            `
        -- 启用PostgreSQL向量扩展（需数据库用户有创建扩展权限）
        CREATE EXTENSION IF NOT EXISTS vector;
        
        -- 向量表：存储RAG检索所需的文本向量数据
        CREATE TABLE IF NOT EXISTS rag_vectors (
          id UUID PRIMARY KEY,                  -- 向量唯一ID（UUID保证分布式环境唯一性）
          vector vector(${VECTOR_CONFIG.dimension}) NOT NULL, -- 向量数据，维度匹配embedding模型
          metadata JSONB NOT NULL,              -- 向量元数据（如sessionId、文档ID等，JSONB支持灵活查询）
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 向量创建时间，默认当前时间
        );

        -- 索引：按会话ID查询向量，提升会话维度的检索效率
        CREATE INDEX IF NOT EXISTS idx_rag_vectors_session 
        ON rag_vectors ((metadata->>'sessionId'));
        
        -- 向量索引：基于IVFFLAT算法的余弦相似度索引，提升向量检索性能
        -- lists参数：建议为数据量平方根的1-3倍，生产环境需根据数据量调优
        CREATE INDEX IF NOT EXISTS idx_rag_vectors_vector 
        ON rag_vectors USING ivfflat (vector vector_cosine_ops) WITH (lists = ${VECTOR_CONFIG.ivfflatLists});
      `,
        ],
    },
];

//  ========== 建表/建索引SQL执行方法 executeSQL ========== //
async function executeSQL(
    client: PoolClient, // client 数据库连接客户端（从连接池获取）
    sql: string, // 待执行的SQL语句
    desc: string, // SQL操作描述（用于日志溯源）
    params: any[] = [], // SQL参数列表，默认空数组
): Promise<QueryResult> {
    try {
        return await client.query(sql, params);
    } catch (error) {
        throw new Error(`建表/建索引SQL执行失败: ${(error as Error).message}`);
    }
}

//  ========== 数据库初始化方法 initDBSchema ========== //
async function initDBSchema(): Promise<void> {
    let defaultClient: PoolClient | null = null;

    try {
        // 获取默认库连接（postgres）
        defaultClient = await dBPools.default.connect();

        // 串行遍历数据库配置
        for (const schemaConfig of DB_SCHEMA_CONFIGS) {
            const { dbName, createTableSQL } = schemaConfig;

            // 检查数据库是否存在
            const existsResult = await defaultClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

            // 不存在则创建（生产环境建议由运维提前创建，此处仅用于开发/测试环境）
            if (existsResult.rows.length === 0) {
                await defaultClient.query(`CREATE DATABASE ${dbName}`);
            }

            // 初始化当前库的连接池并连接
            dBPools[dbName] = new Pool(DB_POOL_CONFIGS[dbName]);
            const currentClient = await dBPools[dbName]!.connect();

            // 串行执行建表/建索引SQL
            for (const sql of createTableSQL) {
                await executeSQL(currentClient, sql, `[${dbName}] 建表/建索引`);
            }
            // 释放当前库客户端（归还到连接池）
            currentClient.release();
            console.log(`${dbName} 数据库表结构初始化完成 ！`);
        }
        console.log("表结构初始化全部完成 ！ \n");
    } catch (error) {
        throw new Error(`表结构初始化失败: ${(error as Error).message}`);
    } finally {
        // 释放默认库客户端 + 关闭默认池（初始化完成后不再使用）
        if (defaultClient) {
            defaultClient.release();
        }
        await dBPools.default.end();
    }
}

//  ========== 初始化基础数据方法 initDBBaseData ========== //
async function initDBBaseData(): Promise<void> {
    // 校验业务库连接池是否初始化
    if (!dBPools.tai_chat_db) {
        throw new Error("tai_chat_db 数据库连接池未初始化，无法写入基础数据 ！");
    }
    let chatClient: PoolClient | null = null;
    try {
        // 获取业务库连接
        chatClient = await dBPools.tai_chat_db.connect();

        // ===== 模型基础数据处理 =====
        const models = Object.entries(MODEL_CONFIG_MAP).map(([model, config]) => ({
            id: model as SupportedModel,
            name: model as SupportedModel,
            ...config, // 展开原有所有配置
        }));
        const total = models.length;
        // 无数据则跳过
        if (total === 0) {
            console.log("模型基础数据为空，跳过写入 ！");
            return;
        }
        // 构造 PostgreSQL 的插入语句
        // 动态生成占位符（PostgreSQL 使用 $1/$2... 而非 ?）
        const columns = ["id", "name", "label", "description", "api_key_key", "chat_api_url", "parser_type", "request_options", "enabled"];
        const placeholders = models.map((_, idx) => `(${columns.map((_, colIdx) => `$${idx * columns.length + colIdx + 1}`).join(", ")})`).join(", ");
        // 扁平化参数列表，匹配占位符顺序
        const args = models.flatMap((item) => [item.id, item.name, item.label, item.description, item.apiKeyKey, item.chatApiUrl, item.parserType, JSON.stringify(item.requestOptions), item.enabled]);
        // 执行插入（主键冲突时忽略，避免重复写入）
        const insertSQL = `
            INSERT INTO chat_models (${columns.join(", ")})
            VALUES ${placeholders}
            ON CONFLICT (id) DO NOTHING; -- PostgreSQL 兼容的去重插入
        `;
        await executeSQL(chatClient, insertSQL, "[tai_chat_db] 模型表基础数据写入", args);
        console.log(`成功写入 ${total} 条模型基础数据 ！`);

        // ===== 其他基础数据处理... =====

        console.log("基础数据初始化全部完成 ！ \n");
    } catch (error) {
        throw new Error(`基础数据初始化失败：${(error as Error).message}`);
    } finally {
        if (chatClient) {
            chatClient.release();
        }
    }
}

//  ========== 进程生命周期终止管理（避免资源泄漏） ========== //
process.on("SIGTERM", async () => {
    console.log("[进程终止] 开始关闭数据库连接池...");
    // 关闭所有业务库连接池
    await Promise.all(
        Object.values(dBPools)
            .filter(Boolean)
            .map((pool) => pool!.end()),
    );
    console.log("[进程终止] 所有连接池已关闭，退出进程");
    // 完成了所有任务，退出
    process.exit(0);
});

//  ========== 数据库初始化统一入口 initDatabase ========== //
export async function initDatabase(): Promise<typeof dBPools | undefined> {
    // 构建阶段直接跳过，不执行任何数据库操作
    if (process.env.SKIP_DB_INIT) {
        console.log("[构建模式] 跳过数据库初始化");
        return;
    }

    try {
        console.log("[数据库初始化] 执行表结构初始化 ...");
        await initDBSchema(); // 先初始化表结构
        console.log("[数据库初始化] 执行基础数据初始化 ...");
        await initDBBaseData(); // 再写入基础数据
        console.log("[数据库初始化] 初始化全部完成 !");
        return dBPools;
    } catch (error) {
        console.error("[数据库初始化失败] 数据库初始化异常，终止应用", error);
        process.exit(1); // 初始化失败终止应用，避免异常运行
    }
}

// ========== 初始化执行 ========== //
// 在 BFF 任意一个入口文件中显式调用 initDatabase()，如 `src\app\api\model\route.ts`
// 因为是全局模块，只会执行一次
initDatabase();

// ========== 导出连接池 ========== //
export default dBPools;
