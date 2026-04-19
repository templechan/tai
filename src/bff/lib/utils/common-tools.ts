// ==================== 通用工具 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

// 工具函数：万能解析（永不报错）
export const parseJson = (str: string) => {
    try {
        if (!str) return [];
        const res = JSON.parse(str);
        return Array.isArray(res) ? res : [];
    } catch {
        return [];
    }
};
