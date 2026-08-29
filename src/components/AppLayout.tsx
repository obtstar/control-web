import { Menubar } from 'primereact/menubar'
import { Button } from 'primereact/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { username, role, logout } = useAuth()
  const navigate = useNavigate()

  const items = [
    { label: '任务看板', icon: 'pi pi-th-large', command: () => navigate('/board') },
    { label: '审批中心', icon: 'pi pi-check-circle', command: () => navigate('/approvals') },
    { label: '审计日志', icon: 'pi pi-history', command: () => navigate('/audit') },
    { label: '问题', icon: 'pi pi-exclamation-triangle', command: () => navigate('/findings') },
    { label: 'KB 检索', icon: 'pi pi-search', command: () => navigate('/kb') },
    { label: 'API 文档', icon: 'pi pi-book', command: () => navigate('/api-docs') }
  ]

  const end = (
    <div className="flex align-items-center gap-2">
      <span className="text-sm">{username} ({role})</span>
      <Button label="注销" icon="pi pi-sign-out" size="small" text onClick={logout} />
    </div>
  )

  return (
    <div className="min-h-screen surface-ground">
      <Menubar model={items} end={end} />
      <main className="p-4">{children}</main>
    </div>
  )
}
