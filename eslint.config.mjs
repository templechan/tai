import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-plugin-prettier/recommended"; // 添加这行

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier, // 集成代码格式化插件 prettier，需要添加这行，必须在最后
    {
        rules: {
            "prettier/prettier": "error", // 将 Prettier 问题视为错误（可选）
            "max-lines": [
                "error",
                {
                    // 单个文件最大行数（默认 300 行，超了报错）
                    max: 300, // 文件最大行数
                    skipBlankLines: true, // 忽略空行
                    skipComments: true, // 忽略注释
                },
            ],
            // 允许使用 any 类型（极少数时候会用到，关闭报错）
            "@typescript-eslint/no-explicit-any": "off",
            // 关闭 原生JS 未使用表达式警告（比如用了 map 但不接收返回值，纯粹遍历）
            "no-unused-expressions": "off",
            // 关闭 TypeScript 未使用表达式警告
            "@typescript-eslint/no-unused-expressions": "off",
            // 全局关闭 React Hook 依赖项警告（永远不提示）
            "react-hooks/exhaustive-deps": "off",
            // // 禁止 console.log（生产环境）
            // 'no-console': ['warn', { allow: ['warn', 'error'] }],

            // // 强制使用箭头函数
            // 'prefer-arrow-callback': 'error',

            // // 强制 const 而非 let
            // 'prefer-const': 'error',

            // // 禁止未使用的变量
            // '@typescript-eslint/no-unused-vars': ['error', {
            //   argsIgnorePattern: '^_',
            //   varsIgnorePattern: '^_'
            // }],
        },
    },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "node_modules/**",
        "public/**",
        "tmp/**",
    ]),
]);

export default eslintConfig;
