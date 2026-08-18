import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthContext, type AuthState } from '@/auth/AuthContext'
import { ProtectedRoute, PublicRoute, NotFoundRedirect } from '@/router/guards'

// 页面/布局挂载会拉取数据，统一 mock 客户端（同 BoardPage.test 约定）。
// 注：分流测试用 MemoryRouter 而非 createMemoryRouter——数据路由导航内部
// 构造 Request，撞 jsdom 的 AbortSignal 与 Node undici 不兼容（jsdom 环境限制）
const mockGet = vi.fn()
vi.mock('@/api/client', () => ({
  default: { GET: (...args: unknown[]) => mockGet(...args) },
  setAuthToken: vi.fn()
}))

function authValue(authed: boolean, loading = false): AuthState {
  return {
    token: authed ? 't' : null,
    username: authed ? 'dev' : null,
    role: authed ? 'admin' : null,
    isAuthenticated: authed,
    loading,
    error: null,
    login: async () => {},
    logout: () => {}
  }
}

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname}</div>
}

// 路由表镜像 router.tsx 结构（守卫组件与生产同一实现，表结构随路由演进同步）
function renderAt(path: string, auth: AuthState) {
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<PublicRoute />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<div>INDEX</div>} />
            <Route path="board" element={<div>BOARD</div>} />
          </Route>
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

function currentPath() {
  return screen.getByTestId('loc').textContent
}

describe('router 分流（FINDING-022）', () => {
  afterEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue({ data: [], error: undefined })
  })

  it('未登录访问受保护页 → /login', async () => {
    renderAt('/board', authValue(false))
    await waitFor(() => expect(currentPath()).toBe('/login'))
  })

  it('已登录访问登录页 → /board', async () => {
    renderAt('/login', authValue(true))
    await waitFor(() => expect(currentPath()).toBe('/board'))
  })

  it('未知路径按登录态分流：未登录 → /login', async () => {
    renderAt('/no-such-page', authValue(false))
    await waitFor(() => expect(currentPath()).toBe('/login'))
  })

  it('未知路径按登录态分流：已登录 → /board', async () => {
    renderAt('/no-such-page', authValue(true))
    await waitFor(() => expect(currentPath()).toBe('/board'))
  })

  it('loading 中不分流（停留原路径，等会话判定）', async () => {
    renderAt('/no-such-page', authValue(false, true))
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(currentPath()).toBe('/no-such-page')
  })
})
