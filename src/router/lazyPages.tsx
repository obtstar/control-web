import { lazy, Suspense } from 'react'

// FINDING-021：ApiDocsPage 携带 Scalar（构建产物大头），路由级懒加载，
// 仅访问 /api-docs 时才加载对应 chunk。独立文件以守 react-refresh 导出约束
const ApiDocsPage = lazy(() =>
  import('@/pages/ApiDocsPage').then(m => ({ default: m.ApiDocsPage }))
)

export function ApiDocsElement() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>API 文档加载中…</div>}>
      <ApiDocsPage />
    </Suspense>
  )
}
