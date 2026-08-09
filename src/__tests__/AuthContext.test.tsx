import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { useContext } from 'react'
import { AuthContext, AuthProvider } from '@/auth/AuthContext'

vi.mock('@/api/client', () => ({
  default: { GET: vi.fn(), POST: vi.fn() },
  setAuthToken: vi.fn(),
  UNAUTHORIZED_EVENT: 'control-web:unauthorized'
}))

function Probe() {
  const { isAuthenticated } = useContext(AuthContext)
  return <div>{isAuthenticated ? 'authed' : 'guest'}</div>
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  )
}

describe('AuthProvider 401 logout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('logs out when unauthorized event is dispatched', async () => {
    localStorage.setItem(
      'control_web_session',
      JSON.stringify({ token: 'tok', username: 'alice', role: 'designer' })
    )
    renderProvider()
    await waitFor(() => screen.getByText('authed'))
    act(() => {
      window.dispatchEvent(new Event('control-web:unauthorized'))
    })
    await waitFor(() => {
      expect(screen.getByText('guest')).toBeInTheDocument()
    })
    expect(localStorage.getItem('control_web_session')).toBeNull()
  })

  it('is idempotent when no session exists', async () => {
    renderProvider()
    await waitFor(() => screen.getByText('guest'))
    act(() => {
      window.dispatchEvent(new Event('control-web:unauthorized'))
    })
    expect(screen.getByText('guest')).toBeInTheDocument()
    expect(localStorage.getItem('control_web_session')).toBeNull()
  })
})
