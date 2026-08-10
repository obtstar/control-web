import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { useAuth } from '@/auth/useAuth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()
  const toast = useRef<Toast>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.current?.show({ severity: 'warn', summary: '校验失败', detail: '用户名和密码不能为空' })
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/board', { replace: true })
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: '登录失败',
        detail: error ?? (err as Error).message
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex align-items-center justify-content-center min-h-screen surface-ground">
      <Toast ref={toast} position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="surface-card p-4 shadow-2 border-round w-full max-w-30rem flex flex-column gap-3"
      >
        <h1 className="text-2xl text-center">control-web 审批工作台</h1>
        <div className="flex flex-column gap-2">
          <label htmlFor="username">用户名</label>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            autoFocus
            className="w-full"
          />
        </div>
        <div className="flex flex-column gap-2">
          <label htmlFor="password">密码</label>
          <Password
            inputId="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName="w-full"
            pt={{ iconField: { root: { className: 'w-full' } } }}
          />
        </div>
        <Button label="登录" type="submit" loading={submitting} />
      </form>
    </div>
  )
}
