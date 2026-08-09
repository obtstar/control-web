import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import type { components } from '@/generated/api'

type AuditLog = components['schemas']['AuditLog']

interface AuditTableProps {
  logs: AuditLog[]
  loading?: boolean
}

export function AuditTable({ logs, loading }: AuditTableProps) {
  return (
    <DataTable value={logs} loading={loading} paginator rows={20} sortMode="single" sortField="id" sortOrder={-1}>
      <Column field="id" header="ID" sortable />
      <Column field="task_id" header="任务 ID" sortable />
      <Column field="stage" header="阶段" sortable />
      <Column field="action" header="动作" sortable />
      <Column field="operator" header="操作人" sortable />
      <Column field="model" header="模型" sortable />
      <Column field="detail" header="详情" sortable />
      <Column field="entry_hash" header="日志哈希" sortable />
      <Column field="created_at" header="时间" sortable />
    </DataTable>
  )
}
