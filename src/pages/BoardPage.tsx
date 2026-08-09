import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await api.GET('/tasks')
      if (cancelled) return
      if (error || !data) {
        const msg = (error as { error?: string })?.error ?? '加载任务失败'
        toast.current?.show({ severity: 'error', summary: '加载失败', detail: msg })
        setTasks([])
      } else {
        setTasks(data as Task[])
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <h2 className="text-xl mb-3">任务看板</h2>
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
