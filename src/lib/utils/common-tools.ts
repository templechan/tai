// ==================== 通用工具 ==================== //

// ========== React、Next、Utils ========== //
// ========== Components、CSS ========== //
import { toast } from "sonner";
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

// 文件大小单位转换：B → KB → MB
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// 复制文本到剪贴板
export const copyToClipboard = async (text: string) => {
    try {
        // 尝试使用 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            toast.success("复制成功");
        } else {
            // 降级方案：创建临时输入框并复制
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand("copy");
                toast.success("复制成功");
            } catch (err) {
                console.error("复制失败:", err);
                toast.error("复制失败");
            } finally {
                document.body.removeChild(textArea);
            }
        }
    } catch (error) {
        console.error("复制失败:", error);
        toast.error("复制失败");
    }
};
