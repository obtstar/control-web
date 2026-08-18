import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'

// 分流守卫独立文件（react-refresh 约束：组件与 router 常量不混 export）。
// router 测试（MemoryRouter 驱动，FINDING-022）与生产 router.tsx 复用同一实现

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout><Outlet /></AppLayout>
}

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/board" replace />
  return <LoginPage />
}

export function NotFoundRedirect() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  // 未知路径按登录态分流：已登录回工作台，未登录去登录页
  return <Navigate to={isAuthenticated ? '/board' : '/login'} replace />
}
