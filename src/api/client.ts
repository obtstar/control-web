import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from '@/generated/api'

let currentToken: string | null = null

/** 收到 401 时广播的自定义事件，AuthContext 监听后执行登出 */
export const UNAUTHORIZED_EVENT = 'control-web:unauthorized'

export const apiMiddleware: Middleware = {
  onRequest(req, _options) {
    if (currentToken) {
      req.headers.set('Authorization', `Bearer ${currentToken}`)
    }
    return req
  },
  onResponse(res, _options) {
    // /auth/login 自身的 401（密码错误）不触发登出，此时本就无会话
    if (res.status === 401 && !res.url.endsWith('/auth/login')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return res
  }
}

const api = createClient<paths>({ baseUrl: '/api' })

api.use(apiMiddleware)

export function setAuthToken(token: string | null) {
  currentToken = token
}

export function getAuthToken(): string | null {
  return currentToken
}

export default api
