import createClient from 'openapi-fetch'
import type { paths } from '@/generated/api'

let currentToken: string | null = null

const api = createClient<paths>({ baseUrl: '/api' })

api.use({
  onRequest(req, _options) {
    if (currentToken) {
      req.headers.set('Authorization', `Bearer ${currentToken}`)
    }
    return req
  }
})

export function setAuthToken(token: string | null) {
  currentToken = token
}

export function getAuthToken(): string | null {
  return currentToken
}

export default api
