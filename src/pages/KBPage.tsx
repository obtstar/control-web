import { useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import api from '@/api/client'
import type { components } from '@/generated/api'

type KBHit = components['schemas']['KBHit']

export function KBPage() {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<KBHit[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const toast = useRef<Toast>(null)

  async function search() {
    const q = query.trim()
    if (!q) {
      toast.current?.show({ severity: 'warn', summary: '请输入检索词' })
      return
    }
    setLoading(true)
    const { data, error } = await api.GET('/kb/search', { params: { query: { q, limit: 20 } } })
    if (error || !data) {
      const msg = error?.error ?? 'KB 检索失败'
      toast.current?.show({ severity: 'error', summary: '检索失败', detail: msg })
      setHits([])
    } else {
      setHits(data)
    }
    setSearched(true)
    setLoading(false)
  }

  const layerBody = (h: KBHit) => <Tag value={h.layer} />
  const kindBody = (h: KBHit) => <Tag value={h.kind} severity="info" />

  return (
    <div>
      <h2 className="text-xl mb-3">KB 检索</h2>
      <Toast ref={toast} />
      <div className="flex gap-2 mb-3">
        <InputText
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void search() }}
          placeholder="检索知识库…"
          className="w-20rem"
          data-testid="kb-search-input"
        />
        <Button label="检索" icon="pi pi-search" onClick={() => void search()} loading={loading} />
      </div>
      {loading && hits.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : searched ? (
        <DataTable value={hits} dataKey="id" emptyMessage="未命中或 KB 为空">
          <Column field="title" header="标题" />
          <Column header="层" body={layerBody} style={{ width: '6rem' }} />
          <Column header="类型" body={kindBody} style={{ width: '6rem' }} />
          <Column field="snippet" header="摘要" />
          <Column field="path" header="路径" />
        </DataTable>
      ) : null}
    </div>
  )
}
