import { useEffect, useRef, useState, useCallback } from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'

/**
 * DSHIntegrationPanel - DSH 深度集成面板
 * 
 * 通过 iframe 嵌入完整的 DSH Web 界面 (127.0.0.1:3080)
 * 实现真正的 DSH UI 复用，包括：
 * - 完整的对话界面（Conversation、Tool Call、Message Feedback）
 * - 插件管理（Plugin Inventory）
 * - Agent 预设（Agent Presets）
 * - 设置面板（Settings）
 * 
 * 与 control-web 双向通信：
 * - control-web → DSH: 通过 postMessage 传递任务上下文
 * - DSH → control-web: 通过 postMessage 通知工具执行结果
 */

interface DSHIntegrationPanelProps {
  /** DSH Web 服务地址 */
  dshUrl?: string
  /** 当前任务上下文 */
  taskContext?: {
    taskId: string
    stage: string
    status: string
  } | null
}

// DSH 消息类型定义
interface DSHMessage {
  type: 'DSH_READY' | 'DSH_TOOL_CALL' | 'DSH_ERROR' | 'DSH_SETTINGS_CHANGED' | 'DSH_PLUGIN_CHANGED'
  payload?: unknown
}

interface DSHToolCallPayload {
  tool: string
  params: Record<string, unknown>
  callId: string
}

export function DSHIntegrationPanel({ 
  dshUrl = 'http://127.0.0.1:3080',
  taskContext 
}: DSHIntegrationPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dshReady, setDshReady] = useState(false)

  // 向 DSH 发送消息
  const sendToDSH = useCallback((message: { type: string; payload?: unknown }) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, dshUrl)
    }
  }, [dshUrl])

  // 发送任务上下文到 DSH（DSH 原生界面不消费 postMessage，保留为未来 DSH 增强预留；
  // Phase 1 上下文展示由 control-web 侧 TaskContextPanel/状态栏承担）
  useEffect(() => {
    if (dshReady && taskContext) {
      sendToDSH({
        type: 'CONTROL_TASK_CONTEXT',
        payload: taskContext
      })
    }
  }, [dshReady, taskContext, sendToDSH])

  // 处理工具调用
  const handleToolCall = useCallback(async (payload: DSHToolCallPayload) => {
    const { tool, params, callId } = payload
    
    try {
      // 调用 control-api
      const token = localStorage.getItem('control_web_session')
      const response = await fetch(`http://127.0.0.1:8765/api/tools/${tool}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      })
      
      const result = await response.json()
      
      // 返回结果给 DSH
      sendToDSH({
        type: 'CONTROL_TOOL_RESULT',
        payload: {
          callId,
          success: response.ok,
          data: result
        }
      })
    } catch (err) {
      sendToDSH({
        type: 'CONTROL_TOOL_RESULT',
        payload: {
          callId,
          success: false,
          error: err instanceof Error ? err.message : '工具执行失败'
        }
      })
    }
  }, [sendToDSH])

  // 监听 DSH 消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 安全校验：只接受来自 DSH 的消息
      if (!event.origin.includes('127.0.0.1:3080') && !event.origin.includes('localhost:3080')) {
        return
      }

      const msg = event.data as DSHMessage

      switch (msg.type) {
        case 'DSH_READY':
          setDshReady(true)
          setLoading(false)
          // 发送初始配置
          sendToDSH({
            type: 'CONTROL_INIT',
            payload: {
              apiEndpoint: 'http://127.0.0.1:8765',
              token: localStorage.getItem('control_web_session')
            }
          })
          break

        case 'DSH_TOOL_CALL':
          // DSH 执行了工具调用，转发到 control-api
          void handleToolCall(msg.payload as DSHToolCallPayload)
          break

        case 'DSH_ERROR':
          setError((msg.payload as { message: string })?.message || 'DSH 错误')
          setLoading(false)
          break

        case 'DSH_SETTINGS_CHANGED':
          // DSH 设置变更，同步到 control-web
          console.log('[DSH] 设置变更:', msg.payload)
          break

        case 'DSH_PLUGIN_CHANGED':
          // DSH 插件变更
          console.log('[DSH] 插件变更:', msg.payload)
          break

        default:
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [sendToDSH, handleToolCall])

  const handleReload = () => {
    setLoading(true)
    setError(null)
    setDshReady(false)
    if (iframeRef.current) {
      iframeRef.current.src = dshUrl
    }
  }

  if (error) {
    return (
      <Card className="h-full">
        <div className="flex flex-column align-items-center justify-content-center p-5">
          <i className="pi pi-exclamation-circle text-4xl text-red-500 mb-3" />
          <p className="text-lg font-bold">DSH 加载失败</p>
          <p className="text-color-secondary">{error}</p>
          <Button
            label="重试"
            icon="pi pi-refresh"
            className="mt-3"
            onClick={handleReload}
          />
        </div>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-column">
      {/* 状态栏 */}
      <div className="flex align-items-center justify-content-between mb-2 p-2 surface-100 border-round">
        <div className="flex align-items-center gap-2">
          <span className={`w-3 h-3 border-circle ${dshReady ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm">
            DSH {dshReady ? '已连接' : '连接中...'}
          </span>
          {taskContext && (
            <span className="text-sm text-color-secondary ml-2">
              | 任务: {taskContext.taskId}
            </span>
          )}
        </div>
        <Button
          icon="pi pi-refresh"
          size="small"
          text
          onClick={handleReload}
          tooltip="重新连接 DSH"
        />
      </div>

      {/* DSH iframe */}
      <div className="relative flex-1" style={{ minHeight: '500px' }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-column align-items-center justify-content-center surface-ground">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            <p className="mt-3 text-color-secondary">正在加载 DSH...</p>
            <p className="text-xs text-color-secondary">请确保 DSH 服务已启动: dsh web</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={dshUrl}
          style={{
            width: '100%',
            // AppLayout main 无确定高度（min-h-screen 内容自适应）→ flex 高度链断裂，
            // height:100% 无效（塌陷）；改用视口高度（导航 64 + padding 32 + 页头 50 + Tab 头 48 ≈ 200，余量缓冲）
            height: 'calc(100vh - 260px)',
            minHeight: '500px',
            border: 'none',
            borderRadius: '8px'
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => {
            // DSH 原生页面不发送 DSH_READY postMessage（半成品假设导致的"DSH 加载失败"根因）；
            // iframe onLoad 即视为 DSH 就绪（完整界面已加载）。DSH_READY 监听保留兼容未来增强。
            setDshReady(true)
            setLoading(false)
          }}
          onError={() => {
            setError('无法连接到 DSH 服务 (127.0.0.1:3080)')
            setLoading(false)
          }}
        />
      </div>
    </div>
  )
}

