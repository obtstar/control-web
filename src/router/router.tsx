import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, NotFoundRedirect } from '@/router/guards'
import { ApiDocsElement } from '@/router/lazyPages'
import { BoardPage } from '@/pages/BoardPage'
import { ApprovalPage } from '@/pages/ApprovalPage'
import { AuditPage } from '@/pages/AuditPage'
import { FindingsPage } from '@/pages/FindingsPage'
import { KBPage } from '@/pages/KBPage'

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
      { path: 'api-docs', element: <ApiDocsElement /> }
    ]
  },
  { path: '*', element: <NotFoundRedirect /> }
])
