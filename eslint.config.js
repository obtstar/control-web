// eslint 强制校验配置（pre-commit hook 经 check-conventions.sh 调用 pnpm lint）
// 依据: control-api/CONVENTIONS.md §3 代码风格——静态检查全绿方可提交
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist', 'src/generated'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // react-hooks 只启用经典两条：v7 recommended 带入的 React Compiler
      // 规则集（set-state-in-effect 等）会把"effect 内加载数据"的常规写法
      // 判错，MVP 阶段不采纳
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 下划线前缀参数视为有意忽略（如 openapi-fetch 中间件签名）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
