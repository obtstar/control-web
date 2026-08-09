import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { StatusTag } from './StatusTag'
import type { components } from '@/generated/api'

type Task = components['schemas']['Task']

interface TaskTableProps {
  tasks: Task[]
  loading?: boolean
}

export function TaskTable({ tasks, loading }: TaskTableProps) {
  return (
    <DataTable value={tasks} loading={loading} paginator rows={20} filterDisplay="row">
      <Column field="task_id" header="任务 ID" sortable filter />
      <Column field="title" header="标题" sortable filter />
      <Column field="repo_key" header="仓库" sortable filter />
      <Column field="stage" header="阶段" sortable filter />
      <Column field="status" header="状态" body={(row: Task) => <StatusTag status={row.status} />} sortable filter />
      <Column field="updated_by" header="更新人" sortable filter />
      <Column field="updated_at" header="更新时间" sortable />
    </DataTable>
  )
}
