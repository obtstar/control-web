import { useState, useEffect, useCallback } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { StatusTag } from './StatusTag'
import api from '@/api/client'
import type { components } from '@/generated/api'

/**
 * TaskContextPanel - 任务上下文面板
 *
 * 显示任务列表，支持选择任务作为 AI 对话的上下文。
 * 与 AIChatPanel 配合使用。
 */

export type Task = components['schemas']['Task']

export interface TaskContextPanelProps {
  /** 当前选中的任务 */
  selectedTask: Task | null
  /** 选择任务回调 */
  onSelectTask: (task: Task | null) => void
  /** 初始任务 ID（从导航传入） */
  initialTaskId?: string
}

export function TaskContextPanel({ selectedTask, onSelectTask, initialTaskId }: TaskContextPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await api.GET('/tasks')
    if (error || !data) {
      setTasks([])
    } else {
      setTasks(data)
      // 如果有初始任务 ID，自动选中
      if (initialTaskId) {
        const found = data.find(t => t.task_id === initialTaskId)
        if (found) {
          onSelectTask(found)
        }
      }
    }
    setLoading(false)
  }, [initialTaskId, onSelectTask])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const statusBody = (row: Task) => <StatusTag status={row.status} />

  const actionBody = (row: Task) => (
    <Button
      icon={selectedTask?.task_id === row.task_id ? 'pi pi-check' : 'pi pi-arrow-right'}
      size="small"
      outlined={selectedTask?.task_id !== row.task_id}
      severity={selectedTask?.task_id === row.task_id ? 'success' : 'secondary'}
      onClick={() => onSelectTask(selectedTask?.task_id === row.task_id ? null : row)}
      tooltip={selectedTask?.task_id === row.task_id ? '取消选择' : '选为上下文'}
    />
  )

  return (
    <div className="flex flex-column h-full">
      <div className="flex align-items-center justify-content-between mb-3">
        <h3 className="text-lg m-0">任务列表</h3>
        <Button
          icon="pi pi-refresh"
          size="small"
          text
          onClick={() => void loadTasks()}
          loading={loading}
          tooltip="刷新"
        />
      </div>

      {selectedTask && (
        <div className="surface-100 p-3 border-round mb-3">
          <div className="text-sm font-bold mb-1">当前上下文</div>
          <div className="text-sm">
            {selectedTask.task_id}: {selectedTask.title}
          </div>
          <div className="text-xs text-color-secondary mt-1">
            {selectedTask.stage || '无阶段'} / {selectedTask.status}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <DataTable
          value={tasks}
          loading={loading}
          selectionMode="single"
          selection={selectedTask ?? undefined}
          onSelectionChange={e => onSelectTask(e.value as Task | null)}
          dataKey="task_id"
          scrollable
          scrollHeight="flex"
          size="small"
        >
          <Column field="task_id" header="ID" sortable style={{ minWidth: '80px' }} />
          <Column field="title" header="标题" sortable style={{ minWidth: '150px' }} />
          <Column field="stage" header="阶段" sortable style={{ minWidth: '80px' }} />
          <Column field="status" header="状态" body={statusBody} sortable style={{ minWidth: '100px' }} />
          <Column body={actionBody} style={{ minWidth: '60px', textAlign: 'center' }} />
        </DataTable>
      </div>
    </div>
  )
}
