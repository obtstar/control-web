import { useCallback, useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { ConfirmDialog } from 'primereact/confirmdialog'
import { useRef } from 'react'
import api from '@/api/client'
import { TaskTable } from '@/components/TaskTable'
import { useTaskEvents } from '@/hooks/useTaskEvents'
import type { components } from '@/generated/api'

type Task = components['schemas']['Task']

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deliverTarget, setDeliverTarget] = useState<Task | null>(null)
  const [delivering, setDelivering] = useState(false)
  const toast = useRef<Toast>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await api.GET('/tasks')
    if (error || !data) {
      const msg = error?.error ?? '加载任务失败'
      toast.current?.show({ severity: 'error', summary: '加载失败', detail: msg })
      setTasks([])
    } else {
      setTasks(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // TASK-007 实时通知：任务状态变更事件 → 防抖重拉看板
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useTaskEvents(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(() => void load(), 500)
  })

  // 交付确认（FINDING-029）：merged → deliver，action 契约见 openapi.yaml ActionRequest
  const handleDeliver = async () => {
    if (!deliverTarget) return
    setDelivering(true)
    const { data, error } = await api.POST('/tasks/{id}/action', {
      params: { path: { id: deliverTarget.task_id } },
      body: { action: 'deliver' }
    })
    setDelivering(false)
    if (error || !data) {
      const msg = error?.error ?? '操作失败'
      toast.current?.show({ severity: 'error', summary: '交付失败', detail: msg })
    } else {
      toast.current?.show({ severity: 'success', summary: '交付成功', detail: `${deliverTarget.task_id} 已进入 deliver` })
      setDeliverTarget(null)
      await load()
    }
  }

  return (
    <div>
      <div className="flex align-items-center justify-content-between mb-3">
        <h2 className="text-xl m-0">任务看板</h2>
        <Button
          label="刷新"
          icon="pi pi-refresh"
          outlined
          onClick={() => void load()}
          disabled={loading}
        />
      </div>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={deliverTarget !== null}
        onHide={() => setDeliverTarget(null)}
        message={`确认交付 ${deliverTarget?.task_id ?? ''}？将进入 deliver 阶段由 agent 执行交付。`}
        header="交付确认"
        acceptLabel="确认交付"
        rejectLabel="取消"
        accept={() => void handleDeliver()}
        acceptClassName={delivering ? 'p-button-loading' : undefined}
      />
      {loading && tasks.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : (
        <TaskTable tasks={tasks} loading={loading} onDeliver={setDeliverTarget} />
      )}
    </div>
  )
}
