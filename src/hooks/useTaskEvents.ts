import { useEffect, useRef } from 'react'

/**
 * useTaskEvents — 订阅 control-api SSE 任务事件流（TASK-007 实时通知）
 * EventSource 无法自定义 Authorization 头，鉴权走 query token（与登录会话同源，
 * token 从 AuthContext 持久化的 localStorage 读取）。
 * 浏览器原生自动重连；收到任意 task 事件回调 onEvent（调用方防抖重拉权威列表）。
 */
const SESSION_KEY = 'control_web_session'

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as { token?: string }
    return session.token ?? null
  } catch {
    return null
  }
}

export function useTaskEvents(onEvent: () => void) {
  const cb = useRef(onEvent)
  cb.current = onEvent

  useEffect(() => {
    // jsdom 测试环境无 EventSource：跳过订阅（页面组件测试不触发）
    if (typeof EventSource === 'undefined') return
    const token = readToken()
    if (!token) return
    const es = new EventSource(`/api/events/stream?token=${encodeURIComponent(token)}`)
    es.addEventListener('task', () => cb.current())
    es.onerror = () => {
      // 浏览器自动重连；连接断开不报错（本地单用户演示，重连即恢复）
    }
    return () => es.close()
  }, [])
}
