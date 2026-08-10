import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { SelectButton } from 'primereact/selectbutton'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import api from '@/api/client'
import type { components } from '@/generated/api'

type Finding = components['schemas']['Finding']

const STATUS_SEVERITY: Record<Finding['status'], 'warning' | 'info' | 'success' | 'danger'> = {
  open: 'warning',
  confirmed: 'info',
  fixed: 'success',
  wontfix: 'danger'
}

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'open', value: 'open' },
  { label: 'confirmed', value: 'confirmed' },
  { label: 'fixed', value: 'fixed' },
  { label: 'wontfix', value: 'wontfix' }
]

export function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedRows, setExpandedRows] = useState<Finding[]>([])
  const toast = useRef<Toast>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await api.GET('/findings')
      if (cancelled) return
      if (error || !data) {
        const msg = error?.error ?? '加载问题一览失败'
        toast.current?.show({ severity: 'error', summary: '加载失败', detail: msg })
        setFindings([])
      } else {
        setFindings(data)
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const visible = filter === 'all' ? findings : findings.filter((f) => f.status === filter)

  const statusBody = (f: Finding) => <Tag severity={STATUS_SEVERITY[f.status]} value={f.status} />

  const rowExpansionTemplate = (f: Finding) => (
    <div className="p-3">
      <h4 className="mt-0">证据</h4>
      <p className="white-space-pre-wrap m-0">{f.evidence || '（无）'}</p>
    </div>
  )

  return (
    <div>
      <h2 className="text-xl mb-3">问题一览</h2>
      <Toast ref={toast} />
      <div className="mb-3" data-testid="status-filter">
        <SelectButton
          value={filter}
          options={FILTER_OPTIONS}
          onChange={(e) => setFilter(e.value ?? 'all')}
        />
      </div>
      {loading && findings.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={visible}
          loading={loading}
          paginator
          rows={20}
          dataKey="id"
          sortField="id"
          sortOrder={1}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data as Finding[])}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3rem' }} />
          <Column field="id" header="ID" sortable />
          <Column field="date" header="日期" sortable />
          <Column field="source" header="来源" />
          <Column field="phenomenon" header="现象" />
          <Column field="impact" header="影响" />
          <Column header="状态" body={statusBody} />
          <Column field="target" header="去向" />
        </DataTable>
      )}
    </div>
  )
}
