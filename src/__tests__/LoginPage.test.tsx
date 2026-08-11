import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { LoginPage } from '@/pages/LoginPage'

const mockPost = vi.fn()
vi.mock('@/api/client', () => ({
  default: { POST: (...args: unknown[]) => mockPost(...args) },
  setAuthToken: vi.fn(),
  UNAUTHORIZED_EVENT: 'control-web:unauthorized'
}))

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )
  }

  it('renders login form', () => {
    renderPage()
    expect(screen.getByLabelText('用户名')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('shows warning when fields are empty', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: '登录' })
    await userEvent.click(btn)
    await waitFor(() => {
      expect(screen.getByText('用户名和密码不能为空')).toBeInTheDocument()
    })
  })

  it('saves token and navigates on success', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', username: 'alice', role: 'designer' },
      error: undefined
    })
    renderPage()
    await userEvent.type(screen.getByLabelText('用户名'), 'alice')
    await userEvent.type(screen.getByLabelText('密码'), 'secret12')
    await userEvent.click(screen.getByRole('button', { name: '登录' }))
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('control_web_session')!).token).toBe('tok')
    })
  })

  it('shows error on failure', async () => {
    mockPost.mockResolvedValueOnce({ data: undefined, error: { error: '密码错误' } })
    renderPage()
    await userEvent.type(screen.getByLabelText('用户名'), 'alice')
    await userEvent.type(screen.getByLabelText('密码'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: '登录' }))
    await waitFor(() => {
      expect(screen.getByText('密码错误')).toBeInTheDocument()
    })
  })
})
