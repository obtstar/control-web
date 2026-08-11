import { useEffect, useRef, useState } from 'react'
import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import api from '@/api/client'

// 契约文本必须经 authed client 拉取（GET /api/openapi.yaml 需 Bearer），
// 再以 content（非 url）传给 Scalar——组件自身 fetch 不带我们的会话头。
export function ApiDocsPage() {
  const [spec, setSpec] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await api.GET('/openapi.yaml', { parseAs: 'text' })
      if (cancelled) return
      if (error || !data) {
        toast.current?.show({ severity: 'error', summary: '加载失败', detail: '加载 API 契约失败' })
      } else {
        setSpec(data)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2 className="text-xl mb-3">API 文档</h2>
      <Toast ref={toast} />
      {loading ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : spec ? (
        <ApiReferenceReact configuration={{ content: spec }} />
      ) : null}
    </div>
  )
}
