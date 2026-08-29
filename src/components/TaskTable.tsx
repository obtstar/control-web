import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { useMemo } from 'react'
import { StatusTag } from './StatusTag'
import type { components } from '@/generated/api'

type Task = components['schemas']['Task']

interface TaskTableProps {
  tasks: Task[]
  loading?: boolean
  // onDeliver 交付确认入口（FINDING-029）：仅 merged（已合并待交付）行显示
  onDeliver?: (task: Task) => void
  // onAiAssist AI 协助入口（TASK-008 Phase 2 / TASK-000016）：跳 /ai 带任务上下文
  onAiAssist?: (taskId: string) => void
}

type FilterKey = 'repo_key' | 'stage' | 'status' | 'updated_by'

// 唯一值列表（去重排序，供下拉筛选）
function useUniqueValues(tasks: Task[], key: FilterKey): string[] {
  return useMemo(
    () => [...new Set(tasks.map((t) => String(t[key] ?? '')).filter(Boolean))].sort(),
    [tasks, key]
  )
}

export function TaskTable({ tasks, loading, onDeliver, onAiAssist }: TaskTableProps) {
  const repoOptions = useUniqueValues(tasks, 'repo_key')
  const stageOptions = useUniqueValues(tasks, 'stage')
  const statusOptions = useUniqueValues(tasks, 'status')
  const updatedByOptions = useUniqueValues(tasks, 'updated_by')

  // 下拉筛选组件（精确匹配 + 清空）
  const dropdownFilter = (options: { value: unknown; filterApplyCallback: (v: unknown) => void }, values: string[]) => (
    <Dropdown
      value={options.value as string | null}
      options={values}
      onChange={(e) => options.filterApplyCallback(e.value)}
      placeholder="全部"
      showClear
      className="w-full"
    />
  )

  return (
    <DataTable value={tasks} loading={loading} paginator rows={20} filterDisplay="row">
      <Column field="task_id" header="任务 ID" sortable filter />
      <Column field="title" header="标题" sortable filter />
      <Column field="repo_key" header="仓库" sortable filter filterMatchMode="equals" filterElement={(o) => dropdownFilter(o, repoOptions)} />
      <Column field="stage" header="阶段" sortable filter filterMatchMode="equals" filterElement={(o) => dropdownFilter(o, stageOptions)} />
      <Column field="status" header="状态" body={(row: Task) => <StatusTag status={row.status} />} sortable filter filterMatchMode="equals" filterElement={(o) => dropdownFilter(o, statusOptions)} />
      <Column field="updated_by" header="更新人" sortable filter filterMatchMode="equals" filterElement={(o) => dropdownFilter(o, updatedByOptions)} />
      <Column field="updated_at" header="更新时间" sortable />
      {onDeliver && (
        <Column
          header="操作"
          body={(row: Task) =>
            row.status === 'merged' ? (
              <Button label="交付" size="small" onClick={() => onDeliver(row)} />
            ) : null
          }
        />
      )}
      {onAiAssist && (
        <Column
          header="AI"
          style={{ width: '70px' }}
          body={(row: Task) => (
            <Button
              icon="pi pi-sparkles"
              size="small"
              text
              tooltip="AI 协助"
              onClick={() => onAiAssist(row.task_id)}
            />
          )}
        />
      )}
    </DataTable>
  )
}
