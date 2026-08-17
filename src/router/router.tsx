import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { BoardPage } from '@/pages/BoardPage'
import { ApprovalPage } from '@/pages/ApprovalPage'
import { AuditPage } from '@/pages/AuditPage'
import { FindingsPage } from '@/pages/FindingsPage'
import { KBPage } from '@/pages/KBPage'

// FINDING-021：ApiDocsPage 携带 Scalar（构建产物大头），路由级懒加载，
// 仅访问 /api-docs 时才加载对应 chunk
const ApiDocsPage = lazy(() =>
  import('@/pages/ApiDocsPage').then(m => ({ default: m.ApiDocsPage }))
)

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout><Outlet /></AppLayout>
}

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/board" replace />
  return <LoginPage />
}

function NotFoundRedirect() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  // 未知路径按登录态分流：已登录回工作台，未登录去登录页
  return <Navigate to={isAuthenticated ? '/board' : '/login'} replace />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute />
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/board" replace /> },
      { path: 'board', element: <BoardPage /> },
      { path: 'approvals', element: <ApprovalPage /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'findings', element: <FindingsPage /> },
      { path: 'kb', element: <KBPage /> },
      {
        path: 'api-docs',
        element: (
          <Suspense fallback={<div style={{ padding: '2rem' }}>API 文档加载中…</div>}>
            <ApiDocsPage />
          </Suspense>
        )
      }
    ]
  },
  { path: '*', element: <NotFoundRedirect /> }
])
