"use client";

// ==================== 前端文档解析工具 ==================== //

// ========== React、Next、Utils ========== //
// 依赖 mammoth pdfjs-dist，这里是动态导入，所以你需要提前安装
// `pnpm install mammoth pdfjs-dist`
// ========== Components、CSS ========== //
// ========== Icon、Type ========== //
// ========== Stroe、Constants ========== //
// ========== Hooks ========== //
// ========== Services ========== //

export interface ParseProgress {
    progress: number;
}

export interface ParseResult {
    text: string;
    fileType: string;
    file: File;
    success: boolean;
    error?: string;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"] as const;
export const ALLOWED_MIME_TYPES = ["text/plain", "text/markdown", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/pdf"];
export const ERROR_MESSAGES = {
    FILE_TOO_LARGE: `文件大小超出限制，最大支持 ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)} MB`, // TXT、MD、DOCX、PDF
    INVALID_TYPE: "不支持的文件格式，请上传 .txt、.md、.docx、.pdf 文件", // TXT、MD、DOCX、PDF
    EMPTY_FILE: "文件内容为空，无法提取文本", // TXT、MD、DOCX、PDF
    NO_EXTRACTED_TEXT: "文件解析完成，但未提取到有效文本", // TXT、MD、DOCX、PDF
    PARSE_FAILED: "文件解析失败，请检查文件完整性", // TXT、MD
    CORRUPTED_FILE: "文件已损坏或格式错误", // DOCX、PDF
    ENCRYPTED_PDF: "PDF 文件已加密，无法解析", // PDF
} as const;

class UniversalFileParser {
    private isPdfInitialized = false;

    constructor() {
        if (typeof window !== "undefined") this.initPdfParser();
    }

    /**
     * pdfjs-dist 解析包初始化
     * 提前准备：需要把 `/node_modules/pdfjs-dist/build/pdf.worker.min.mjs` 复制到 `/assets/pdf-worker/` 下
     */
    private initPdfParser = async () => {
        if (this.isPdfInitialized) return;
        try {
            const pdfjs = await import("pdfjs-dist");
            // 直接使用你项目里的本地静态文件路径
            pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdf-worker/pdf.worker.min.mjs";
            this.isPdfInitialized = true;
        } catch (error) {
            throw new Error(`pdfjs-dist 解析包初始化失败: ${(error as Error).message}`);
        }
    };

    // 文件校验：文件大小、文件类型、文件内容非空
    private validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) return ERROR_MESSAGES.FILE_TOO_LARGE;
        const fileName = file.name.toLowerCase();
        const isValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
        const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
        if (!isValidExt && !isValidMime) return ERROR_MESSAGES.INVALID_TYPE;
        if (file.size === 0) return ERROR_MESSAGES.EMPTY_FILE;
        return null;
    };

    // 解析 TXT / MD
    private parseText = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onerror = () => reject(ERROR_MESSAGES.PARSE_FAILED);
            reader.onload = (e) => {
                const text = e.target?.result as string;
                text.trim() ? resolve(text) : reject(ERROR_MESSAGES.NO_EXTRACTED_TEXT);
            };
        });
    };

    // 解析 DOCX
    private parseDocx = async (file: File): Promise<string> => {
        try {
            const mammoth = await import("mammoth");
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            if (result.value.trim()) {
                return result.value.trim();
            } else {
                throw new Error(ERROR_MESSAGES.NO_EXTRACTED_TEXT);
            }
        } catch {
            throw new Error(ERROR_MESSAGES.CORRUPTED_FILE);
        }
    };

    // 解析 PDF（纯本地、带进度、内存安全）
    private parsePdf = async (file: File, onProgress?: (progress: ParseProgress) => void): Promise<string> => {
        if (!this.isPdfInitialized) await this.initPdfParser();
        const pdfjs = await import("pdfjs-dist");
        const arrayBuffer = await file.arrayBuffer();
        let pdfInstance = null;

        try {
            pdfInstance = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdfInstance.numPages;
            let fullText = "";

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdfInstance.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
                onProgress?.({ progress: i / totalPages });
            }
            if (fullText.trim()) {
                return fullText.trim();
            } else {
                throw new Error(ERROR_MESSAGES.NO_EXTRACTED_TEXT);
            }
        } catch (err) {
            if ((err as Error).message.includes("password")) throw new Error(ERROR_MESSAGES.ENCRYPTED_PDF);
            throw new Error(ERROR_MESSAGES.CORRUPTED_FILE);
        } finally {
            if (pdfInstance) pdfInstance.destroy();
        }
    };

    // 统一解析入口
    parse = async (file: File, onProgress?: (progress: ParseProgress) => void): Promise<ParseResult> => {
        try {
            const validateError = this.validateFile(file);
            if (validateError) return { text: "", fileType: "", file, success: false, error: validateError };

            const fileName = file.name.toLowerCase();
            let text = "";
            let fileType = "";
            if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
                text = await this.parseText(file);
                if (fileName.endsWith(".txt")) {
                    fileType = "txt";
                } else {
                    fileType = "md";
                }
            } else if (fileName.endsWith(".docx")) {
                text = await this.parseDocx(file);
                fileType = "docx";
            } else if (fileName.endsWith(".pdf")) {
                text = await this.parsePdf(file, onProgress);
                fileType = "pdf";
            }

            return { text, fileType, file, success: true };
        } catch (err: any) {
            return { text: "", fileType: "", file, success: false, error: err.message || ERROR_MESSAGES.PARSE_FAILED };
        }
    };
}

export const browserParser = new UniversalFileParser();
