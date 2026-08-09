import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AppLayout } from '@/components/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { BoardPage } from '@/pages/BoardPage'
import { ApprovalPage } from '@/pages/ApprovalPage'
import { AuditPage } from '@/pages/AuditPage'

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
      { path: 'audit', element: <AuditPage /> }
    ]
  },
  { path: '*', element: <Navigate to="/login" replace /> }
])
