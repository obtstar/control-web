import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiMiddleware, UNAUTHORIZED_EVENT } from '@/api/client'

function fakeResponse(status: number, url: string): Response {
  return { status, url } as Response
}

describe('apiMiddleware onResponse', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function watchEvent() {
    const handler = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, handler)
    return {
      handler,
      stop: () => window.removeEventListener(UNAUTHORIZED_EVENT, handler)
    }
  }

  it('dispatches unauthorized event on 401', () => {
    const { handler, stop } = watchEvent()
    apiMiddleware.onResponse?.(fakeResponse(401, 'http://localhost/api/tasks'), {} as never)
    stop()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not dispatch for /auth/login 401 (wrong password)', () => {
    const { handler, stop } = watchEvent()
    apiMiddleware.onResponse?.(fakeResponse(401, 'http://localhost/api/auth/login'), {} as never)
    stop()
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not dispatch on success responses', () => {
    const { handler, stop } = watchEvent()
    apiMiddleware.onResponse?.(fakeResponse(200, 'http://localhost/api/tasks'), {} as never)
    stop()
    expect(handler).not.toHaveBeenCalled()
  })
})
