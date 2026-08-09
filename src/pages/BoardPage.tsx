import { useCallback, useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import api from '@/api/client'
import { TaskTable } from '@/components/TaskTable'
import type { components } from '@/generated/api'

type Task = components['schemas']['Task']

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
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
      {loading && tasks.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : (
        <TaskTable tasks={tasks} loading={loading} />
      )}
    </div>
  )
}
