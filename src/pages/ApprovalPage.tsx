import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import api from '@/api/client'
import { ApprovalDialog } from '@/components/ApprovalDialog'
import { useTaskEvents } from '@/hooks/useTaskEvents'
import type { components } from '@/generated/api'

type PendingApproval = components['schemas']['PendingApproval']

export function ApprovalPage() {
  const [items, setItems] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PendingApproval | null>(null)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const toast = useRef<Toast>(null)

  async function loadItems() {
    setLoading(true)
    const { data, error } = await api.GET('/approvals/pending')
    if (error || !data) {
      const msg = error?.error ?? '加载审批列表失败'
      toast.current?.show({ severity: 'error', summary: '加载失败', detail: msg })
      setItems([])
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  // TASK-007 实时通知：状态变更事件 → 防抖重拉审批列表
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useTaskEvents(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current)
    reloadTimer.current = setTimeout(() => void loadItems(), 500)
  })

  const handleSubmit = async (action: 'approve' | 'reject', comment: string) => {
    if (!selected) return
    setSubmitting(true)
    const { data, error } = await api.POST('/tasks/{id}/action', {
      params: { path: { id: selected.task_id } },
      body: { action, comment: comment || null }
    })
    setSubmitting(false)
    if (error || !data) {
      const msg = error?.error ?? '操作失败'
      toast.current?.show({ severity: 'error', summary: '审批失败', detail: msg })
    } else {
      toast.current?.show({ severity: 'success', summary: '审批成功', detail: `${action === 'approve' ? '通过' : '驳回'} ${selected.task_id}` })
      setDialogVisible(false)
      setSelected(null)
      await loadItems()
    }
  }

  const openDialog = (item: PendingApproval) => {
    setSelected(item)
    setDialogVisible(true)
  }

  return (
    <div>
      <h2 className="text-xl mb-3">审批中心</h2>
      <Toast ref={toast} />
      {loading && items.length === 0 ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable value={items} loading={loading} paginator rows={20}>
          <Column field="task_id" header="任务 ID" sortable />
          <Column field="title" header="标题" sortable />
          <Column field="stage" header="阶段" sortable />
          <Column field="role" header="所需角色" sortable />
          <Column field="artifact" header="产物" />
          <Column field="created_at" header="提交时间" sortable />
          <Column
            header="操作"
            body={(row: PendingApproval) => (
              <Button label="审批" size="small" onClick={() => openDialog(row)} />
            )}
          />
        </DataTable>
      )}
      <ApprovalDialog
        visible={dialogVisible}
        item={selected}
        onHide={() => { setDialogVisible(false); setSelected(null) }}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
