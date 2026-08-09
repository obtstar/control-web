import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import api, { setAuthToken } from '@/api/client'
import type { components } from '@/generated/api'

type LoginResponse = components['schemas']['LoginResponse']
type LoginRequest = components['schemas']['LoginRequest']

export interface AuthState {
  token: string | null
  username: string | null
  role: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState>({
  token: null,
  username: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {}
})

const STORAGE_KEY = 'control_web_session'

interface StoredSession {
  token: string
  username: string
  role: string
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

function saveStoredSession(session: StoredSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = readStoredSession()
    if (stored) {
      setAuthToken(stored.token)
      setSession(stored)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setError(null)
    const { data, error: apiError } = await api.POST('/auth/login', {
      body: { username, password } as LoginRequest
    })
    if (apiError) {
      const message = (apiError as { error?: string }).error ?? '登录失败'
      setError(message)
      throw new Error(message)
    }
    const res = data as LoginResponse
    const next: StoredSession = {
      token: res.token,
      username: res.username,
      role: res.role
    }
    setAuthToken(next.token)
    setSession(next)
    saveStoredSession(next)
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setSession(null)
    saveStoredSession(null)
  }, [])

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      username: session?.username ?? null,
      role: session?.role ?? null,
      isAuthenticated: !!session,
      loading,
      error,
      login,
      logout
    }),
    [session, loading, error, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
