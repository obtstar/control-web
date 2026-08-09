import { useEffect, useState } from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import api from '@/api/client'
import { AuditTable } from '@/components/AuditTable'
import type { components } from '@/generated/api'

type AuditLog = components['schemas']['AuditLog']

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useRef<Toast>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await api.GET('/audit')
      if (cancelled) return
      if (error || !data) {
        const msg = (error as { error?: string })?.error ?? '加载审计日志失败'
        toast.current?.show({ severity: 'error', summary: '加载失败', detail: msg })
        setLogs([])
      } else {
        setLogs(data as AuditLog[])
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2 className="text-xl mb-3">审计日志</h2>
      <Toast ref={toast} />
      {loading && logs.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : (
        <AuditTable logs={logs} loading={loading} />
      )}
    </div>
  )
}
